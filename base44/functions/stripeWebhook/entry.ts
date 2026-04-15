import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const PLAN_FROM_PRICE = {
  [Deno.env.get("STRIPE_PRICE_PRO") || "price_pro_placeholder"]: "pro",
  [Deno.env.get("STRIPE_PRICE_BUSINESS") || "price_business_placeholder"]: "business",
};

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    return Response.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  const updateUserPlan = async (userId, plan, expiresAt) => {
    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    if (users.length > 0) {
      await base44.asServiceRole.entities.User.update(users[0].id, {
        plan,
        plan_expires_at: expiresAt,
        payment_provider: "stripe",
      });
    }
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.payment_status === "paid") {
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;
        if (userId && plan) {
          // Store subscription ID
          const users = await base44.asServiceRole.entities.User.filter({ id: userId });
          if (users.length > 0) {
            await base44.asServiceRole.entities.User.update(users[0].id, {
              stripe_subscription_id: session.subscription,
            });
          }
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          await updateUserPlan(userId, plan, expiresAt.toISOString());
        }
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      const sub = await stripe.subscriptions.retrieve(invoice.subscription);
      const userId = sub.metadata?.user_id || sub.customer_metadata?.user_id;
      const priceId = sub.items.data[0]?.price?.id;
      const plan = PLAN_FROM_PRICE[priceId];
      if (userId && plan) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await updateUserPlan(userId, plan, expiresAt.toISOString());
      }
      break;
    }

    case "invoice.payment_failed": {
      // Optionally notify user or downgrade — we leave plan until expiry
      console.log("Payment failed for invoice:", event.data.object.id);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const customers = await stripe.customers.list({ limit: 1, email: undefined });
      // Find user by stripe_customer_id
      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: sub.customer });
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          plan: "free",
          plan_expires_at: null,
          stripe_subscription_id: null,
          payment_provider: "none",
        });
      }
      break;
    }
  }

  return Response.json({ received: true });
});