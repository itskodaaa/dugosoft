import { useAuth } from './AuthContext';
import { API_BASE } from '@/api/config';
import { PLAN_LIMITS, PLAN_FEATURES } from './planConfig';

export { PLAN_LIMITS };

export function usePlan() {
  const { user, updateUser } = useAuth();
  const plan = user?.plan || 'free';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  const hasFeature = (featureKey) => {
    if (plan === 'business') return true;
    return PLAN_FEATURES[plan]?.includes(featureKey) ?? false;
  };

  const checkLimit = (type) => {
    if (plan === 'business') return true;
    const limit = limits[type];
    if (limit === undefined) return true;
    const used = user?.[type] || 0;
    return used < limit;
  };

  const incrementUsage = async (type) => {
    if (!user) return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/usage/increment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) updateUser(data.user);
      }
    } catch {
      // Best-effort local update if API unreachable
      updateUser({ [type]: (user[type] || 0) + 1 });
    }
  };

  return { plan, limits, hasFeature, checkLimit, incrementUsage, user };
}
