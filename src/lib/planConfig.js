/**
 * Central plan config — single source of truth for limits and feature access.
 * Import this on both frontend and reference in backend functions.
 */

export const PLAN_LIMITS = {
  free: {
    ai_requests:      10,
    file_conversions: 5,
    translations:     3,
    ocr_requests:     3,
    esign_requests:   1,
    resume_exports:   2,
    pdf_processing:   5,
  },
  pro: {
    ai_requests:      200,
    file_conversions: 100,
    translations:     50,
    ocr_requests:     50,
    esign_requests:   20,
    resume_exports:   50,
    pdf_processing:   100,
  },
  business: {
    ai_requests:      Infinity,
    file_conversions: Infinity,
    translations:     Infinity,
    ocr_requests:     Infinity,
    esign_requests:   Infinity,
    resume_exports:   Infinity,
    pdf_processing:   Infinity,
  },
};

// Features accessible per plan
export const PLAN_FEATURES = {
  free:     [
    'file-converter', 'translator', 'resume-builder-v2', 'history',
    'settings', 'pricing', 'my-documents',
  ],
  pro:      [
    'file-converter', 'translator', 'resume-builder-v2', 'history',
    'settings', 'pricing', 'my-documents',
    'ats-checker', 'cover-letter', 'cover-letter-architect', 'career-matcher',
    'skill-gap', 'interview-prep', 'career-mentor', 'career-performance',
    'linkedin-optimizer', 'linkedin-import', 'cv-vault',
    'chat-with-document', 'ai-assistant', 'resume-design', 'ocr-tools',
    'document-merger', 'pdf-tools', 'ai-language', 'resume-translator',
    'job-tracker', 'pdf-to-excel', 'file-sharing',
  ],
  business: ['*'],
};

export function getLimitsForPlan(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function hasFeatureAccess(plan, featureKey) {
  if (plan === 'business') return true;
  return PLAN_FEATURES[plan]?.includes(featureKey) ?? false;
}