import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sparkles, Target, BookOpen, ExternalLink, Copy, Check,
  TrendingUp, AlertTriangle, CheckCircle2, BarChart3, Share2,
  ChevronDown, ChevronUp, Linkedin, Mail
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const INDUSTRIES = [
  "Software Engineering", "Data Science & AI", "Product Management",
  "UX/UI Design", "DevOps & Cloud", "Cybersecurity", "Finance & FinTech",
  "Marketing & Growth", "Healthcare", "Business Analysis",
];

const COURSE_PLATFORMS = {
  coursera: { label: "Coursera", color: "bg-blue-600", url: "https://coursera.org/search?query=" },
  udemy: { label: "Udemy", color: "bg-purple-600", url: "https://udemy.com/courses/search/?q=" },
  linkedin: { label: "LinkedIn Learning", color: "bg-[#0A66C2]", url: "https://linkedin.com/learning/search?keywords=" },
  google: { label: "Google", color: "bg-green-600", url: "https://grow.google/certificates/?q=" },
};

export default function SkillGapAnalysis() {
  const [resumeText, setResumeText] = useState("");
  const [targetIndustry, setTargetIndustry] = useState(INDUSTRIES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [expanded, setExpanded] = useState({ gaps: true, courses: true, present: true });

  const handleAnalyze = async () => {
    if (!resumeText.trim()) { toast.warning("Please paste your resume/skills first."); return; }
    setLoading(true);
    setResult(null);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a career skills analyst. Analyze this resume/skills profile against requirements for the "${targetIndustry}" industry.

RESUME/SKILLS:
${resumeText}

Return a JSON with:
- "match_score": number 0-100 representing how well the candidate matches the industry
- "present_skills": array of strings — skills the candidate already has that are relevant
- "skill_gaps": array of objects each with "skill" (string), "importance" ("critical"|"high"|"medium"), "description" (1 sentence why it matters)
- "courses": array of 4 objects each with "title" (course/cert name), "provider" ("coursera"|"udemy"|"linkedin"|"google"), "duration" (e.g. "6 weeks"), "why" (1 sentence on why this bridges a gap), "skill_covered" (which gap skill it covers)
- "summary": 2-3 sentence overall analysis

Return pure JSON only.`,
      response_json_schema: {
        type: "object",
        properties: {
          match_score: { type: "number" },
          present_skills: { type: "array", items: { type: "string" } },
          skill_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                importance: { type: "string" },
                description: { type: "string" },
              },
            },
          },
          courses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                provider: { type: "string" },
                duration: { type: "string" },
                why: { type: "string" },
                skill_covered: { type: "string" },
              },
            },
          },
          summary: { type: "string" },
        },
      },
    });
    setResult(response);
    setLoading(false);
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const shareResults = () => {
    if (!result) return;
    const text = `My Skill Gap Analysis for ${targetIndustry}:\n\nMatch Score: ${result.match_score}%\n\nSkill Gaps:\n${result.skill_gaps?.map(g => `• ${g.skill} (${g.importance})`).join("\n")}\n\nRecommended Courses:\n${result.courses?.map(c => `• ${c.title} — ${c.provider}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    toast.success("Results copied to clipboard!");
  };

  const importanceColor = { critical: "bg-red-100 text-red-700 border-red-200", high: "bg-orange-100 text-orange-700 border-orange-200", medium: "bg-yellow-100 text-yellow-700 border-yellow-200" };

  const scoreColor = !result ? "" : result.match_score >= 75 ? "text-green-600" : result.match_score >= 50 ? "text-orange-500" : "text-red-500";
  const scoreBar = !result ? "" : result.match_score >= 75 ? "bg-green-500" : result.match_score >= 50 ? "bg-orange-500" : "bg-red-500";

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Skill Gap Analysis</h1>
        </div>
        <p className="text-muted-foreground text-sm">Compare your skills to your target industry — get personalized course recommendations to bridge the gap.</p>
      </motion.div>

      {/* Input panel */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-card ink-border rounded-2xl p-6 space-y-5">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Target Industry</Label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map(ind => (
              <button key={ind} onClick={() => setTargetIndustry(ind)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${targetIndustry === ind ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border text-muted-foreground hover:border-accent/40"}`}>
                {ind}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Your Resume / Skills</Label>
          <Textarea
            placeholder="Paste your resume, skills list, or work experience here..."
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            className="min-h-[160px] resize-none text-sm"
          />
        </div>

        <Button onClick={handleAnalyze} disabled={loading}
          className="w-full h-12 rounded-xl font-semibold gap-2 bg-gradient-to-r from-accent to-purple-600 hover:opacity-90 text-white border-0">
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing your skill profile...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Analyze My Skills</>
          )}
        </Button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Score card */}
            <div className="bg-card ink-border rounded-2xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Industry Match Score</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-5xl font-black ${scoreColor}`}>{result.match_score}%</span>
                    <span className="text-sm text-muted-foreground mb-1.5">match for {targetIndustry}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={shareResults}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-all">
                    <Copy className="w-3.5 h-3.5" /> Copy Report
                  </button>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(`My ${targetIndustry} skill match: ${result.match_score}%`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold text-white bg-[#0A66C2] hover:bg-[#0A66C2]/90 transition-all">
                    <Linkedin className="w-3.5 h-3.5" /> Share
                  </a>
                </div>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${result.match_score}%` }} transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${scoreBar}`} />
              </div>
              {result.summary && (
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{result.summary}</p>
              )}
            </div>

            {/* Present skills */}
            <Section icon={<CheckCircle2 className="w-4 h-4 text-green-500" />} title={`Present Skills (${result.present_skills?.length || 0})`}
              expanded={expanded.present} onToggle={() => setExpanded(p => ({ ...p, present: !p.present }))}>
              <div className="flex flex-wrap gap-2">
                {result.present_skills?.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">{s}</span>
                ))}
              </div>
            </Section>

            {/* Skill gaps */}
            <Section icon={<AlertTriangle className="w-4 h-4 text-orange-500" />} title={`Skill Gaps (${result.skill_gaps?.length || 0})`}
              expanded={expanded.gaps} onToggle={() => setExpanded(p => ({ ...p, gaps: !p.gaps }))}>
              <div className="space-y-3">
                {result.skill_gaps?.map((gap, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 mt-0.5 ${importanceColor[gap.importance] || importanceColor.medium}`}>
                      {gap.importance?.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">{gap.skill}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{gap.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Recommended courses */}
            <Section icon={<BookOpen className="w-4 h-4 text-accent" />} title="Recommended Courses & Certifications"
              expanded={expanded.courses} onToggle={() => setExpanded(p => ({ ...p, courses: !p.courses }))}>
              <div className="grid sm:grid-cols-2 gap-3">
                {result.courses?.map((course, i) => {
                  const platform = COURSE_PLATFORMS[course.provider] || COURSE_PLATFORMS.coursera;
                  const searchUrl = platform.url + encodeURIComponent(course.title);
                  return (
                    <div key={i} className="bg-muted/30 rounded-xl border border-border p-4 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-foreground leading-snug flex-1">{course.title}</p>
                        <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full shrink-0 ${platform.color}`}>
                          {platform.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{course.why}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Covers: <strong className="text-foreground">{course.skill_covered}</strong> · {course.duration}
                        </span>
                        <a href={searchUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ icon, title, expanded, onToggle, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="font-semibold text-sm text-foreground">{title}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}