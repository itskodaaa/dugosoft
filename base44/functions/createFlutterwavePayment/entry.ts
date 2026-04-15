import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FLW_SECRET = Deno.env.get("FLUTTERWAVE_SECRET_KEY");

const PLAN_PRICES = {
  pro: { amount: 12, name: "Dugosoft Pro Plan" },
  business: { amount: 29, name: "Dugosoft Business Plan" },
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  if (!plan || !PLAN_PRICES[plan]) {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planInfo = PLAN_PRICES[plan];
  const txRef = `dugosoft-${plan}-${user.id}-${Date.now()}`;

  const payload = {
    tx_ref: txRef,
    amount: planInfo.amount,
    currency: "USD",
    redirect_url: `${req.headers.get("origin") || "https://app.dugosoft.com"}/dashboard/pricing?status=success&plan=${plan}&tx_ref=${txRef}`,
    customer: {
      email: user.email,
      name: user.full_name || user.email,
    },
    customizations: {
      title: "Dugosoft",
      description: planInfo.name,
      logo: "https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/3cd00a9ca_Gemini_Generated_Image_6abwj06abwj06abw-removebg-preview.png",
    },
    meta: {
      user_id: user.id,
      plan,
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

  return Response.json({ payment_link: data.data.link, tx_ref: txRef });
});