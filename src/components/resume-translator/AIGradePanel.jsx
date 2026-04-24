import React, { useState } from "react";
import { Sparkles, Loader2, TrendingUp, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/api/config";
import { motion, AnimatePresence } from "framer-motion";

function ScoreRing({ score }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          <circle cx="48" cy="48" r="40" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${(score / 100) * 251.2} 251.2`}
            strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-foreground">{score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function SubScore({ label, score }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-400" : "bg-red-400";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-bold text-foreground">{score}/100</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function AIGradePanel({ resumeText, targetLang, jobTarget }) {
  const [grading, setGrading] = useState(false);
  const [grade, setGrade] = useState(null);

  const handleGrade = async () => {
    setGrading(true);
    setGrade(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/api/ai/invoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "invokeLLM",
          prompt: `You are an expert ATS analyst and career coach. Grade this translated resume.

Language: ${targetLang.name}
${jobTarget ? `Target Role: ${jobTarget}` : ""}

Resume:
${resumeText.slice(0, 4000)}

Grade it out of 100 on:
1. ATS Compatibility (keywords, formatting, structure)
2. Clarity & Readability (language quality, flow)
3. Role Effectiveness (how well it targets the job)

Return ONLY valid JSON in this exact format:
{
  "overall": number,
  "ats_score": number,
  "clarity_score": number,
  "effectiveness_score": number,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "tip": "string"
}`,
          response_json_schema: {
            type: "object",
            properties: {
              overall: { type: "number" },
              ats_score: { type: "number" },
              clarity_score: { type: "number" },
              effectiveness_score: { type: "number" },
              strengths: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } },
              tip: { type: "string" }
            },
            required: ["overall", "ats_score", "clarity_score", "effectiveness_score", "strengths", "improvements", "tip"]
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setGrade(data.result);
      } else {
        throw new Error(data.message || "Grading failed");
      }
    } catch (error) {
      console.error("Grading failed:", error);
    }
    setGrading(false);
  };

  return (
    <div className="bg-card ink-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" /> AI Resume Grade
        </p>
        <Button size="sm" onClick={handleGrade} disabled={grading}
          className="rounded-full h-8 text-xs gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground">
          {grading
            ? <><Loader2 className="w-3 h-3 animate-spin" /> Grading...</>
            : <><Sparkles className="w-3 h-3" /> Grade Resume</>}
        </Button>
      </div>

      <AnimatePresence>
        {!grade && !grading && (
          <p className="text-xs text-muted-foreground">
            Get an AI score out of 100 for ATS compatibility, clarity, and role effectiveness.
          </p>
        )}

        {grading && (
          <div className="flex items-center justify-center py-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">Analyzing your resume...</p>
            </div>
          </div>
        )}

        {grade && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Score ring + sub-scores */}
            <div className="flex items-center gap-6">
              <ScoreRing score={grade.overall} />
              <div className="flex-1 space-y-3">
                <SubScore label="ATS Compatibility" score={grade.ats_score} />
                <SubScore label="Clarity & Readability" score={grade.clarity_score} />
                <SubScore label="Role Effectiveness" score={grade.effectiveness_score} />
              </div>
            </div>

            {/* Strengths */}
            {grade.strengths?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Strengths
                </p>
                <ul className="space-y-1">
                  {grade.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {grade.improvements?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> To Improve
                </p>
                <ul className="space-y-1">
                  {grade.improvements.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tip */}
            {grade.tip && (
              <div className="bg-accent/5 border border-accent/20 rounded-xl px-3 py-2.5 flex gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">{grade.tip}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}