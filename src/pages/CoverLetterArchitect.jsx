import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Globe2, FileText, Zap, Copy, Download, RefreshCw,
  CheckCircle2, AlertCircle, TrendingUp, Target, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

const TONES = [
  { id: "assertive",   label: "Assertive",   desc: "Confident & direct",  color: "from-orange-500 to-red-500" },
  { id: "passionate",  label: "Passionate",  desc: "Enthusiastic & warm", color: "from-pink-500 to-rose-400" },
  { id: "concise",     label: "Concise",     desc: "Brief & punchy",      color: "from-blue-500 to-cyan-500" },
  { id: "formal",      label: "Formal",      desc: "Professional & polished", color: "from-slate-600 to-slate-500" },
  { id: "creative",    label: "Creative",    desc: "Unique & expressive", color: "from-purple-500 to-violet-500" },
  { id: "empathetic",  label: "Empathetic",  desc: "Human & collaborative", color: "from-green-500 to-emerald-400" },
];

const RESUME_VERSIONS = [
  { id: "v1", label: "Senior Dev Resume (Tech)" },
  { id: "v2", label: "Product Manager Resume" },
  { id: "v3", label: "General Resume" },
];

function PainPointCard({ point, addressed }) {
  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs transition-all ${
      addressed ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
    }`}>
      {addressed
        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
        : <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
      }
      <div>
        <p className={`font-semibold mb-0.5 ${addressed ? "text-green-700" : "text-amber-700"}`}>{point.label}</p>
        <p className={addressed ? "text-green-600" : "text-amber-600"}>{point.note}</p>
      </div>
    </div>
  );
}

export default function CoverLetterArchitect() {
  const { user } = useAuth();
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResume, setSelectedResume] = useState(RESUME_VERSIONS[0]);
  const [selectedTone, setSelectedTone] = useState(TONES[0]);
  const [coverLetter, setCoverLetter] = useState("");
  const [painPoints, setPainPoints] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [inputMode, setInputMode] = useState("url"); // url | paste

  const generate = async (isRegen = false) => {
    const jd = jobDescription.trim() || jobUrl.trim();
    if (!jd) { toast.warning("Please provide a job URL or paste the job description."); return; }
    if (isRegen) setRegenerating(true); else setLoading(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert career coach and professional writer. Generate a personalized, compelling cover letter.

RESUME VERSION: ${selectedResume.label}
TONE: ${selectedTone.label} (${selectedTone.desc})
JOB DESCRIPTION / URL: ${jd}

Generate:
1. A full, tailored cover letter (3-4 paragraphs, ~300 words) in the "${selectedTone.label}" tone
2. Identify 4-5 specific company pain points / needs from the job description
3. For each pain point, state whether the cover letter addresses it and how

Return JSON with:
{
  "cover_letter": "full cover letter text",
  "pain_points": [
    { "label": "pain point name", "note": "brief description of the need", "addressed": true/false }
  ],
  "score": number from 0-100 representing how well the cover letter matches the job
}`,
        response_json_schema: {
          type: "object",
          properties: {
            cover_letter: { type: "string" },
            pain_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  note: { type: "string" },
                  addressed: { type: "boolean" }
                }
              }
            },
            score: { type: "number" }
          }
        }
      });

      setCoverLetter(result.cover_letter || "");
      setPainPoints(result.pain_points || []);
      setScore(result.score || null);
      toast.success("Cover letter generated!");
    } catch (err) {
      if (err.message.includes("upgrade")) {
        toast.error("Limit Reached: Please upgrade to Premium or Business to continue using Cover Letter Architect.", {
          action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/pricing" }
        });
      } else {
        toast.error(err.message || "Generation failed.");
      }
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  const handleToneChange = async (tone) => {
    setSelectedTone(tone);
    if (coverLetter) {
      setRegenerating(true);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Rewrite the following cover letter in a "${tone.label}" tone (${tone.desc}). Keep the same content and facts, only change the writing style and voice. Return only the rewritten cover letter text.

ORIGINAL:
${coverLetter}`,
        });
        setCoverLetter(result || "");
        toast.success(`Tone changed to ${tone.label}!`);
      } catch (err) {
        if (err.message.includes("upgrade")) {
          toast.error("Limit Reached: Please upgrade to continue.");
        } else {
          toast.error("Failed to rewrite.");
        }
      } finally {
        setRegenerating(false);
      }
    }
  };

  const scoreColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-500";
  const scoreBg = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-2xl p-6 mb-2" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #4f8ef7 50%, #10b981 100%)" }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)" }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">AI Cover Letter Architect</h1>
                <p className="text-white/80 text-sm">Generate personalized cover letters cross-referenced with your resume and the job description.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/20 text-[10px] text-white font-black uppercase tracking-widest">
               Plan: {user?.plan || "Free"}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Inputs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Resume selector */}
          <div className="bg-card ink-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-foreground">Select Resume Version</h3>
            </div>
            <div className="space-y-2">
              {RESUME_VERSIONS.map(rv => (
                <button key={rv.id} onClick={() => setSelectedResume(rv)}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-all font-medium ${
                    selectedResume.id === rv.id
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border text-muted-foreground hover:border-accent/40"
                  }`}>
                  {rv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job input */}
          <div className="bg-card ink-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-foreground">Job Description</h3>
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1 mb-3">
              {[{ id: "url", label: "URL" }, { id: "paste", label: "Paste" }].map(m => (
                <button key={m.id} onClick={() => setInputMode(m.id)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${inputMode === m.id ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
                  {m.label}
                </button>
              ))}
            </div>
            {inputMode === "url"
              ? <Input placeholder="https://jobs.company.com/posting/..." value={jobUrl} onChange={e => setJobUrl(e.target.value)}
                  className="text-sm bg-background" icon={<Globe2 className="w-4 h-4" />} />
              : <Textarea placeholder="Paste the full job description here..." value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)} className="min-h-[150px] text-sm resize-none bg-background" />
            }
          </div>

          {/* Tone selector */}
          <div className="bg-card ink-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-foreground">Writing Tone</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map(tone => (
                <button key={tone.id} onClick={() => handleToneChange(tone)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTone.id === tone.id
                      ? "border-transparent text-white bg-gradient-to-br " + tone.color
                      : "border-border hover:border-accent/40"
                  }`}>
                  <p className={`text-xs font-bold ${selectedTone.id === tone.id ? "text-white" : "text-foreground"}`}>{tone.label}</p>
                  <p className={`text-[10px] mt-0.5 ${selectedTone.id === tone.id ? "text-white/80" : "text-muted-foreground"}`}>{tone.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={() => generate(false)} disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-accent to-green-500 hover:opacity-90 text-white font-bold gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
              : <><Sparkles className="w-4 h-4" />Generate Cover Letter</>
            }
          </Button>
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-3 space-y-5">
          {/* Score + Pain Points */}
          <AnimatePresence>
            {painPoints.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card ink-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-bold text-foreground">Job Match Analysis</h3>
                  </div>
                  {score !== null && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${scoreBg}`} style={{ width: `${score}%` }} />
                      </div>
                      <span className={`text-lg font-black ${scoreColor}`}>{score}%</span>
                    </div>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {painPoints.map((p, i) => <PainPointCard key={i} point={p} addressed={p.addressed} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cover letter editor */}
          <div className="bg-card ink-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">Cover Letter</h3>
                {regenerating && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />Rewriting...
                  </span>
                )}
              </div>
              {coverLetter && (
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(coverLetter); toast.success("Copied!"); }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Copy className="w-3.5 h-3.5" />Copy
                  </button>
                  <button onClick={() => generate(true)} disabled={regenerating}
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />Regenerate
                  </button>
                </div>
              )}
            </div>

            {coverLetter ? (
              <Textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                className="min-h-[400px] text-sm leading-relaxed resize-none bg-background"
              />
            ) : (
              <div className="min-h-[300px] rounded-xl bg-muted/30 border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-8">
                <Sparkles className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground mb-1">Your cover letter will appear here</p>
                <p className="text-xs text-muted-foreground">Select a resume, enter a job URL, choose a tone, and click Generate.</p>
              </div>
            )}

            {coverLetter && (
              <div className="flex gap-2 mt-3">
                <Button className="flex-1 h-9 rounded-xl text-xs bg-accent hover:bg-accent/90 text-white gap-1.5">
                  <Download className="w-3.5 h-3.5" />Download PDF
                </Button>
                <Button variant="outline" className="flex-1 h-9 rounded-xl text-xs gap-1.5">
                  <Copy className="w-3.5 h-3.5" />Copy to Clipboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}