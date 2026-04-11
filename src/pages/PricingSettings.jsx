import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Crown, Zap, Star, CreditCard, Lock, X, ChevronRight, AlertCircle, Shield, Users, Headphones, Gauge, Package } from "lucide-react";
import { toast } from "sonner";

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
      { label: "Career Performance analytics", included: false },
      { label: "Unlimited history", included: false },
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
      { label: "Career Performance analytics", included: false },
      { label: "Unlimited history", included: false },
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
      { label: "Career Performance analytics", included: true },
      { label: "Unlimited history", included: true },
      { label: "Team workspace (up to 5 users)", included: true },
      { label: "API access", included: true },
      { label: "Priority support", included: true },
      { label: "Custom branding on exports", included: true },
      { label: "Bulk processing", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "SLA guarantee", included: true },
    ],
  },
];

const PAYMENT_METHODS = [
  { id: "visa", label: "Visa", last4: "4242", expiry: "12/27", brand: "VISA" },
  { id: "mc", label: "Mastercard", last4: "5100", expiry: "08/26", brand: "MC" },
];

function PaymentMethodCard({ method, isDefault, onSetDefault, onRemove }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isDefault ? "border-accent bg-accent/5" : "border-border bg-card"}`}>
      <div className="w-12 h-8 rounded-md bg-muted flex items-center justify-center">
        <span className="text-xs font-black text-foreground">{method.brand}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">•••• {method.last4}</p>
        <p className="text-xs text-muted-foreground">Expires {method.expiry}</p>
      </div>
      {isDefault ? (
        <Badge className="text-xs bg-accent/10 text-accent border-accent/20" variant="outline">Default</Badge>
      ) : (
        <button onClick={() => onSetDefault(method.id)} className="text-xs text-accent hover:underline font-medium">
          Set default
        </button>
      )}
      <button onClick={() => onRemove(method.id)} className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors">
        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}

export default function PricingSettings() {
  const [currentPlan, setCurrentPlan] = useState("pro");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState(PAYMENT_METHODS);
  const [defaultMethod, setDefaultMethod] = useState("visa");
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvc: "", name: "" });

  const handleUpgrade = (planId) => {
    if (planId === currentPlan) return;
    setSelectedPlan(planId);
    setUpgrading(true);
    setTimeout(() => {
      setCurrentPlan(planId);
      setUpgrading(false);
      setSelectedPlan(null);
      const plan = PLANS.find((p) => p.id === planId);
      toast.success(`Successfully ${planId === "free" ? "downgraded to" : "upgraded to"} ${plan.name}!`);
    }, 1800);
  };

  const handleAddCard = () => {
    if (!cardForm.number || !cardForm.expiry || !cardForm.cvc) {
      toast.error("Please fill in all card fields.");
      return;
    }
    const last4 = cardForm.number.replace(/\s/g, "").slice(-4);
    const newCard = { id: `card_${Date.now()}`, label: "Visa", last4, expiry: cardForm.expiry, brand: "VISA" };
    setPaymentMethods((prev) => [...prev, newCard]);
    setDefaultMethod(newCard.id);
    setShowAddCard(false);
    setCardForm({ number: "", expiry: "", cvc: "", name: "" });
    toast.success("Card added successfully!");
  };

  const handleRemoveMethod = (id) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
    if (defaultMethod === id && paymentMethods.length > 1) {
      setDefaultMethod(paymentMethods.find((m) => m.id !== id)?.id || "");
    }
    toast.info("Payment method removed.");
  };

  const activePlan = PLANS.find((p) => p.id === currentPlan);

  return (
    <div className="max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">Pricing & Subscription</h1>
        <p className="text-muted-foreground mb-8">Manage your plan, billing, and payment methods.</p>
      </motion.div>

      {/* Current plan banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="relative overflow-hidden rounded-2xl p-6 border border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {React.createElement(activePlan.icon, { className: `w-7 h-7 ${activePlan.color}` })}
              <div>
                <p className="text-sm text-muted-foreground font-medium">Current plan</p>
                <h2 className="text-xl font-extrabold text-foreground">{activePlan.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {activePlan.price === 0 ? "Free forever" : `$${activePlan.price}/month · Next billing: Apr 29, 2026`}
                </p>
              </div>
            </div>
            {currentPlan === "free" && (
              <Button onClick={() => handleUpgrade("pro")} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full gap-2 font-semibold">
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </Button>
            )}
            {currentPlan === "pro" && (
              <Button onClick={() => handleUpgrade("business")} className="bg-amber-500 hover:bg-amber-500/90 text-white rounded-full gap-2 font-semibold">
                <Crown className="w-4 h-4" />
                Upgrade to Business
              </Button>
            )}
            {currentPlan === "business" && (
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-400/30 px-3 py-1" variant="outline">
                <Crown className="w-3 h-3 mr-1" /> Top plan
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isActive = plan.id === currentPlan;
          const isUpgrading = upgrading && selectedPlan === plan.id;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.1 }}
              className={`relative rounded-2xl border p-5 flex flex-col transition-all ${
                isActive ? `${plan.border} ${plan.bg} shadow-lg` : "border-border bg-card hover:border-accent/30"
              }`}
            >
              {plan.popular && !isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              {plan.badge && !isActive && plan.id !== "pro" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</span>
                </div>
              )}
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-foreground text-background text-xs font-bold px-3 py-1 rounded-full">Current Plan</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${plan.bg} border ${plan.border}`}>
                  <Icon className={`w-4 h-4 ${plan.color}`} />
                </div>
                <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-extrabold text-foreground">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                {plan.price > 0 && <span className="text-sm text-muted-foreground ml-1">{plan.billing}</span>}
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-xs">
                    {f.included ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground/50"}>{f.label}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isActive || upgrading}
                variant={isActive ? "outline" : "default"}
                className={`w-full h-10 rounded-xl text-sm font-semibold ${
                  isActive
                    ? "cursor-default"
                    : plan.id === "business"
                    ? "bg-amber-500 hover:bg-amber-500/90 text-white border-0"
                    : "bg-accent hover:bg-accent/90 text-accent-foreground"
                }`}
              >
                {isUpgrading ? (
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : isActive ? (
                  "Current Plan"
                ) : plan.id === "free" ? (
                  "Downgrade"
                ) : (
                  <>Upgrade <ChevronRight className="w-3.5 h-3.5" /></>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Trust & Security */}
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

      {/* Payment Methods */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="bg-card ink-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground">Payment Methods</h3>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowAddCard((v) => !v)} className="rounded-full h-8 text-xs gap-1.5">
              {showAddCard ? "Cancel" : "+ Add Card"}
            </Button>
          </div>

          <div className="space-y-3 mb-4">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">No payment methods added.</div>
            ) : (
              paymentMethods.map((m) => (
                <PaymentMethodCard
                  key={m.id}
                  method={m}
                  isDefault={m.id === defaultMethod}
                  onSetDefault={setDefaultMethod}
                  onRemove={handleRemoveMethod}
                />
              ))
            )}
          </div>

          {/* Add card form */}
          {showAddCard && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="border-t border-border pt-4 mt-4 space-y-3">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Add new card
              </p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-muted-foreground">Powered by</span>
                <span className="text-[11px] font-black text-[#635BFF]">stripe</span>
                <div className="flex gap-1">
                  {["VISA","MC","AMEX"].map(b => (
                    <span key={b} className="text-[9px] font-black bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{b}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <input
                  placeholder="Card number (e.g. 4242 4242 4242 4242)"
                  value={cardForm.number}
                  onChange={(e) => setCardForm((f) => ({ ...f, number: e.target.value }))}
                  className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="MM/YY"
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm((f) => ({ ...f, expiry: e.target.value }))}
                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    placeholder="CVC"
                    value={cardForm.cvc}
                    onChange={(e) => setCardForm((f) => ({ ...f, cvc: e.target.value }))}
                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <input
                  placeholder="Cardholder name"
                  value={cardForm.name}
                  onChange={(e) => setCardForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                This is a mock integration — no real payment is processed.
              </div>
              <Button onClick={handleAddCard} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-10 text-sm font-semibold">
                Add Card
              </Button>
            </motion.div>
          )}

          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-4">
            <Lock className="w-3 h-3" /> Payments are encrypted and secure.
          </p>
        </div>
      </motion.div>

      {/* Billing history mock */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="bg-card ink-border rounded-2xl p-6">
          <h3 className="text-base font-bold text-foreground mb-4">Billing History</h3>
          <div className="space-y-3">
            {[
              { date: "Mar 29, 2026", amount: "$12.00", plan: "Pro", status: "Paid" },
              { date: "Feb 28, 2026", amount: "$12.00", plan: "Pro", status: "Paid" },
              { date: "Jan 29, 2026", amount: "$12.00", plan: "Pro", status: "Paid" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.plan} Plan</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">{item.amount}</span>
                  <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}