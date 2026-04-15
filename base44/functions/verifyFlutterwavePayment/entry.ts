import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FLW_SECRET = Deno.env.get("FLUTTERWAVE_SECRET_KEY");

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { transaction_id, plan } = await req.json();
  if (!transaction_id || !plan) {
    return Response.json({ error: "Missing transaction_id or plan" }, { status: 400 });
  }

  // Verify with Flutterwave
  const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
    headers: { Authorization: `Bearer ${FLW_SECRET}` },
  });

  const verifyData = await verifyRes.json();

  if (verifyData.status !== "success" || verifyData.data.status !== "successful") {
    return Response.json({ error: "Payment verification failed", details: verifyData }, { status: 400 });
  }

  const txData = verifyData.data;

  // Security: confirm meta matches
  if (txData.meta?.user_id !== user.id || txData.meta?.plan !== plan) {
    return Response.json({ error: "Payment metadata mismatch" }, { status: 403 });
  }

  // Calculate expiry (30 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Update user plan
  await base44.auth.updateMe({
    plan,
    plan_expires_at: expiresAt.toISOString(),
    payment_provider: "flutterwave",
  });

  return Response.json({ success: true, plan, expires_at: expiresAt.toISOString() });
});