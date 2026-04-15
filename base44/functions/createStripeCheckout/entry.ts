import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

// These price IDs must be created in your Stripe dashboard (recurring monthly prices)
// Set them as secrets or replace with your actual price IDs
const STRIPE_PRICES = {
  pro: Deno.env.get("STRIPE_PRICE_PRO") || "price_pro_placeholder",
  business: Deno.env.get("STRIPE_PRICE_BUSINESS") || "price_business_placeholder",
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  if (!plan || !STRIPE_PRICES[plan]) {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  const origin = req.headers.get("origin") || "https://app.dugosoft.com";

  // Get or create Stripe customer
  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.full_name || user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await base44.auth.updateMe({ stripe_customer_id: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: STRIPE_PRICES[plan], quantity: 1 }],
    success_url: `${origin}/dashboard/pricing?status=success&plan=${plan}&provider=stripe`,
    cancel_url: `${origin}/dashboard/pricing?status=cancelled`,
    metadata: { user_id: user.id, plan },
    payment_method_options: {
      card: { request_three_d_secure: "automatic" },
    },
  });

  return Response.json({ checkout_url: session.url, session_id: session.id });
});