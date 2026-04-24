import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, Crown, Zap, Star, Lock, X, ChevronRight,
  Shield, Headphones, Gauge, CreditCard, AlertCircle, Calendar,
  ArrowDownLeft, Loader2, Globe, MapPin, Tag
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { paymentsApi } from "@/api/payments";
import { authApi } from "@/api/auth";
import { useGeoPrice, REGION_PRICES } from "@/lib/useGeoPrice";

const PLAN_FEATURES = [
  {
    id: "free", name: "Free", icon: Zap, color: "text-muted-foreground",
    bg: "bg-muted/30", border: "border-border",
    tagline: "Perfect to get started",
    features: [
      { label: "3 Resume generations / month", ok: true,  note: "Using our AI builder" },
      { label: "ATS Checker (basic score)",     ok: true,  note: "Keyword match only" },
      { label: "1 Cover Letter / month",        ok: true,  note: "AI-generated" },
      { label: "File Sharing (up to 100MB)",    ok: true,  note: "Shareable links" },
      { label: "Translator (500 words/month)",  ok: true,  note: "10 languages" },
      { label: "LinkedIn Optimizer",            ok: false, note: "Pro feature" },
      { label: "Priority AI model",             ok: false, note: "Pro feature" },
      { label: "PDF & DOCX export",             ok: false, note: "Pro feature" },
      { label: "Career Analytics Dashboard",    ok: false, note: "Business feature" },
      { label: "CV Vault (12+ languages)",      ok: false, note: "Pro feature" },
    ],
  },
  {
    id: "pro", name: "Pro", icon: Star, color: "text-accent",
    bg: "bg-accent/5", border: "border-accent/40", popular: true,
    tagline: "For serious job seekers",
    features: [
      { label: "Unlimited Resume generations",  ok: true,  note: "All templates" },
      { label: "ATS Checker (advanced + AI)",   ok: true,  note: "Full AI analysis + tips" },
      { label: "Unlimited Cover Letters",       ok: true,  note: "Any tone & language" },
      { label: "File Sharing (up to 5GB)",      ok: true,  note: "Password protection" },
      { label: "Translator (unlimited words)",  ok: true,  note: "50+ languages" },
      { label: "LinkedIn Optimizer",            ok: true,  note: "AI headline + about" },
      { label: "Priority AI model",             ok: true,  note: "Faster, smarter AI" },
      { label: "PDF & DOCX export",             ok: true,  note: "High-quality exports" },
      { label: "Career Analytics Dashboard",    ok: false, note: "Business only" },
      { label: "CV Vault (12+ languages)",      ok: true,  note: "Country-adapted CVs" },
    ],
  },
  {
    id: "business", name: "Business", icon: Crown, color: "text-amber-500",
    bg: "bg-amber-500/5", border: "border-amber-400/40", badge: "Best for Teams",
    tagline: "For teams & power users",
    features: [
      { label: "Everything in Pro",             ok: true,  note: "All Pro features" },
      { label: "Full Analytics dashboard",      ok: true,  note: "Usage & performance stats" },
      { label: "Team workspace (up to 5)",      ok: true,  note: "Shared documents" },
      { label: "API access",                    ok: true,  note: "Build integrations" },
      { label: "Priority support",              ok: true,  note: "< 4hr response time" },
      { label: "Custom branding on exports",    ok: true,  note: "Your logo on docs" },
      { label: "Bulk processing",               ok: true,  note: "Process 100+ files" },
      { label: "Dedicated account manager",     ok: true,  note: "Personal success manager" },
      { label: "SLA guarantee",                 ok: true,  note: "99.9% uptime SLA" },
      { label: "Unlimited history",             ok: true,  note: "Never lose your work" },
    ],
  },
];

