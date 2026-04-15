import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, Crown, Zap, Star, Lock, X, ChevronRight,
  Shield, Headphones, Gauge, CreditCard, AlertCircle, Calendar,
  ArrowDownLeft, Loader2, Globe
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    billing: "forever",
    icon: Zap,
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    border: "border-border",
    features: [
      { label: "3 Resume generations / month", included: true },
      { label: "ATS Checker (basic)", included: true },
      { label: "1 Cover Letter / month", included: true },
      { label: "File Sharing (up to 100MB)", included: true },
      { label: "Translator (500 words)", included: true },
      { label: "LinkedIn Integration", included: false },
      { label: "Priority AI model", included: false },
      { label: "PDF & DOCX export", included: false },
      { label: "Career analytics", included: false },
      { label: "CV Vault", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 12,
    billing: "/ month",
    icon: Star,
    color: "text-accent",
    bg: "bg-accent/5",
    border: "border-accent/40",
    popular: true,
    features: [
      { label: "Unlimited Resume generations", included: true },
      { label: "ATS Checker (advanced + AI)", included: true },
      { label: "Unlimited Cover Letters", included: true },
      { label: "File Sharing (up to 5GB)", included: true },
      { label: "Translator (unlimited)", included: true },
      { label: "LinkedIn Integration", included: true },
      { label: "Priority AI model", included: true },
      { label: "PDF & DOCX export", included: true },
      { label: "Career analytics", included: false },
      { label: "CV Vault", included: true },
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 29,
    billing: "/ month",
    icon: Crown,
    color: "text-amber-500",
    bg: "bg-amber-500/5",
    border: "border-amber-400/40",
    badge: "Best for Teams",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Full Analytics dashboard", included: true },
      { label: "Team workspace (up to 5)", included: true },
      { label: "API access", included: true },
      { label: "Priority support", included: true },
      { label: "Custom branding on exports", included: true },
      { label: "Bulk processing", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "SLA guarantee", included: true },
      { label: "Unlimited history", included: true },
    ],
  },
];

