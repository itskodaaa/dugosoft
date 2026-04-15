import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function generateCode(userId) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const prefix = userId.slice(-4).toUpperCase().replace(/[^A-Z0-9]/g, "X");
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `DGS-${prefix}-${suffix}`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Return existing code if already has one
  if (user.referral_code) {
    return Response.json({ referral_code: user.referral_code });
  }

  const code = generateCode(user.id);
  await base44.auth.updateMe({ referral_code: code });

  return Response.json({ referral_code: code });
});