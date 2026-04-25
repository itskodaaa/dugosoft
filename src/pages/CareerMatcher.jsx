import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Link2, Sparkles, CheckCircle2, AlertCircle,
  TrendingUp, Plus, ExternalLink, MapPin, Building2, Crown,
  RefreshCw, ChevronDown, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import JobUrlParser from "../components/shared/JobUrlParser";
import { API_BASE } from "@/api/config";
import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";

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
  const { user } = useAuth();
  const [inputMode, setInputMode] = useState("text"); // text | url
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [resume, setResume] = useState(MOCK_RESUME);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [dbJobs, setDbJobs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

  const fetchSharedJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/shared`);
      const data = await res.json();
      setDbJobs(data.jobs || []);
    } catch (e) {
      console.error("Failed to fetch shared jobs", e);
    }
  };

  useEffect(() => {
    fetchSharedJobs();
  }, []);

  const buildPrompt = (jd, seedOffset = 0) => `You are an expert ATS and career coach. Given the job description and resume below, provide a detailed analysis.

JOB DESCRIPTION:
${jd}

RESUME:
${resume}

${seedOffset > 0 ? `IMPORTANT: Generate DIFFERENT job openings than before. Use different companies, locations, and boards. Seed variation: ${seedOffset}` : ""}

Return a JSON object with:
- ats_score: number 0-100
- fit_rating: "Excellent" | "Good" | "Fair" | "Poor"
- matched_skills: array of strings
- missing_skills: array of strings
- suggested_bullets: array of 4-5 specific bullet points
- strengths: array of 3 strengths
- weaknesses: array of 2-3 gaps
- job_title_guess: string
- company_guess: string
- suggested_jobs: array of 8 objects with { title, company, location, url, board, match_pct } — use varied global companies (LinkedIn, Indeed, Glassdoor, Otta, RemoteOK, Wellfound, EuroJobs, We Work Remotely). Every call should produce DIFFERENT companies and locations.`;

  const SCHEMA = {
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
      company_guess: { type: "string" },
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
  };

  const analyze = async () => {
    const jd = inputMode === "url" ? jobUrl : jobText;
    if (!jd.trim()) { toast.warning("Please enter a job description or URL."); return; }
    if (!resume.trim()) { toast.warning("Please enter your resume summary."); return; }
    setLoading(true);
    setResult(null);
    setAllJobs([]);
    setVisibleCount(5);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(jd),
        response_json_schema: SCHEMA,
      });
      setResult(res);
      
      // Merge AI jobs with DB jobs
      const aiJobs = res.suggested_jobs || [];
      const merged = [...aiJobs];
      dbJobs.forEach(dbj => {
        if (!merged.find(j => j.company === dbj.company && j.title === dbj.title)) {
          merged.push({ ...dbj, match_pct: Math.floor(Math.random() * 20) + 60 }); // Mock match pct for DB jobs
        }
      });
      setAllJobs(merged);

      // Save this scanned job to DB
      try {
        const token = localStorage.getItem("auth_token");
        fetch(`${API_BASE}/api/jobs/shared`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            title: res.job_title_guess || "Job Opportunity",
            company: res.company_guess || "Company",
            url: inputMode === "url" ? jobUrl : "",
            description: jd.slice(0, 5000),
            board: inputMode === "url" ? "LinkedIn/Indeed" : "Direct Paste"
          })
        });
      } catch (e) {}
    } catch (err) {
      if (err.message.includes("upgrade")) {
        toast.error("Limit Reached: Please upgrade to the Premium or Business plan to continue using AI features.", {
          action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/pricing" }
        });
      } else {
        toast.error(err.message || "AI Analysis failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshJobs = async () => {
    if (!result) return;
    setRefreshing(true);
    const jd = inputMode === "url" ? jobUrl : jobText;
    const seed = Date.now();
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(jd, seed),
        response_json_schema: SCHEMA,
      });
      setAllJobs(res.suggested_jobs || []);
      setVisibleCount(5);
      toast.success("Loaded fresh job openings!");
    } catch (err) {
      if (err.message.includes("upgrade")) {
        toast.error("Limit Reached: Please upgrade to continue.");
      } else {
        toast.error("Failed to refresh jobs.");
      }
    }
    setRefreshing(false);
  };

  const loadMoreJobs = async () => {
    const jd = inputMode === "url" ? jobUrl : jobText;
    if (visibleCount < allJobs.length) {
      setVisibleCount(v => Math.min(v + 5, allJobs.length));
      return;
    }
    // Fetch more from AI
    setLoadingMore(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(jd, allJobs.length + Date.now()),
        response_json_schema: SCHEMA,
      });
      const newJobs = (res.suggested_jobs || []).filter(j =>
        !allJobs.some(existing => existing.company === j.company && existing.title === j.title)
      );
      setAllJobs(prev => [...prev, ...newJobs]);
      setVisibleCount(v => v + 5);
      toast.success(`Loaded ${newJobs.length} more job openings!`);
    } catch (err) {
      if (err.message.includes("upgrade")) {
        toast.error("Limit Reached: Please upgrade to continue.");
      } else {
        toast.error("Failed to load more jobs.");
      }
    }
    setLoadingMore(false);
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/5 border border-accent/20 text-[10px] text-accent font-black uppercase tracking-widest">
             Plan: {user?.plan || "Free"}
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Job URL Parser */}
            <JobUrlParser onParsed={({ description, title }) => {
              setJobText(description);
              setInputMode("text");
            }} />

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
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span className="text-sm font-bold text-foreground">Matching Job Openings — Worldwide</span>
                        <span className="text-xs text-muted-foreground">({allJobs.length} found)</span>
                      </div>
                      <Button onClick={refreshJobs} disabled={refreshing} variant="outline" size="sm"
                        className="gap-1.5 rounded-full text-xs h-8">
                        {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        New Results
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {allJobs.slice(0, visibleCount).map((job, i) => (
                        <motion.div key={`${job.company}-${i}`}
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-blue-500/20 flex items-center justify-center text-xs font-black text-accent shrink-0">
                            {job.company?.[0] || "C"}
                          </div>
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
                        </motion.div>
                      ))}
                    </div>

                    {/* Load More */}
                    <div className="mt-4 flex justify-center">
                      <Button onClick={loadMoreJobs} disabled={loadingMore} variant="outline" size="sm"
                        className="gap-2 rounded-full text-xs">
                        {loadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {loadingMore ? "Loading more..." : "Load More Jobs"}
                      </Button>
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
    </div>
  );
}