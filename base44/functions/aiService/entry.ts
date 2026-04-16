/**
 * Dugosoft AI Service — server-side, unified backend for all AI features.
 * Uses GEMINI_API_KEY (set as secret). Falls back to a structured "not configured" response.
 * Never exposes API keys to the frontend.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-1.5-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── Helper: call Gemini ────────────────────────────────────────────────────────
async function callGemini(prompt, jsonSchema = null) {
  if (!GEMINI_API_KEY) {
    return { _not_configured: true, message: "AI service is not configured. Please set GEMINI_API_KEY in environment secrets." };
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  if (jsonSchema) {
    body.generationConfig.responseMimeType = "application/json";
    body.generationConfig.responseSchema = jsonSchema;
  }

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 429) {
      throw new Error("AI quota exceeded. Please try again in a few moments or upgrade your Gemini API plan.");
    }
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (jsonSchema) {
    try { return JSON.parse(text); } catch { return text; }
  }
  return text;
}

// ── Usage recording ────────────────────────────────────────────────────────────
async function recordUsage(base44, user, action) {
  const today = new Date().toISOString().split("T")[0];
  const existing = await base44.asServiceRole.entities.UsageLog.filter({ user_id: user.id, date: today });
  if (existing.length > 0) {
    const log = existing[0];
    await base44.asServiceRole.entities.UsageLog.update(log.id, {
      ai_requests: (log.ai_requests || 0) + 1,
      plan: user.plan || "free",
    });
  } else {
    await base44.asServiceRole.entities.UsageLog.create({
      user_id: user.id,
      date: today,
      ai_requests: 1,
      pdf_count: 0,
      ocr_count: 0,
      conversions: 0,
      plan: user.plan || "free",
    });
  }
  // Also increment on user record
  await base44.auth.updateMe({ ai_requests: (user.ai_requests || 0) + 1 });
}

// ── Plan limit check ──────────────────────────────────────────────────────────
function checkAILimit(user) {
  const plan = user.plan || "free";
  const limits = { free: 10, pro: 200, business: Infinity };
  const used = user.ai_requests || 0;
  return used < limits[plan];
}

// ── Prompt builders ───────────────────────────────────────────────────────────
function buildATSPrompt(resumeText, jobDescription) {
  return `You are a professional ATS (Applicant Tracking System) analyst and career coach.

Analyze this resume against the job description and provide detailed scoring.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide:
1. An ATS compatibility score (0-100) based on keyword match, formatting, and relevance
2. Missing keywords that appear in the job description but not the resume
3. Keywords found in both
4. Specific, actionable suggestions to improve the resume for this specific job
5. A brief overall assessment

Be specific, honest, and helpful. Base the score purely on the actual content provided.`;
}

function buildTranslationPrompt(text, targetLanguage, tone) {
  return `You are a professional translator with expertise in business and career documents.

Translate the following text to ${targetLanguage}.
Tone: ${tone || "professional"}
Preserve all formatting, structure, and meaning.
If the text is a resume or cover letter, maintain the professional register appropriate for ${targetLanguage}-speaking job markets.

TEXT TO TRANSLATE:
${text}

Provide only the translated text, no explanations or notes.`;
}

function buildResumeGenerationPrompt(data) {
  return `You are an expert resume writer and career coach.

Generate a complete, ATS-optimized professional resume for:
- Full Name: ${data.name}
- Target Role: ${data.targetRole}
- Years of Experience: ${data.yearsExperience}
- Industry: ${data.industry}
- Key Skills: ${data.skills}
- Current/Recent Role: ${data.currentRole || "Not specified"}
- Education: ${data.education || "Not specified"}
- Achievements: ${data.achievements || "Not specified"}
- Target Region: ${data.targetRegion || "Global"}

Write a professional summary (3-4 sentences), suggest experience bullet points with quantified achievements, and a skills section.
Format clearly. Be specific and avoid generic phrases.`;
}

function buildCoverLetterPrompt(data) {
  return `Write a ${data.tone || "professional"} cover letter in ${data.language || "English"} for:
- Job Title: ${data.jobTitle}
- Company: ${data.company}
- Applicant Name: ${data.name || "the applicant"}
- Years of Experience: ${data.experience || "several years"}
- Key Qualifications: ${data.qualifications || "relevant skills and experience"}

Write a complete, ready-to-send cover letter with proper greeting, 3 compelling paragraphs (introduction, experience highlight, closing), and sign-off.
Make it specific, authentic, and tailored to the role. Do not use placeholder text like [X] or [Company].
Respond entirely in ${data.language || "English"}.`;
}

function buildInterviewQuestionsPrompt(data) {
  return `You are an expert career coach and interview specialist.

Generate ${data.count || 10} realistic interview questions for:
- Job Title: ${data.jobTitle}
- Company: ${data.company || "a leading company"}
- Industry: ${data.industry || "technology"}
- Experience Level: ${data.level || "mid-level"}
- Focus Areas: ${data.focusAreas || "general competencies"}

Include a mix of: behavioral, technical, situational, and role-specific questions.
For each question, provide:
1. The question
2. What the interviewer is really assessing
3. A brief tip for answering it well`;
}

function buildLinkedInOptimizationPrompt(data) {
  return `You are a LinkedIn optimization expert and personal branding specialist.

Optimize this LinkedIn profile for:
- Target Role: ${data.targetRole}
- Current Role/Summary: ${data.currentSummary}
- Key Skills: ${data.skills}
- Industry: ${data.industry || "technology"}

Provide:
1. An optimized headline (under 220 chars, keyword-rich)
2. A compelling "About" section (1300 chars max, first-person, achievement-focused)
3. 10 recommended skills to add
4. 3 suggested post ideas to boost visibility`;
}

function buildDocumentSummaryPrompt(text) {
  return `You are a professional document analyst.

Summarize this document concisely and accurately:

${text}

Provide:
1. Executive summary (2-3 sentences)
2. Key points (bullet list)
3. Action items or important dates if any
4. Document type/category`;
}

function buildChatWithDocumentPrompt(documentText, question, history) {
  const historyStr = history?.map(h => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`).join("\n") || "";
  return `You are a helpful document assistant. Answer questions about the provided document accurately and concisely.

DOCUMENT CONTENT:
${documentText}

${historyStr ? `CONVERSATION HISTORY:\n${historyStr}\n` : ""}
USER QUESTION: ${question}

Answer based only on the document content. If the answer is not in the document, say so clearly.`;
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Check AI limit before processing
  if (!checkAILimit(user)) {
    return Response.json({
      error: "limit_exceeded",
      message: `Daily AI request limit reached for your ${user.plan || "free"} plan. Upgrade for more.`,
      plan: user.plan || "free",
    }, { status: 429 });
  }

  const body = await req.json();
  const { action, ...params } = body;

  if (!action) return Response.json({ error: "Missing action" }, { status: 400 });

  let result;

  try {
    switch (action) {
      case "scoreResumeATS": {
        if (!params.resumeText || !params.jobDescription) {
          return Response.json({ error: "resumeText and jobDescription are required" }, { status: 400 });
        }
        const schema = {
          type: "object",
          properties: {
            score: { type: "number" },
            missingKeywords: { type: "array", items: { type: "string" } },
            foundKeywords: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
            assessment: { type: "string" },
          }
        };
        result = await callGemini(buildATSPrompt(params.resumeText, params.jobDescription), schema);
        break;
      }

      case "translateText": {
        if (!params.text || !params.targetLanguage) {
          return Response.json({ error: "text and targetLanguage are required" }, { status: 400 });
        }
        result = { translation: await callGemini(buildTranslationPrompt(params.text, params.targetLanguage, params.tone)) };
        break;
      }

      case "generateCoverLetter": {
        if (!params.jobTitle || !params.company) {
          return Response.json({ error: "jobTitle and company are required" }, { status: 400 });
        }
        result = { letter: await callGemini(buildCoverLetterPrompt(params)) };
        break;
      }

      case "generateInterviewQuestions": {
        if (!params.jobTitle) {
          return Response.json({ error: "jobTitle is required" }, { status: 400 });
        }
        result = { content: await callGemini(buildInterviewQuestionsPrompt(params)) };
        break;
      }

      case "optimizeLinkedInSummary": {
        if (!params.currentSummary && !params.skills) {
          return Response.json({ error: "currentSummary or skills required" }, { status: 400 });
        }
        result = { content: await callGemini(buildLinkedInOptimizationPrompt(params)) };
        break;
      }

      case "summarizeDocument": {
        if (!params.text) {
          return Response.json({ error: "text is required" }, { status: 400 });
        }
        result = { summary: await callGemini(buildDocumentSummaryPrompt(params.text)) };
        break;
      }

      case "chatWithDocument": {
        if (!params.documentText || !params.question) {
          return Response.json({ error: "documentText and question are required" }, { status: 400 });
        }
        result = { answer: await callGemini(buildChatWithDocumentPrompt(params.documentText, params.question, params.history)) };
        break;
      }

      case "generateResume": {
        if (!params.name || !params.targetRole) {
          return Response.json({ error: "name and targetRole are required" }, { status: 400 });
        }
        result = { content: await callGemini(buildResumeGenerationPrompt(params)) };
        break;
      }

      case "tailorResumeToJob": {
        if (!params.resumeText || !params.jobDescription) {
          return Response.json({ error: "resumeText and jobDescription are required" }, { status: 400 });
        }
        const tailor = `You are an expert resume coach. Tailor this resume to match the job description.
Resume: ${params.resumeText}
Job Description: ${params.jobDescription}
Rewrite the summary and experience bullets to align with the job requirements. Keep facts truthful.`;
        result = { content: await callGemini(tailor) };
        break;
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // Handle not-configured state
    if (result?._not_configured) {
      return Response.json({ error: "ai_not_configured", message: result.message }, { status: 503 });
    }

    // Record usage
    await recordUsage(base44, user, action);

    return Response.json({ success: true, result });

  } catch (error) {
    return Response.json({ error: "ai_error", message: error.message }, { status: 500 });
  }
});