import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FLW_SECRET = Deno.env.get("FLUTTERWAVE_SECRET_KEY");

// Server-side authoritative pricing — never trust frontend amounts
const REGION_PRICES = {
  global: { pro: 12, business: 29 },
  africa: { pro: 4,  business: 12 },
};

const PLAN_NAMES = {
  pro: "Dugosoft Pro Plan",
  business: "Dugosoft Business Plan",
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { plan, region } = await req.json();
  if (!plan || !["pro", "business"].includes(plan)) {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Backend validates the region — fall back to user's saved region or global
  const userRegion = region && ["global", "africa"].includes(region) ? region : (user.user_region || "global");
  const amount = REGION_PRICES[userRegion][plan];

  const txRef = `dugosoft-${plan}-${user.id}-${Date.now()}`;

  const payload = {
    tx_ref: txRef,
    amount,
    currency: "USD",
    redirect_url: `${req.headers.get("origin") || "https://app.dugosoft.com"}/dashboard/pricing?status=success&plan=${plan}&tx_ref=${txRef}`,
    customer: {
      email: user.email,
      name: user.full_name || user.email,
    },
    customizations: {
      title: "Dugosoft",
      description: `${PLAN_NAMES[plan]} ($${amount}/mo)`,
      logo: "https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/3cd00a9ca_Gemini_Generated_Image_6abwj06abwj06abw-removebg-preview.png",
    },
    meta: {
      user_id: user.id,
      plan,
      region: userRegion,
      expected_amount: amount,
    },
  };

  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (data.status !== "success") {
    return Response.json({ error: data.message || "Failed to create payment link" }, { status: 500 });
  }

  return Response.json({ payment_link: data.data.link, tx_ref: txRef, amount, region: userRegion });
});