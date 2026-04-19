import { toast } from "sonner";
import { usePlan } from "./usePlan";
import { useAuth } from "./AuthContext";
import { PLAN_LIMITS } from "./planConfig";

const GUEST_USAGE_KEY = "guest_usage";

function getGuestUsage() {
  try { return JSON.parse(localStorage.getItem(GUEST_USAGE_KEY) || "{}"); }
  catch { return {}; }
}

function incrementGuestUsage(type) {
  const usage = getGuestUsage();
  usage[type] = (usage[type] || 0) + 1;
  localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify(usage));
}

export function useUsageGuard(type) {
  const { plan, checkLimit, incrementUsage } = usePlan();
  const { user } = useAuth();

  const guard = async () => {
    if (!user) {
      // Guest — track in localStorage against free limits
      const usage = getGuestUsage();
      const used = usage[type] || 0;
      const limit = PLAN_LIMITS.free[type];

      if (limit !== undefined && used >= limit) {
        toast.error("You've used your free limit. Sign up for free to get more!", {
          action: { label: "Sign Up", onClick: () => window.location.href = "/auth" },
        });
        return false;
      }

      incrementGuestUsage(type);
      return true;
    }

    // Logged-in user — check plan limits
    if (!checkLimit(type)) {
      toast.error(
        plan === "free"
          ? `Daily limit reached. Upgrade to Pro for more ${type.replace(/_/g, " ")}.`
          : `Monthly limit reached. Upgrade to Business for unlimited usage.`,
        { action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/pricing" } }
      );
      return false;
    }

    // Persist increment to backend
    await incrementUsage(type);
    return true;
  };

  return guard;
}
