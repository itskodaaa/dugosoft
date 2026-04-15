import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';

// Usage limits per plan (per day)
export const PLAN_LIMITS = {
  free:     { pdf_count: 5,   ai_requests: 10,  ocr_count: 3 },
  pro:      { pdf_count: 100, ai_requests: 200,  ocr_count: 50 },
  business: { pdf_count: Infinity, ai_requests: Infinity, ocr_count: Infinity },
};

// Features accessible by plan
export const PLAN_FEATURES = {
  free:     ['file-converter', 'translator', 'resume-builder-v2', 'history', 'settings', 'pricing', 'my-documents'],
  pro:      ['file-converter', 'translator', 'resume-builder-v2', 'history', 'settings', 'pricing', 'my-documents',
             'ats-checker', 'cover-letter', 'cover-letter-architect', 'career-matcher', 'skill-gap', 'interview-prep',
             'career-mentor', 'career-performance', 'linkedin-optimizer', 'linkedin-import', 'cv-vault',
             'chat-with-document', 'ai-assistant', 'resume-design', 'ocr-tools', 'document-merger',
             'pdf-tools', 'ai-language', 'resume-translator', 'job-tracker', 'pdf-to-excel', 'file-sharing'],
  business: ['*'], // all features
};

export function usePlan() {
  const { user, setUser } = useAuth();
  const plan = user?.plan || 'free';
  const limits = PLAN_LIMITS[plan];

  const hasFeature = (featureKey) => {
    if (plan === 'business') return true;
    return PLAN_FEATURES[plan]?.includes(featureKey) ?? false;
  };

  const checkLimit = (type) => {
    if (plan === 'business') return true;
    const used = user?.[type] || 0;
    return used < limits[type];
  };

  const incrementUsage = async (type) => {
    if (!user) return;
    const current = user[type] || 0;
    const updated = await base44.auth.updateMe({ [type]: current + 1 });
    if (setUser) setUser(prev => ({ ...prev, [type]: current + 1 }));
  };

  const resetUsageIfNeeded = async () => {
    if (!user) return;
    const lastReset = user.usage_reset_date ? new Date(user.usage_reset_date) : null;
    const today = new Date();
    const isNewDay = !lastReset || lastReset.toDateString() !== today.toDateString();
    if (isNewDay) {
      await base44.auth.updateMe({
        pdf_count: 0,
        ai_requests: 0,
        ocr_count: 0,
        usage_reset_date: today.toISOString(),
      });
      if (setUser) setUser(prev => ({ ...prev, pdf_count: 0, ai_requests: 0, ocr_count: 0 }));
    }
  };

  return { plan, limits, hasFeature, checkLimit, incrementUsage, resetUsageIfNeeded, user };
}