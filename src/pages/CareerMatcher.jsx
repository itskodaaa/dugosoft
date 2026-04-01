import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Upload, Link2, FileText, Sparkles, CheckCircle2, AlertCircle,
  TrendingUp, Plus, ExternalLink, MapPin, Building2, Clock, Crown, Zap, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const USER_PLAN = "business"; // "free" | "premium" | "business"
const canUse = USER_PLAN !== "free";

const MOCK_RESUME = `Alex Johnson — Senior Software Engineer
Skills: React, Node.js, TypeScript, Python, PostgreSQL, AWS, Docker
Experience: 6+ years building scalable web apps, led teams, SaaS products
Education: B.Sc. Computer Science, UC Berkeley`;

const JOB_BOARDS = [
  { name: "LinkedIn", url: "https://linkedin.com/jobs", logo: "🔵" },
  { name: "Indeed", url: "https://indeed.com", logo: "🟦" },
  { name: "Glassdoor", url: "https://glassdoor.com/Jobs", logo: "🟩" },
  { name: "Wellfound (AngelList)", url: "https://wellfound.com/jobs", logo: "🔷" },
  { name: "Otta", url: "https://otta.com", logo: "⚫" },
  { name: "RemoteOK", url: "https://remoteok.com", logo: "🌐" },
  { name: "We Work Remotely", url: "https://weworkremotely.com", logo: "🌍" },
  { name: "EuroJobs", url: "https://eurojobs.com", logo: "🇪🇺" },
];

const SCORE_COLOR = (s) => s >= 75 ? "text-green-600" : s >= 50 ? "text-amber-600" : "text-red-500";
const SCORE_BG = (s) => s >= 75 ? "bg-green-500" : s >= 50 ? "bg-amber-500" : "bg-red-500";

