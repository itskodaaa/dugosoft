import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { PLAN_LIMITS, PLAN_FEATURES } from './planConfig';

export { PLAN_LIMITS };

export function usePlan() {
  const { user, setUser } = useAuth();
  const plan = user?.plan || 'free';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  const hasFeature = (featureKey) => {
    if (plan === 'business') return true;
    return PLAN_FEATURES[plan]?.includes(featureKey) ?? false;
  };

  const checkLimit = (type) => {
    if (plan === 'business') return true;
    const limit = limits[type];
    if (limit === undefined) return true; // unknown type — allow
    const used = user?.[type] || 0;
    return used < limit;
  };

  const incrementUsage = async (type) => {
    if (!user) return;
    const current = user[type] || 0;
    await base44.auth.updateMe({ [type]: current + 1 });
    if (setUser) setUser(prev => ({ ...prev, [type]: current + 1 }));
  };

  return { plan, limits, hasFeature, checkLimit, incrementUsage, user };
}