// ── Payment Provider Selector ──────────────────────────────────────────────────
function PaymentModal({ plan, onClose, onSuccess }) {
  const [provider, setProvider] = useState("flutterwave");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      if (provider === "flutterwave") {
        const res = await base44.functions.invoke("createFlutterwavePayment", { plan: plan.id });
        if (res.data?.payment_link) {
          window.location.href = res.data.payment_link;
        } else {
          toast.error("Failed to create payment link.");
        }
      } else {
        const res = await base44.functions.invoke("createStripeCheckout", { plan: plan.id });
        if (res.data?.checkout_url) {
          window.location.href = res.data.checkout_url;
        } else {
          toast.error("Failed to create Stripe checkout.");
        }
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || "Payment failed. Please try again.");
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
            <p className="text-sm text-muted-foreground">${plan.price}/month · billed monthly</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">Select payment method</p>

          {/* Provider selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setProvider("flutterwave")}
              className={`p-4 rounded-xl border-2 transition-all text-left ${provider === "flutterwave" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}
            >
              <p className="font-bold text-sm text-foreground">Flutterwave</p>
              <p className="text-xs text-muted-foreground mt-0.5">Cards, Bank transfer, Mobile money</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {["VISA", "MC", "GTB", "M-Pesa"].map(b => (
                  <span key={b} className="text-[9px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{b}</span>
                ))}
              </div>
            </button>

            <button
              onClick={() => setProvider("stripe")}
              className={`p-4 rounded-xl border-2 transition-all text-left ${provider === "stripe" ? "border-[#635BFF] bg-[#635BFF]/5" : "border-border hover:border-[#635BFF]/30"}`}
            >
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

          <Button
            onClick={handlePay}
            disabled={loading}
            className={`w-full h-11 rounded-xl font-semibold text-sm gap-2 ${
              plan.id === "business"
                ? "bg-amber-500 hover:bg-amber-500/90 text-white"
                : "bg-accent hover:bg-accent/90 text-accent-foreground"
            }`}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay ${plan.price}/month with {provider === "flutterwave" ? "Flutterwave" : "Stripe"}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PricingSettings() {
  const { user, setUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const currentPlanId = user?.plan || "free";
  const expiresAt = user?.plan_expires_at ? new Date(user.plan_expires_at) : null;
  const provider = user?.payment_provider || "none";

  // Handle redirect back from payment (verify Flutterwave)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const plan = params.get("plan");
    const txRef = params.get("tx_ref");
    const providerParam = params.get("provider");

    if (status === "success" && plan) {
      if (providerParam === "stripe") {
        // Stripe webhook handles the update; just refresh user
        toast.success(`Payment successful! Your ${plan} plan is now active.`);
        base44.auth.me().then(u => setUser(u));
      } else if (txRef) {
        // Need to verify Flutterwave — get transaction_id from URL
        const txId = params.get("transaction_id");
        if (txId) {
          base44.functions.invoke("verifyFlutterwavePayment", { transaction_id: txId, plan })
            .then(() => {
              toast.success(`Payment verified! Your ${plan} plan is now active.`);
              return base44.auth.me();
            })
            .then(u => setUser(u))
            .catch(() => toast.error("Payment verification failed. Contact support."));
        } else {
          // Webhook already handled it
          toast.success(`Payment successful! Your ${plan} plan is being activated.`);
          setTimeout(() => base44.auth.me().then(u => setUser(u)), 3000);
        }
      }
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (status === "cancelled") {
      toast.info("Payment cancelled.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await base44.functions.invoke("cancelSubscription", {});
      const u = await base44.auth.me();
      setUser(u);
      toast.success("Subscription cancelled. You've been moved to Free.");
    } catch {
      toast.error("Failed to cancel subscription.");
    }
    setCancelling(false);
  };

  const activePlan = PLANS.find(p => p.id === currentPlanId);
  const ActiveIcon = activePlan.icon;

  return (
    <div className="max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">Pricing & Subscription</h1>
        <p className="text-muted-foreground text-sm">Manage your plan and billing. Payments processed by Flutterwave & Stripe.</p>
      </motion.div>

      {/* Current plan banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="relative overflow-hidden rounded-2xl p-6 border border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activePlan.bg} border ${activePlan.border}`}>
                <ActiveIcon className={`w-6 h-6 ${activePlan.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Plan</p>
                <h2 className="text-xl font-extrabold text-foreground">{activePlan.name}</h2>
                <div className="flex items-center gap-3 flex-wrap mt-0.5">
                  <p className="text-sm text-muted-foreground">
                    {activePlan.price === 0 ? "Free forever" : `$${activePlan.price}/month`}
                  </p>
                  {expiresAt && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Renews {expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                  {provider !== "none" && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Globe className="w-2.5 h-2.5" />
                      via {provider === "flutterwave" ? "Flutterwave" : "Stripe"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {currentPlanId !== "free" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="rounded-full gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowDownLeft className="w-3 h-3" />}
                  Cancel Plan
                </Button>
              )}
              {currentPlanId === "free" && (
                <Button onClick={() => setSelectedPlan(PLANS[1])} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full gap-2 font-semibold">
                  <Crown className="w-4 h-4" /> Upgrade Now
                </Button>
              )}
              {currentPlanId === "pro" && (
                <Button onClick={() => setSelectedPlan(PLANS[2])} className="bg-amber-500 hover:bg-amber-500/90 text-white rounded-full gap-2 font-semibold">
                  <Crown className="w-4 h-4" /> Upgrade to Business
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isActive = plan.id === currentPlanId;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.1 }}
              className={`relative rounded-2xl border p-5 flex flex-col transition-all ${
                isActive ? `${plan.border} ${plan.bg} shadow-lg` : "border-border bg-card hover:border-accent/30 hover:shadow-md"
              }`}
            >
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

              <div className="flex items-center gap-2 mb-4 mt-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${plan.bg} border ${plan.border}`}>
                  <Icon className={`w-4 h-4 ${plan.color}`} />
                </div>
                <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
              </div>

              <div className="mb-5">
                <span className="text-3xl font-extrabold text-foreground">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                {plan.price > 0 && <span className="text-sm text-muted-foreground ml-1">{plan.billing}</span>}
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-xs">
                    {f.included
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      : <X className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground/50"}>{f.label}</span>
                  </li>
                ))}
              </ul>

              {isActive ? (
                <Button disabled variant="outline" className="w-full h-10 rounded-xl text-sm font-semibold cursor-default">
                  Current Plan
                </Button>
              ) : plan.id === "free" ? (
                <Button
                  onClick={handleCancel}
                  disabled={currentPlanId === "free" || cancelling}
                  variant="outline"
                  className="w-full h-10 rounded-xl text-sm font-semibold"
                >
                  Downgrade to Free
                </Button>
              ) : (
                <Button
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full h-10 rounded-xl text-sm font-semibold gap-1.5 ${
                    plan.id === "business"
                      ? "bg-amber-500 hover:bg-amber-500/90 text-white border-0"
                      : "bg-accent hover:bg-accent/90 text-accent-foreground"
                  }`}
                >
                  Upgrade <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Trust badges */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
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
      </motion.div>

      {/* Provider logos */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="bg-card ink-border rounded-2xl p-5 flex items-center justify-center gap-8 flex-wrap">
          <p className="text-xs text-muted-foreground font-medium">Payments powered by</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <span className="text-[10px] font-black text-white">F</span>
            </div>
            <span className="text-sm font-black text-orange-500">Flutterwave</span>
          </div>
          <span className="text-muted-foreground/40 text-xs">+</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black" style={{ color: "#635BFF" }}>stripe</span>
          </div>
          <div className="flex gap-1.5">
            {["VISA", "MC", "AMEX", "Apple Pay", "Google Pay"].map(b => (
              <span key={b} className="text-[9px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{b}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* FAQ note for Stripe Price IDs */}
      {currentPlanId === "free" && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p>
            <strong>For developers:</strong> To enable Stripe subscriptions, create monthly recurring prices in your Stripe dashboard and add{" "}
            <code className="bg-amber-100 px-1 rounded">STRIPE_PRICE_PRO</code> and{" "}
            <code className="bg-amber-100 px-1 rounded">STRIPE_PRICE_BUSINESS</code> as secrets with the price IDs (e.g. <code className="bg-amber-100 px-1 rounded">price_1Abc...</code>).
          </p>
        </div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <PaymentModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
            onSuccess={() => setSelectedPlan(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}