const COMPARISON_ROWS = [
  { category: "Resumes & Career",  rows: [
    { label: "Resume generations/month",   free: "3",         pro: "Unlimited",   biz: "Unlimited"  },
    { label: "ATS scoring",                free: "Basic",     pro: "Advanced AI", biz: "Advanced AI" },
    { label: "Cover letters/month",        free: "1",         pro: "Unlimited",   biz: "Unlimited"  },
    { label: "CV Vault (languages)",       free: "✗",         pro: "12+",         biz: "12+"        },
    { label: "LinkedIn Optimizer",         free: "✗",         pro: "✓",           biz: "✓"          },
    { label: "Interview Prep",             free: "✗",         pro: "✓",           biz: "✓"          },
    { label: "Career Mentor AI",           free: "✗",         pro: "✓",           biz: "✓"          },
  ]},
  { category: "Documents & Files", rows: [
    { label: "File Sharing limit",         free: "100 MB",    pro: "5 GB",        biz: "Unlimited"  },
    { label: "Translation (words/month)",  free: "500",       pro: "Unlimited",   biz: "Unlimited"  },
    { label: "Languages",                  free: "10",        pro: "50+",         biz: "50+"        },
    { label: "PDF & DOCX export",          free: "✗",         pro: "✓",           biz: "✓"          },
    { label: "OCR Scans/month",            free: "3",         pro: "50",          biz: "Unlimited"  },
    { label: "Custom branding",            free: "✗",         pro: "✗",           biz: "✓"          },
  ]},
  { category: "Team & Support",    rows: [
    { label: "Team workspace seats",       free: "1",         pro: "1",           biz: "5"          },
    { label: "Analytics dashboard",        free: "✗",         pro: "✗",           biz: "✓"          },
    { label: "API access",                 free: "✗",         pro: "✗",           biz: "✓"          },
    { label: "Support level",             free: "Community", pro: "Email",       biz: "Priority"   },
    { label: "SLA guarantee",             free: "✗",         pro: "✗",           biz: "99.9%"      },
    { label: "Dedicated account manager", free: "✗",         pro: "✗",           biz: "✓"          },
  ]},
];

const YEARLY_DISCOUNT = 0.20; // 20% off for annual

function getYearlyPrice(monthlyPrice) {
  return Math.round(monthlyPrice * 12 * (1 - YEARLY_DISCOUNT));
}

