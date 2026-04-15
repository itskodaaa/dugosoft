import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const WEBHOOK_SECRET = Deno.env.get("FLUTTERWAVE_WEBHOOK_SECRET");
const FLW_SECRET = Deno.env.get("FLUTTERWAVE_SECRET_KEY");

Deno.serve(async (req) => {
  // Verify webhook signature
  const signature = req.headers.get("verif-hash");
  if (!signature || signature !== WEBHOOK_SECRET) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const base44 = createClientFromRequest(req);
  const body = await req.json();

  const { event, data } = body;

  if (event === "charge.completed" && data.status === "successful") {
    const userId = data.meta?.user_id;
    const plan = data.meta?.plan;

    if (!userId || !plan) {
      return Response.json({ error: "Missing meta" }, { status: 400 });
    }

    // Verify transaction server-side
    const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${data.id}/verify`, {
      headers: { Authorization: `Bearer ${FLW_SECRET}` },
    });
    const verifyData = await verifyRes.json();

    if (verifyData.status !== "success" || verifyData.data.status !== "successful") {
      return Response.json({ error: "Transaction verification failed" }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    if (users.length > 0) {
      await base44.asServiceRole.entities.User.update(users[0].id, {
        plan,
        plan_expires_at: expiresAt.toISOString(),
        payment_provider: "flutterwave",
      });
    }
  }

  return Response.json({ received: true });
});