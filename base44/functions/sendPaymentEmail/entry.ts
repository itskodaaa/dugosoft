import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called internally by other functions or webhooks to send transactional emails
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { type, email, name, plan, amount, expires_at, provider } = await req.json();

  const planLabel = plan === "pro" ? "Pro" : plan === "business" ? "Business" : "Free";
  const providerLabel = provider === "stripe" ? "Stripe" : provider === "flutterwave" ? "Flutterwave" : "";
  const expiryStr = expires_at ? new Date(expires_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";

  const TEMPLATES = {
    payment_success: {
      subject: `✅ Payment Confirmed — Dugosoft ${planLabel} Plan`,
      body: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#1a2c4e">Payment Successful 🎉</h2>
        <p>Hi ${name || "there"},</p>
        <p>Your payment was processed successfully. You now have full access to <strong>Dugosoft ${planLabel}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px 0;color:#666">Plan</td><td style="padding:8px 0;font-weight:bold">${planLabel}</td></tr>
          ${amount ? `<tr><td style="padding:8px 0;color:#666">Amount</td><td style="padding:8px 0;font-weight:bold">$${amount}/month</td></tr>` : ""}
          ${providerLabel ? `<tr><td style="padding:8px 0;color:#666">Provider</td><td style="padding:8px 0">${providerLabel}</td></tr>` : ""}
          ${expiryStr ? `<tr><td style="padding:8px 0;color:#666">Next renewal</td><td style="padding:8px 0">${expiryStr}</td></tr>` : ""}
        </table>
        <a href="https://app.dugosoft.com/dashboard" style="display:inline-block;background:#4f8ef7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">Go to Dashboard →</a>
        <p style="margin-top:24px;color:#999;font-size:12px">Thank you for choosing Dugosoft!</p>
      </div>`
    },
    payment_failed: {
      subject: `⚠️ Payment Failed — Action Required`,
      body: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#e53e3e">Payment Failed</h2>
        <p>Hi ${name || "there"},</p>
        <p>We were unable to process your payment for <strong>Dugosoft ${planLabel}</strong>. Please update your payment method to continue enjoying premium features.</p>
        <a href="https://app.dugosoft.com/dashboard/pricing" style="display:inline-block;background:#e53e3e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">Update Payment →</a>
      </div>`
    },
    subscription_renewed: {
      subject: `🔄 Subscription Renewed — Dugosoft ${planLabel}`,
      body: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#1a2c4e">Subscription Renewed ✓</h2>
        <p>Hi ${name || "there"},</p>
        <p>Your <strong>Dugosoft ${planLabel}</strong> subscription has been automatically renewed.${expiryStr ? ` Your next renewal is on <strong>${expiryStr}</strong>.` : ""}</p>
        <a href="https://app.dugosoft.com/dashboard" style="display:inline-block;background:#4f8ef7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">Open Dashboard →</a>
      </div>`
    },
    plan_changed: {
      subject: `📋 Your Dugosoft Plan Has Changed`,
      body: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#1a2c4e">Plan Updated</h2>
        <p>Hi ${name || "there"},</p>
        <p>Your Dugosoft plan has been updated to <strong>${planLabel}</strong>.</p>
        ${plan === "free" ? "<p>Your premium subscription has ended. You can upgrade again anytime.</p>" : "<p>Enjoy all your new features!</p>"}
        <a href="https://app.dugosoft.com/dashboard/pricing" style="display:inline-block;background:#4f8ef7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">Manage Subscription →</a>
      </div>`
    },
    referral_reward: {
      subject: `🎁 You've Earned a Referral Reward!`,
      body: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#1a2c4e">Referral Reward Earned 🎉</h2>
        <p>Hi ${name || "there"},</p>
        <p>Someone you referred just signed up for Dugosoft! You've earned <strong>7 days of free Pro access</strong> as a thank-you.</p>
        <a href="https://app.dugosoft.com/dashboard" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">View Your Dashboard →</a>
      </div>`
    }
  };

  const template = TEMPLATES[type];
  if (!template) return Response.json({ error: "Unknown email type" }, { status: 400 });

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: email,
    subject: template.subject,
    body: template.body,
    from_name: "Dugosoft",
  });

  return Response.json({ sent: true });
});