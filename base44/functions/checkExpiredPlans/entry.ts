import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled function: run daily to revert expired plans to free
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Must be called by scheduler (no user auth)
  const allUsers = await base44.asServiceRole.entities.User.list();
  const now = new Date();
  let reverted = 0;

  for (const user of allUsers) {
    if (
      user.plan !== "free" &&
      user.plan_expires_at &&
      new Date(user.plan_expires_at) < now
    ) {
      await base44.asServiceRole.entities.User.update(user.id, {
        plan: "free",
        plan_expires_at: null,
        payment_provider: "none",
        stripe_subscription_id: null,
      });
      reverted++;
    }
  }

  return Response.json({ success: true, reverted, checked: allUsers.length });
});