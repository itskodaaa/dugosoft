import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Call this from other functions or daily automation to snapshot usage
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Can be called by scheduler (no user) or by user
  const allUsers = await base44.asServiceRole.entities.User.list();
  const today = new Date().toISOString().split("T")[0];
  let logged = 0;

  for (const user of allUsers) {
    if (!user.pdf_count && !user.ai_requests && !user.ocr_count) continue;
    const existing = await base44.asServiceRole.entities.UsageLog.filter({ user_id: user.id, date: today });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.UsageLog.update(existing[0].id, {
        pdf_count: user.pdf_count || 0,
        ai_requests: user.ai_requests || 0,
        ocr_count: user.ocr_count || 0,
        plan: user.plan || "free",
      });
    } else {
      await base44.asServiceRole.entities.UsageLog.create({
        user_id: user.id,
        date: today,
        pdf_count: user.pdf_count || 0,
        ai_requests: user.ai_requests || 0,
        ocr_count: user.ocr_count || 0,
        plan: user.plan || "free",
      });
    }
    logged++;
  }

  return Response.json({ success: true, logged });
});