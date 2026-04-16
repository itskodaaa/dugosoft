/**
 * Dugosoft AI Service — unified server-side AI backend.
 * Prefers OPENAI_API_KEY, falls back to GEMINI_API_KEY.
 * Logs every call to AIRequest and UsageRecord entities.
 * Returns honest "not_configured" if no key is set.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL   = "gemini-1.5-flash-latest";
const OPENAI_MODEL   = "gpt-4o-mini";

// ── Plan limits (server-side authoritative) ───────────────────────────────────
const PLAN_LIMITS = {
  free:     { ai_requests: 10 },
  pro:      { ai_requests: 200 },
  business: { ai_requests: Infinity },
};

function checkAILimit(user) {
  const plan  = user.plan || "free";
  const limit = PLAN_LIMITS[plan]?.ai_requests ?? 10;
  return (user.ai_requests || 0) < limit;
}

// ── OpenAI caller ─────────────────────────────────────────────────────────────
async function callOpenAI(prompt, jsonMode = false) {
  const messages = [{ role: "user", content: prompt }];
  const body = {
    model: OPENAI_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 429) throw new Error("AI quota exceeded. Please try again shortly.");
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  if (jsonMode) {
    try { return JSON.parse(text); } catch { return text; }
  }
  return text;
}

// ── Gemini caller ─────────────────────────────────────────────────────────────
async function callGemini(prompt, jsonSchema = null) {
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  };
  if (jsonSchema) {
    body.generationConfig.responseMimeType = "application/json";
    body.generationConfig.responseSchema   = jsonSchema;
  }

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 429) throw new Error("AI quota exceeded. Please try again shortly.");
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (jsonSchema) { try { return JSON.parse(text); } catch { return text; } }
  return text;
}

// ── Unified AI caller (OpenAI first, Gemini fallback) ─────────────────────────
async function callAI(prompt, jsonSchema = null) {
  if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
    return { _not_configured: true };
  }
  if (OPENAI_API_KEY) {
    return await callOpenAI(prompt, !!jsonSchema);
  }
  return await callGemini(prompt, jsonSchema);
}

// ── Usage recording ───────────────────────────────────────────────────────────
async function recordUsage(base44, user, action, inputSize, outputSize, success, errorMsg) {
  const today = new Date().toISOString().split("T")[0];

  // 1. Log to AIRequest entity
  await base44.asServiceRole.entities.AIRequest.create({
    user_id:      user.id,
    feature:      "ai_requests",
    action,
    input_size:   inputSize || 0,
    output_size:  outputSize || 0,
    model:        OPENAI_API_KEY ? OPENAI_MODEL : GEMINI_MODEL,
    success:      success !== false,
    error_message: errorMsg || null,
    plan_at_time: user.plan || "free",
  });

  // 2. Upsert daily UsageLog (for Analytics page)
  const existing = await base44.asServiceRole.entities.UsageLog.filter({ user_id: user.id, date: today });
  if (existing.length > 0) {
    const log = existing[0];
    await base44.asServiceRole.entities.UsageLog.update(log.id, {
      ai_requests: (log.ai_requests || 0) + 1,
      plan: user.plan || "free",
    });
  } else {
    await base44.asServiceRole.entities.UsageLog.create({
      user_id: user.id, date: today,
      ai_requests: 1, pdf_count: 0, ocr_count: 0, conversions: 0,
      plan: user.plan || "free",
    });
  }

  // 3. Upsert daily UsageRecord (new granular entity)
  const periodStart = today;
  const periodEnd   = today;
  const usageRecs   = await base44.asServiceRole.entities.UsageRecord.filter({
    user_id: user.id, feature: "ai_requests", period_start: periodStart,
  });
  if (usageRecs.length > 0) {
    await base44.asServiceRole.entities.UsageRecord.update(usageRecs[0].id, {
      count: (usageRecs[0].count || 0) + 1,
    });
  } else {
    await base44.asServiceRole.entities.UsageRecord.create({
      user_id: user.id, feature: "ai_requests", count: 1,
      period_type: "daily", period_start: periodStart, period_end: periodEnd,
      plan_at_time: user.plan || "free",
    });
  }

  // 4. Increment on user record (for limit checks)
  await base44.auth.updateMe({ ai_requests: (user.ai_requests || 0) + 1 });
}

// ── Prompt builders ───────────────────────────────────────────────────────────
const prompts = {
  scoreResumeATS: (p) => `You are an ATS analyst and career coach.
Analyze this resume vs the job description and return JSON with:
{ "score": number(0-100), "missingKeywords": string[], "foundKeywords": string[], "suggestions": string[], "assessment": string }

RESUME:
${p.resumeText}

JOB DESCRIPTION:
${p.jobDescription}

Be specific and base the score on actual content only.`,

  translateText: (p) => `You are a professional translator specializing in business and career documents.
Translate the following text to ${p.targetLanguage}. Tone: ${p.tone || "professional"}.
Preserve all formatting, structure, and meaning. Output ONLY the translated text, no notes.

TEXT:
${p.text}`,

  generateCoverLetter: (p) => `Write a ${p.tone || "professional"} cover letter in ${p.language || "English"} for:
Job Title: ${p.jobTitle}
Company: ${p.company}
Applicant: ${p.name || "the applicant"}
Experience: ${p.experience || "several years"}
Qualifications: ${p.qualifications || "relevant experience"}

Write a complete, ready-to-send cover letter (greeting, 3 body paragraphs, sign-off).
Make it specific and tailored. Do NOT use placeholders like [X]. Respond entirely in ${p.language || "English"}.`,

  generateInterviewQuestions: (p) => `Generate ${p.count || 10} realistic interview questions for:
Job Title: ${p.jobTitle}
Company: ${p.company || "a leading company"}
Industry: ${p.industry || "technology"}
Level: ${p.level || "mid-level"}

Include behavioral, technical, situational, and role-specific questions.
For each: the question, what the interviewer is assessing, and a brief answering tip.`,

  optimizeLinkedInSummary: (p) => `Optimize this LinkedIn profile:
Target Role: ${p.targetRole}
Current Summary: ${p.currentSummary}
Skills: ${p.skills}
Industry: ${p.industry || "technology"}

Provide:
1. Optimized headline (under 220 chars, keyword-rich)
2. Compelling About section (under 1300 chars, first-person, achievement-focused)
3. 10 recommended skills
4. 3 post ideas to boost visibility`,

  summarizeDocument: (p) => `Summarize this document accurately:
${p.text}

Provide: executive summary (2-3 sentences), key points (bullets), action items/important dates if any, document type.`,

  chatWithDocument: (p) => {
    const hist = p.history?.map(h => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`).join("\n") || "";
    return `You are a document assistant. Answer questions about the provided document only.
DOCUMENT:
${p.documentText}
${hist ? `\nCONVERSATION:\n${hist}\n` : ""}
USER: ${p.question}
Answer based only on document content. If not in the document, say so clearly.`;
  },

  generateResume: (p) => `Generate a complete ATS-optimized resume for:
Name: ${p.name}, Role: ${p.targetRole}, Experience: ${p.yearsExperience} years
Industry: ${p.industry}, Skills: ${p.skills}
Current Role: ${p.currentRole || "Not specified"}, Education: ${p.education || "Not specified"}
Achievements: ${p.achievements || "Not specified"}, Region: ${p.targetRegion || "Global"}

Write: professional summary (3-4 sentences), experience bullets with quantified results, skills section.`,

  tailorResumeToJob: (p) => `Tailor this resume to match the job description. Keep all facts truthful.
Resume: ${p.resumeText}
Job: ${p.jobDescription}
Rewrite summary and experience bullets to align with job requirements.`,

  optimizeLinkedInProfile: (p) => `You are a LinkedIn profile optimization expert. Analyze the resume below and generate improvements tailored for the role: "${p.targetRole}".

RESUME:
${p.resumeText}

Respond ONLY in ${p.language || "English"}. Return a JSON object with exactly these keys:
- "headlines": array of 3 optimized LinkedIn headline strings (max 220 chars each), keyword-rich for the target role
- "skills": array of 15 high-impact LinkedIn skill keywords relevant to the resume and target role
- "about": compelling LinkedIn "About" section rewrite (200-300 words), first-person, professional yet personable, ending with a call to action`,

  generateInterviewQuestionsFromJD: (p) => `You are an expert interviewer and career coach. Generate 8 tailored interview questions based on:

Job Description:
${p.jobDesc}

${p.resume ? `Candidate Resume:\n${p.resume}` : ""}

Mix of question types: behavioral (STAR method), technical, situational, culture fit.
Make questions specific to the role and industry.

Return JSON with:
- job_title: detected or inferred job title
- questions: array of 8 objects each with:
  - question: string
  - type: "behavioral" | "technical" | "situational" | "culture"
  - difficulty: "Easy" | "Medium" | "Hard"
  - hint: short hint on how to structure the answer (1 sentence)`,

  evaluateInterviewAnswer: (p) => `You are an expert interview coach. Evaluate this interview answer.

Question: ${p.question}
Candidate's Answer: ${p.answer}

Provide constructive feedback. Be specific and actionable. Return JSON with:
- score: number 0-100
- verdict: one-sentence overall assessment
- strengths: array of 2-3 specific strengths
- improvements: array of 2-3 specific improvements
- tip: one actionable tip to improve the answer`,

  chatWithDocument: (p) => {
    const hist = p.history?.slice(-6).map(h => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`).join("\n") || "";
    return `You are an expert document assistant. Answer questions about the provided document only.
DOCUMENT:
${(p.documentText || "").slice(0, 8000)}
${hist ? `\nCONVERSATION:\n${hist}\n` : ""}
USER: ${p.question}
Answer based only on document content. If the answer is not in the document, say so clearly. Use markdown formatting for clarity.`;
  },

  careerMentorChat: (p) => {
    const hist = p.history?.slice(-8).map(h => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`).join("\n") || "";
    return `You are a professional Career Mentor AI. Give personalized, actionable career advice.
${p.resumeContext ? `\nUSER'S RESUME CONTEXT:\n${p.resumeContext}\n` : ""}
${p.coverLetterContext ? `\nUSER'S COVER LETTER CONTEXT:\n${p.coverLetterContext}\n` : ""}
Always respond in ${p.language || "English"}. Be concise, actionable, and encouraging. Use markdown formatting.
${hist ? `\nCONVERSATION:\n${hist}\n` : ""}
User question: ${p.question}`;
  },
};

// JSON schema for ATS scoring
const ATS_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "number" },
    missingKeywords: { type: "array", items: { type: "string" } },
    foundKeywords:   { type: "array", items: { type: "string" } },
    suggestions:     { type: "array", items: { type: "string" } },
    assessment:      { type: "string" },
  },
};

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user   = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkAILimit(user)) {
    return Response.json({
      error: "limit_exceeded",
      message: `Daily AI limit reached for your ${user.plan || "free"} plan. Upgrade for more.`,
      plan: user.plan || "free",
    }, { status: 429 });
  }

  const body = await req.json();
  const { action, ...params } = body;
  if (!action) return Response.json({ error: "Missing action" }, { status: 400 });

  // Validate inputs per action
  const required = {
    scoreResumeATS:                     ["resumeText", "jobDescription"],
    translateText:                      ["text", "targetLanguage"],
    generateCoverLetter:                ["jobTitle", "company"],
    generateInterviewQuestions:         ["jobTitle"],
    optimizeLinkedInSummary:            [],
    summarizeDocument:                  ["text"],
    chatWithDocument:                   ["documentText", "question"],
    generateResume:                     ["name", "targetRole"],
    tailorResumeToJob:                  ["resumeText", "jobDescription"],
    optimizeLinkedInProfile:            ["resumeText", "targetRole"],
    generateInterviewQuestionsFromJD:   ["jobDesc"],
    evaluateInterviewAnswer:            ["question", "answer"],
    careerMentorChat:                   ["question"],
  };

  const req_fields = required[action];
  if (!req_fields) return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });

  for (const field of req_fields) {
    if (!params[field]) return Response.json({ error: `${field} is required` }, { status: 400 });
  }

  try {
    const promptFn = prompts[action];
    if (!promptFn) return Response.json({ error: `No prompt for action: ${action}` }, { status: 400 });

    const prompt   = promptFn(params);
    const inputSize = prompt.length;

    // Choose JSON mode for structured actions
    const jsonActions = new Set([
      "scoreResumeATS", "optimizeLinkedInProfile",
      "generateInterviewQuestionsFromJD", "evaluateInterviewAnswer",
    ]);
    const useJsonSchema = action === "scoreResumeATS" ? ATS_SCHEMA : null;
    const rawResult = await callAI(prompt, jsonActions.has(action) ? (useJsonSchema || true) : null);

    if (rawResult?._not_configured) {
      return Response.json({
        error: "ai_not_configured",
        message: "AI service is not configured. Set OPENAI_API_KEY or GEMINI_API_KEY in environment secrets.",
      }, { status: 503 });
    }

    // Shape output per action
    let result;
    switch (action) {
      case "scoreResumeATS":
        result = typeof rawResult === "object" ? rawResult : { assessment: rawResult, score: 0, missingKeywords: [], foundKeywords: [], suggestions: [] };
        break;
      case "translateText":
        result = { translation: rawResult };
        break;
      case "generateCoverLetter":
        result = { letter: rawResult };
        break;
      case "summarizeDocument":
        result = { summary: rawResult };
        break;
      case "chatWithDocument":
        result = { answer: rawResult };
        break;
      case "optimizeLinkedInProfile":
        result = typeof rawResult === "object" ? rawResult : { headlines: [], skills: [], about: rawResult };
        break;
      case "generateInterviewQuestionsFromJD":
        result = typeof rawResult === "object" ? rawResult : { job_title: "Interview", questions: [] };
        break;
      case "evaluateInterviewAnswer":
        result = typeof rawResult === "object" ? rawResult : { score: 0, verdict: rawResult, strengths: [], improvements: [], tip: "" };
        break;
      case "careerMentorChat":
        result = { answer: rawResult };
        break;
      default:
        result = { content: rawResult };
    }

    const outputSize = JSON.stringify(result).length;
    await recordUsage(base44, user, action, inputSize, outputSize, true, null);
    return Response.json({ success: true, result });

  } catch (error) {
    await recordUsage(base44, user, action, 0, 0, false, error.message).catch(() => {});
    return Response.json({ error: "ai_error", message: error.message }, { status: 500 });
  }
});