export default function CareerMatcher() {
  const [inputMode, setInputMode] = useState("text"); // text | url
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [resume, setResume] = useState(MOCK_RESUME);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (!canUse) { toast.warning("AI Career Matcher is available on Premium and Business plans."); return; }
    const jd = inputMode === "url" ? jobUrl : jobText;
    if (!jd.trim()) { toast.warning("Please enter a job description or URL."); return; }
    if (!resume.trim()) { toast.warning("Please enter your resume summary."); return; }
    setLoading(true);
    setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert ATS and career coach. Given the job description and resume below, provide a detailed analysis.

JOB DESCRIPTION:
${jd}

RESUME:
${resume}

Return a JSON object with:
- ats_score: number 0-100
- fit_rating: "Excellent" | "Good" | "Fair" | "Poor"
- matched_skills: array of strings (skills from resume that match JD)
- missing_skills: array of strings (skills in JD not in resume)
- suggested_bullets: array of 4-5 specific bullet points the user should add to their resume to improve chances
- strengths: array of 3 strengths the user brings for this role
- weaknesses: array of 2-3 gaps to address
- job_title_guess: string — the job title being applied to
- suggested_jobs: array of 5 objects: { title: string, company: string, location: string, url: string, board: string, match_pct: number } — real-looking job openings from global job boards (LinkedIn, Indeed, Glassdoor, Otta, RemoteOK, Wellfound, etc.) that would match this resume. Use realistic company names, locations (worldwide), and deep-link job search URLs.`,
      response_json_schema: {
        type: "object",
        properties: {
          ats_score: { type: "number" },
          fit_rating: { type: "string" },
          matched_skills: { type: "array", items: { type: "string" } },
          missing_skills: { type: "array", items: { type: "string" } },
          suggested_bullets: { type: "array", items: { type: "string" } },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          job_title_guess: { type: "string" },
          suggested_jobs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                company: { type: "string" },
                location: { type: "string" },
                url: { type: "string" },
                board: { type: "string" },
                match_pct: { type: "number" }
              }
            }
          }
        }
      }
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-accent" /> AI Career Matcher
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Match your resume to any job description, get an ATS score, improvement suggestions, and global job openings.</p>
          </div>
          {!canUse && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
              <Crown className="w-3.5 h-3.5" /> Premium & Business Plan only
            </div>
          )}
        </div>
      </motion.div>

      {!canUse ? (
        <div className="bg-card ink-border rounded-2xl p-12 text-center">
          <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Premium Feature</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">AI Career Matcher is available on Premium ($12/mo) and Business ($29/mo) plans.</p>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8">Upgrade Now</Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Input mode toggle */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {[{ k: "text", label: "Paste Text" }, { k: "url", label: "Job URL" }].map(({ k, label }) => (
                <button key={k} onClick={() => setInputMode(k)}
                  className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${inputMode === k ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </button>
              ))}
            </div>

            {inputMode === "text" ? (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Job Description</label>
                <Textarea placeholder="Paste the full job description here..." value={jobText} onChange={e => setJobText(e.target.value)}
                  className="min-h-[160px] resize-none bg-background text-sm" />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Job Posting URL</label>
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input placeholder="https://linkedin.com/jobs/view/..." value={jobUrl} onChange={e => setJobUrl(e.target.value)} className="bg-background text-sm" />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Your Resume / CV Summary</label>
              <Textarea value={resume} onChange={e => setResume(e.target.value)}
                className="min-h-[140px] resize-none bg-background text-sm" />
              <p className="text-xs text-muted-foreground mt-1">Paste your full resume text or a summary.</p>
            </div>

            <Button onClick={analyze} disabled={loading}
              className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing with AI...</>
              ) : (
                <><Sparkles className="w-4 h-4" />Analyze Match</>
              )}
            </Button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  {/* Score card */}
                  <div className="bg-card ink-border rounded-2xl p-6 flex items-center gap-6">
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none"
                          stroke={result.ats_score >= 75 ? "#22c55e" : result.ats_score >= 50 ? "#f59e0b" : "#ef4444"}
                          strokeWidth="3" strokeDasharray={`${result.ats_score} 100`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xl font-black ${SCORE_COLOR(result.ats_score)}`}>{result.ats_score}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">ATS Score</p>
                      <p className={`text-2xl font-extrabold ${SCORE_COLOR(result.ats_score)}`}>{result.fit_rating} Match</p>
                      <p className="text-sm text-muted-foreground mt-1">for: <span className="font-medium text-foreground">{result.job_title_guess}</span></p>
                    </div>
                  </div>

                  {/* Skills grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-card ink-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-bold text-foreground">Matched Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matched_skills?.map((s, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-card ink-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-foreground">Missing Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missing_skills?.map((s, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Suggested bullets */}
                  <div className="bg-card ink-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-foreground">AI-Suggested Resume Bullet Points</span>
                    </div>
                    <div className="space-y-2">
                      {result.suggested_bullets?.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/40 group">
                          <Plus className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                          <p className="text-sm text-foreground leading-relaxed flex-1">{b}</p>
                          <button onClick={() => { navigator.clipboard.writeText(b); toast.success("Copied!"); }}
                            className="opacity-0 group-hover:opacity-100 text-xs text-accent font-medium hover:underline shrink-0">Copy</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & weaknesses */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-card ink-border rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-green-600 mb-3">Strengths</p>
                      <ul className="space-y-2">
                        {result.strengths?.map((s, i) => <li key={i} className="text-xs text-muted-foreground flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-card ink-border rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3">Gaps to Address</p>
                      <ul className="space-y-2">
                        {result.weaknesses?.map((w, i) => <li key={i} className="text-xs text-muted-foreground flex gap-2"><AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />{w}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Job Openings */}
                  <div className="bg-card ink-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-foreground">Matching Job Openings — Worldwide</span>
                    </div>
                    <div className="space-y-3">
                      {result.suggested_jobs?.map((job, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-foreground">{job.title}</p>
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent">{job.match_pct}% match</span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground"><Building2 className="w-3 h-3" />{job.company}</span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{job.location}</span>
                              <span className="text-xs text-muted-foreground">via {job.board}</span>
                            </div>
                          </div>
                          <a href={job.url} target="_blank" rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1 text-xs font-semibold text-accent border border-accent/30 px-3 py-1.5 rounded-full hover:bg-accent/10 transition-colors">
                            Apply <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                    {/* Job boards list */}
                    <div className="mt-5 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-3">Search more on global job boards:</p>
                      <div className="flex flex-wrap gap-2">
                        {JOB_BOARDS.map((b, i) => (
                          <a key={i} href={b.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors flex items-center gap-1">
                            {b.logo} {b.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center min-h-[480px] text-center bg-card ink-border rounded-2xl p-10">
                  <Target className="w-14 h-14 text-muted-foreground/30 mb-4" />
                  <p className="text-base font-semibold text-foreground mb-2">Your match analysis will appear here</p>
                  <p className="text-sm text-muted-foreground max-w-sm">Paste a job description or URL, add your resume, then click Analyze Match.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}