import { toast } from "sonner";
import { usePlan } from "./usePlan";
import { base44 } from "@/api/base44Client";
import { useAuth } from "./AuthContext";

/**
 * Returns a guard function that checks usage limits before allowing an action.
 * Usage: const guard = useUsageGuard('ai_requests');
 *        const allowed = await guard();  // returns false and shows toast if over limit
 */
export function useUsageGuard(type) {
  const { plan, checkLimit } = usePlan();
  const { user, setUser } = useAuth();

  const guard = async () => {
    if (!checkLimit(type)) {
      toast.error(
        plan === "free"
          ? `Daily limit reached. Upgrade to Pro for more ${type.replace("_", " ")}.`
          : `Monthly limit reached. Upgrade to Business for unlimited usage.`,
        { action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/pricing" } }
      );
      return false;
    }

    // Increment usage
    if (user) {
      const current = user[type] || 0;
      await base44.auth.updateMe({ [type]: current + 1 });
      if (setUser) setUser(prev => ({ ...prev, [type]: current + 1 }));
    }
    return true;
  };

  return guard;
}