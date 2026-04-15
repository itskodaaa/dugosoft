import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

// Server-side authoritative pricing — use price IDs per region/plan
// Set these secrets in your dashboard:
// STRIPE_PRICE_PRO_GLOBAL, STRIPE_PRICE_BUSINESS_GLOBAL
// STRIPE_PRICE_PRO_AFRICA, STRIPE_PRICE_BUSINESS_AFRICA
const STRIPE_PRICES = {
  global: {
    pro:      Deno.env.get("STRIPE_PRICE_PRO_GLOBAL")      || Deno.env.get("STRIPE_PRICE_PRO")      || "price_pro_global",
    business: Deno.env.get("STRIPE_PRICE_BUSINESS_GLOBAL") || Deno.env.get("STRIPE_PRICE_BUSINESS") || "price_business_global",
  },
  africa: {
    pro:      Deno.env.get("STRIPE_PRICE_PRO_AFRICA")      || "price_pro_africa",
    business: Deno.env.get("STRIPE_PRICE_BUSINESS_AFRICA") || "price_business_africa",
  },
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { plan, region } = await req.json();
  if (!plan || !["pro", "business"].includes(plan)) {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Backend validates region
  const userRegion = region && ["global", "africa"].includes(region) ? region : (user.user_region || "global");
  const priceId = STRIPE_PRICES[userRegion][plan];
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
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/pricing?status=success&plan=${plan}&provider=stripe`,
    cancel_url: `${origin}/dashboard/pricing?status=cancelled`,
    metadata: { user_id: user.id, plan, region: userRegion },
  });

  return Response.json({ checkout_url: session.url, session_id: session.id });
});