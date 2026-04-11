import React, { useState } from "react";
import { Lock, Crown, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// requiredPlan: "pro" | "business"
// userPlan: "free" | "pro" | "business"
function hasAccess(userPlan, requiredPlan) {
  const tiers = { free: 0, pro: 1, business: 2 };
  return (tiers[userPlan] ?? 0) >= (tiers[requiredPlan] ?? 1);
}

function UpgradeModal({ requiredPlan, featureName, onClose }) {
  const isPro = requiredPlan === "pro";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isPro ? "bg-accent/10" : "bg-amber-500/10"}`}>
          <Crown className={`w-6 h-6 ${isPro ? "text-accent" : "text-amber-500"}`} />
        </div>
        <h3 className="text-lg font-extrabold text-foreground mb-2">
          {featureName} is a {isPro ? "Pro" : "Business"} Feature
        </h3>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          Upgrade to <strong>{isPro ? "Pro ($12/mo)" : "Business ($29/mo)"}</strong> to unlock{" "}
          {featureName} and {isPro ? "all Career AI tools, unlimited exports, and more" : "team workspaces, bulk processing, and white-label exports"}.
        </p>
        <div className="space-y-2 mb-5">
          {isPro ? [
            "Unlimited Resume & Cover Letters",
            "AI Skill Gap Analysis & Interview Prep",
            "Career Mentor & Chat with Document",
            "No watermarks on exports",
          ] : [
            "Everything in Pro",
            "Team Workspaces (5 users)",
            "Bulk OCR & Document Processing",
            "White-label custom branding",
          ].map(f => (
            <div key={f} className="flex items-center gap-2 text-xs text-foreground">
              <Star className={`w-3 h-3 shrink-0 ${isPro ? "text-accent" : "text-amber-500"}`} />
              {f}
            </div>
          ))}
        </div>
        <Link to="/dashboard/pricing" onClick={onClose}>
          <Button className={`w-full rounded-full font-semibold gap-2 ${isPro ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-amber-500 hover:bg-amber-500/90 text-white"}`}>
            Upgrade Now <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <button onClick={onClose} className="w-full text-center text-xs text-muted-foreground mt-3 hover:text-foreground transition-colors">
          Maybe later
        </button>
      </motion.div>
    </div>
  );
}

// Usage: wrap any component with FeatureGate
// <FeatureGate requiredPlan="pro" userPlan={user.subscription} featureName="Career Mentor">
//   <CareerMentorContent />
// </FeatureGate>
export default function FeatureGate({ requiredPlan = "pro", userPlan = "free", featureName = "This feature", children, inline = false }) {
  const [showModal, setShowModal] = useState(false);

  if (hasAccess(userPlan, requiredPlan)) return children;

  if (inline) {
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-40 select-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setShowModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg transition-all hover:scale-105 ${requiredPlan === "pro" ? "bg-accent" : "bg-amber-500"}`}
          >
            <Lock className="w-3.5 h-3.5" /> Upgrade to {requiredPlan === "pro" ? "Pro" : "Business"}
          </button>
        </div>
        <AnimatePresence>
          {showModal && <UpgradeModal requiredPlan={requiredPlan} featureName={featureName} onClose={() => setShowModal(false)} />}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-xl mx-auto py-16 text-center px-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${requiredPlan === "pro" ? "bg-accent/10" : "bg-amber-500/10"}`}>
          <Lock className={`w-7 h-7 ${requiredPlan === "pro" ? "text-accent" : "text-amber-500"}`} />
        </div>
        <h2 className="text-xl font-extrabold text-foreground mb-2">{featureName}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This feature is available on the <strong>{requiredPlan === "pro" ? "Pro ($12/mo)" : "Business ($29/mo)"}</strong> plan.
          Upgrade to access {featureName} and unlock your full career potential.
        </p>
        <Button onClick={() => setShowModal(true)} className={`rounded-full font-semibold gap-2 px-8 ${requiredPlan === "pro" ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-amber-500 hover:bg-amber-500/90 text-white"}`}>
          <Crown className="w-4 h-4" /> Upgrade to {requiredPlan === "pro" ? "Pro" : "Business"}
        </Button>
      </div>
      <AnimatePresence>
        {showModal && <UpgradeModal requiredPlan={requiredPlan} featureName={featureName} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}

export { hasAccess };