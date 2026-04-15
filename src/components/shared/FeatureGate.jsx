import React from "react";
import { Link } from "react-router-dom";
import { Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/lib/usePlan";

/**
 * Wraps content behind a plan check.
 * requiredPlan: "pro" | "business"
 * featureKey: optional key to check against PLAN_FEATURES
 */
export default function FeatureGate({ children, requiredPlan = "pro", featureKey, message }) {
  const { plan, hasFeature } = usePlan();

  const allowed = featureKey ? hasFeature(featureKey) : (
    requiredPlan === "pro" ? (plan === "pro" || plan === "business") :
    requiredPlan === "business" ? plan === "business" :
    true
  );

  if (allowed) return children;

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Lock className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">
        {requiredPlan === "business" ? "Business" : "Pro"} Feature
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {message || `This feature requires a ${requiredPlan === "business" ? "Business" : "Pro"} plan. Upgrade to unlock it.`}
      </p>
      <Link to="/dashboard/pricing">
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2">
          <Zap className="w-4 h-4" /> Upgrade Now
        </Button>
      </Link>
    </div>
  );
}