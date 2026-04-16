import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FLW_SECRET = Deno.env.get("FLUTTERWAVE_SECRET_KEY");

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user   = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!FLW_SECRET) {
    return Response.json({ error: "billing_not_configured", message: "Flutterwave not configured." }, { status: 503 });
  }

  const { transaction_id, plan } = await req.json();
  if (!transaction_id || !plan) {
    return Response.json({ error: "Missing transaction_id or plan" }, { status: 400 });
  }

  // Verify with Flutterwave
  const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
    headers: { Authorization: `Bearer ${FLW_SECRET}` },
  });

  const verifyData = await verifyRes.json();

  if (verifyData.status !== "success" || verifyData.data?.status !== "successful") {
    return Response.json({ error: "Payment verification failed", details: verifyData }, { status: 400 });
  }

  const txData = verifyData.data;

  // Security: confirm meta matches
  if (txData.meta?.user_id !== user.id || txData.meta?.plan !== plan) {
    return Response.json({ error: "Payment metadata mismatch" }, { status: 403 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  const startedAt = new Date().toISOString();
  const expiresAtStr = expiresAt.toISOString();

  // Update user plan
  await base44.auth.updateMe({
    plan,
    plan_expires_at: expiresAtStr,
    payment_provider: "flutterwave",
  });

  // Record payment as successful
  const existingPayments = await base44.asServiceRole.entities.Payment.filter({ tx_ref: txData.tx_ref || "" });
  if (existingPayments.length > 0) {
    await base44.asServiceRole.entities.Payment.update(existingPayments[0].id, {
      status: "success",
      gateway_tx_id: String(transaction_id),
      raw_response: JSON.stringify(txData),
    });
  } else {
    await base44.asServiceRole.entities.Payment.create({
      user_id: user.id,
      user_email: user.email,
      gateway: "flutterwave",
      tx_ref: txData.tx_ref || String(transaction_id),
      gateway_tx_id: String(transaction_id),
      amount: txData.amount || 0,
      currency: txData.currency || "USD",
      plan,
      status: "success",
      raw_response: JSON.stringify(txData),
    });
  }

  // Create Subscription record
  await base44.asServiceRole.entities.Subscription.create({
    user_id: user.id,
    user_email: user.email,
    plan_name: plan,
    billing_gateway: "flutterwave",
    billing_cycle: "monthly",
    amount: txData.amount || 0,
    currency: txData.currency || "USD",
    status: "active",
    started_at: startedAt,
    expires_at: expiresAtStr,
  });

  return Response.json({ success: true, plan, expires_at: expiresAtStr });
});