import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called when a new user signs up with a referral code
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { referral_code } = await req.json();
  if (!referral_code) return Response.json({ error: "No referral code" }, { status: 400 });

  // Find referrer
  const referrers = await base44.asServiceRole.entities.User.filter({ referral_code });
  if (!referrers.length) return Response.json({ error: "Invalid referral code" }, { status: 404 });

  const referrer = referrers[0];
  if (referrer.id === user.id) return Response.json({ error: "Cannot refer yourself" }, { status: 400 });

  // Check not already referred
  if (user.referred_by) return Response.json({ error: "Already referred" }, { status: 409 });

  // Record referral
  await base44.asServiceRole.entities.Referral.create({
    referrer_id: referrer.id,
    referrer_email: referrer.email,
    referred_email: user.email,
    referred_user_id: user.id,
    status: "completed",
    reward_days: 7,
  });

  // Mark new user as referred
  await base44.auth.updateMe({ referred_by: referral_code });

  // Reward referrer: +7 days of Pro
  const currentCredits = referrer.referral_credits || 0;
  await base44.asServiceRole.entities.User.update(referrer.id, {
    referral_credits: currentCredits + 7,
  });

  // Send reward email to referrer
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: referrer.email,
    subject: "🎁 You've Earned a Referral Reward!",
    body: `Hi ${referrer.full_name || "there"}, someone you referred just joined Dugosoft! You've earned 7 days of free Pro access.`,
    from_name: "Dugosoft",
  });

  return Response.json({ success: true, referrer_email: referrer.email });
});