// ── Billing Toggle ─────────────────────────────────────────────────────────────
function BillingToggle({ cycle, onChange }) {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center gap-1 bg-muted rounded-full p-1 relative">
        <button
          onClick={() => onChange("monthly")}
          className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${cycle === "monthly" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          Monthly
        </button>
        <button
          onClick={() => onChange("annual")}
          className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${cycle === "annual" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          Annual
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-200">
            Save 20%
          </span>
        </button>
      </div>
    </div>
  );
}

// ── Payment Modal ──────────────────────────────────────────────────────────────
function PaymentModal({ plan, region, prices, cycle, onClose }) {
  const [provider, setProvider] = useState("flutterwave");
  const [loading, setLoading] = useState(false);

  const monthlyAmount = prices[plan.id];
  const amount = cycle === "annual" ? Math.round(monthlyAmount * (1 - YEARLY_DISCOUNT)) : monthlyAmount;
  const annualTotal = cycle === "annual" ? Math.round(monthlyAmount * 12 * (1 - YEARLY_DISCOUNT)) : null;
  const globalAmount = REGION_PRICES.global[plan.id];
  const isRegional = region === "africa" && monthlyAmount !== globalAmount;

  const handlePay = async () => {
    setLoading(true);
    try {
      // Route everything to Flutterwave for now
      const res = await paymentsApi.createFlutterwavePayment({ plan: plan.id, region, billing_cycle: cycle });
      if (res.error === "billing_not_configured") {
        toast.error("Flutterwave is not configured yet. Set FLUTTERWAVE_SECRET_KEY in environment secrets.", { duration: 7000 });
      } else if (res.payment_link) {
        window.location.href = res.payment_link;
      } else {
        toast.error(res.message || res.error || "Failed to create payment link.");
      }
    } catch (e) {
      toast.error(e?.message || "Payment failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-bold text-foreground text-lg">Upgrade to {plan.name}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-2xl font-extrabold text-foreground">
                ${amount}<span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              {cycle === "annual" && (
                <span className="text-xs text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Tag className="w-3 h-3" /> ${annualTotal}/year (Save 20%)
                </span>
              )}
              {isRegional && (
                <div className="flex items-center gap-1 text-xs text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                  <MapPin className="w-3 h-3" /> Africa price
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">Select payment method</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setProvider("flutterwave")}
              className={`p-4 rounded-xl border-2 transition-all text-left ${provider === "flutterwave" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}>
              <p className="font-bold text-sm text-orange-500">Flutterwave</p>
              <p className="text-xs text-muted-foreground mt-0.5">Cards, Bank, Mobile money</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {["VISA", "MC", "GTB", "M-Pesa"].map(b => (
                  <span key={b} className="text-[9px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{b}</span>
                ))}
              </div>
            </button>
            <button onClick={() => setProvider("stripe")}
              className={`p-4 rounded-xl border-2 transition-all text-left ${provider === "stripe" ? "border-[#635BFF] bg-[#635BFF]/5" : "border-border hover:border-[#635BFF]/30"}`}>
              <p className="font-bold text-sm" style={{ color: "#635BFF" }}>Stripe</p>
              <p className="text-xs text-muted-foreground mt-0.5">Cards, Apple Pay, Google Pay</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {["VISA", "MC", "AMEX", "Apple Pay"].map(b => (
                  <span key={b} className="text-[9px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{b}</span>
                ))}
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 shrink-0 text-green-500" />
            Payments are processed securely. We never store card details.
          </div>

          <Button onClick={handlePay} disabled={loading}
            className={`w-full h-11 rounded-xl font-semibold text-sm gap-2 ${plan.id === "business" ? "bg-amber-500 hover:bg-amber-500/90 text-white" : "bg-accent hover:bg-accent/90 text-accent-foreground"}`}>
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
              : <><CreditCard className="w-4 h-4" /> Pay {cycle === "annual" ? `$${annualTotal}/year` : `$${amount}/month`} via Flutterwave</>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PricingSettings() {
  const { user, setUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { region, prices, detecting, setManualRegion } = useGeoPrice();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly");

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate("/auth?next=/dashboard/pricing");
      return;
    }
    setSelectedPlan(plan);
  };

  const currentPlanId = user?.plan || "free";
  const expiresAt = user?.plan_expires_at ? new Date(user.plan_expires_at) : null;
  const provider = user?.payment_provider || "none";

  // Handle payment redirect returns
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const plan = params.get("plan");
    const txRef = params.get("tx_ref");
    const providerParam = params.get("provider");

    if ((status === "success" || status === "successful") && plan) {
      if (providerParam === "stripe") {
        toast.success(`Payment successful! Your ${plan} plan is now active.`);
        authApi.getMe().then(data => setUser(data.user));
      } else if (txRef) {
        const txId = params.get("transaction_id");
        if (txId) {
          paymentsApi.verifyFlutterwavePayment({ transaction_id: txId, plan })
            .then(() => { toast.success(`Payment verified! ${plan} plan activated.`); return authApi.getMe(); })
            .then(data => setUser(data.user))
            .catch(() => toast.error("Verification failed. Contact support."));
        } else {
          toast.success(`Payment successful! Activating ${plan} plan...`);
          setTimeout(() => authApi.getMe().then(data => setUser(data.user)), 3000);
        }
      }
      window.history.replaceState({}, "", window.location.pathname);
    } else if (status === "cancelled") {
      toast.info("Payment cancelled.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (txRef && params.get("transaction_id")) {
      // Handle cases where status might be missing but IDs are present
      const txId = params.get("transaction_id");
      paymentsApi.verifyFlutterwavePayment({ transaction_id: txId, plan })
        .then(() => { toast.success(`Payment verified! ${plan} plan activated.`); return authApi.getMe(); })
        .then(data => setUser(data.user))
        .catch(() => toast.error("Verification failed. Contact support."));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await paymentsApi.cancelSubscription();
      const data = await authApi.getMe();
      setUser(data.user);
      toast.success("Subscription cancelled. Moved to Free plan.");
    } catch {
      toast.error("Failed to cancel subscription.");
    }
    setCancelling(false);
  };

  const activePlanDef = PLAN_FEATURES.find(p => p.id === currentPlanId);
  const ActiveIcon = activePlanDef.icon;
  const globalPrices = REGION_PRICES.global;
  const isAfrica = region === "africa";

  return (
    <div className="max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Pricing & Subscription</h1>
            <p className="text-muted-foreground text-sm">Manage your plan and billing. Payments via Flutterwave & Stripe.</p>
          </div>
          {detecting && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Detecting region...</span>}
          {!detecting && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground">
              {isAfrica ? <MapPin className="w-3.5 h-3.5 text-green-600" /> : <Globe className="w-3.5 h-3.5 text-blue-500" />}
              {isAfrica ? "Africa Pricing" : "Global Pricing"}
            </div>
          )}
        </div>
      </motion.div>

      {/* Current plan banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="relative overflow-hidden rounded-2xl p-6 border border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activePlanDef.bg} border ${activePlanDef.border}`}>
                <ActiveIcon className={`w-6 h-6 ${activePlanDef.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Plan</p>
                <h2 className="text-xl font-extrabold text-foreground">{activePlanDef.name}</h2>
                <div className="flex items-center gap-3 flex-wrap mt-0.5">
                  <p className="text-sm text-muted-foreground">
                    {currentPlanId === "free" ? "Free forever" : `$${prices[currentPlanId]}/month`}
                  </p>
                  {expiresAt && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Renews {expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                  {provider !== "none" && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Globe className="w-2.5 h-2.5" /> via {provider === "flutterwave" ? "Flutterwave" : "Stripe"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {currentPlanId !== "free" && (
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={cancelling}
                  className="rounded-full gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
                  {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowDownLeft className="w-3 h-3" />}
                  Cancel Plan
                </Button>
              )}
              {currentPlanId === "free" && (
                <Button onClick={() => handleSelectPlan(PLAN_FEATURES[1])} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full gap-2 font-semibold">
                  <Crown className="w-4 h-4" /> Upgrade Now
                </Button>
              )}
              {currentPlanId === "pro" && (
                <Button onClick={() => handleSelectPlan(PLAN_FEATURES[2])} className="bg-amber-500 hover:bg-amber-500/90 text-white rounded-full gap-2 font-semibold">
                  <Crown className="w-4 h-4" /> Upgrade to Business
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Regional pricing notice */}
      {isAfrica && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
          <p>
            <strong>Africa regional pricing is active.</strong> You're seeing special rates for your region.
            All features are identical — only the price differs.
          </p>
        </motion.div>
      )}
      {!isAfrica && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
          <Globe className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
          <p>
            <strong>Global pricing is active.</strong> Prices are shown in USD for your region.
          </p>
        </motion.div>
      )}

      {/* Billing cycle toggle */}
      <BillingToggle cycle={billingCycle} onChange={setBillingCycle} />

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {PLAN_FEATURES.map((plan, i) => {
          const Icon = plan.icon;
          const isActive = plan.id === currentPlanId;
          const monthlyPrice = prices[plan.id] || 0;
          const price = billingCycle === "annual" && plan.id !== "free"
            ? Math.round(monthlyPrice * (1 - YEARLY_DISCOUNT))
            : monthlyPrice;
          const globalPrice = globalPrices[plan.id] || 0;
          const hasDiscount = isAfrica && monthlyPrice !== globalPrice && plan.id !== "free";

          return (
            <motion.div key={plan.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 + 0.1 }}
              className={`relative rounded-2xl border p-5 flex flex-col transition-all ${
                isActive ? `${plan.border} ${plan.bg} shadow-lg` : "border-border bg-card hover:border-accent/30 hover:shadow-md"
              }`}>
              {plan.popular && !isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Most Popular</span>
                </div>
              )}
              {plan.badge && plan.id === "business" && !isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">{plan.badge}</span>
                </div>
              )}
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-foreground text-background text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">✓ Current Plan</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2 mt-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${plan.bg} border ${plan.border}`}>
                  <Icon className={`w-4 h-4 ${plan.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground leading-tight">{plan.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{plan.tagline}</p>
                </div>
              </div>

              <div className="mb-1">
                <span className="text-3xl font-extrabold text-foreground">
                  {plan.id === "free" ? "Free" : `$${price}`}
                </span>
                {plan.id !== "free" && (
                  <span className="text-sm text-muted-foreground ml-1">
                    /month{billingCycle === "annual" ? ", billed annually" : ""}
                  </span>
                )}
              </div>

              {/* Savings indicators */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {billingCycle === "annual" && plan.id !== "free" && (
                  <span className="text-green-700 font-semibold bg-green-100 border border-green-200 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" /> Save 20% — ${getYearlyPrice(monthlyPrice)}/yr
                  </span>
                )}
                {isAfrica && hasDiscount && (
                  <span className="text-green-700 font-semibold bg-green-100 border border-green-200 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> Africa rate
                  </span>
                )}
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-xs group/item">
                    {f.ok
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      : <X className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <span className={f.ok ? "text-foreground" : "text-muted-foreground/50"}>{f.label}</span>
                      {f.note && <span className="ml-1 text-[9px] text-muted-foreground/60">— {f.note}</span>}
                    </div>
                  </li>
                ))}
              </ul>

              {isActive ? (
                <Button disabled variant="outline" className="w-full h-10 rounded-xl text-sm font-semibold cursor-default">
                  Current Plan
                </Button>
              ) : plan.id === "free" ? (
                <Button onClick={handleCancel} disabled={currentPlanId === "free" || cancelling} variant="outline"
                  className="w-full h-10 rounded-xl text-sm font-semibold">
                  Downgrade to Free
                </Button>
              ) : (
                <Button onClick={() => handleSelectPlan(plan)}
                  className={`w-full h-10 rounded-xl text-sm font-semibold gap-1.5 ${
                    plan.id === "business" ? "bg-amber-500 hover:bg-amber-500/90 text-white border-0" : "bg-accent hover:bg-accent/90 text-accent-foreground"
                  }`}>
                  Upgrade <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Full Feature Comparison Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-foreground">Full Feature Comparison</h2>
        {COMPARISON_ROWS.map((section) => (
          <div key={section.category} className="bg-card ink-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 bg-muted/30 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{section.category}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground w-1/2">Feature</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground">Free</th>
                  <th className="text-center px-3 py-2.5 text-xs font-bold text-accent bg-accent/5">Pro</th>
                  <th className="text-center px-3 py-2.5 text-xs font-bold text-amber-600 bg-amber-500/5">Business</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, ri) => (
                  <tr key={ri} className={`border-b border-border/50 last:border-0 ${ri % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="px-5 py-2.5 text-xs font-medium text-foreground">{row.label}</td>
                    <td className="text-center px-3 py-2.5 text-xs text-muted-foreground">{row.free}</td>
                    <td className="text-center px-3 py-2.5 text-xs font-semibold text-accent bg-accent/5">{row.pro}</td>
                    <td className="text-center px-3 py-2.5 text-xs font-semibold text-amber-600 bg-amber-500/5">{row.biz}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Shield, label: "256-bit SSL", sub: "Bank-grade encryption" },
          { icon: Lock, label: "PCI DSS", sub: "Compliant payments" },
          { icon: Headphones, label: "24/7 Support", sub: "Always here to help" },
          { icon: Gauge, label: "99.9% Uptime", sub: "SLA guaranteed" },
        ].map((t, i) => {
          const Icon = t.icon;
          return (
            <div key={i} className="bg-card ink-border rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{t.label}</p>
                <p className="text-[10px] text-muted-foreground">{t.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Provider logos */}
      <div className="bg-card ink-border rounded-2xl p-5 flex items-center justify-center gap-8 flex-wrap">
        <p className="text-xs text-muted-foreground font-medium">Powered by</p>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
            <span className="text-[10px] font-black text-white">F</span>
          </div>
          <span className="text-sm font-black text-orange-500">Flutterwave</span>
        </div>
        <span className="text-muted-foreground/40 text-xs">+</span>
        <span className="text-sm font-black" style={{ color: "#635BFF" }}>stripe</span>
        <div className="flex gap-1.5">
          {["VISA", "MC", "AMEX", "Apple Pay", "Google Pay"].map(b => (
            <span key={b} className="text-[9px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{b}</span>
          ))}
        </div>
      </div>

      {/* Dev note — admin only */}
      {user?.role === "admin" && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p>
            <strong>Developers:</strong> To activate Stripe, create monthly prices in your Stripe dashboard and set secrets:{" "}
            <code className="bg-amber-100 px-1 rounded">STRIPE_PRICE_PRO_GLOBAL</code>,{" "}
            <code className="bg-amber-100 px-1 rounded">STRIPE_PRICE_BUSINESS_GLOBAL</code>,{" "}
            <code className="bg-amber-100 px-1 rounded">STRIPE_PRICE_PRO_AFRICA</code>,{" "}
            <code className="bg-amber-100 px-1 rounded">STRIPE_PRICE_BUSINESS_AFRICA</code>.
            For Flutterwave, set <code className="bg-amber-100 px-1 rounded">FLUTTERWAVE_SECRET_KEY</code>.
          </p>
        </div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <PaymentModal
            plan={selectedPlan}
            region={region}
            prices={prices}
            cycle={billingCycle}
            onClose={() => setSelectedPlan(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}