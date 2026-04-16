import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Linkedin, Copy, Check, ChevronDown, ChevronUp, User, Tag, FileText, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { useAI } from "@/lib/useAI";
import SectionShareBar from "@/components/shared/SectionShareBar";

export default function LinkedInOptimizer() {
  const { lang } = useLang();
  const { call, loading } = useAI();
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [expanded, setExpanded] = useState({ headline: true, skills: true, about: true });

  const langName = { en: "English", it: "Italian", fr: "French", es: "Spanish", de: "German" }[lang] || "English";

  const handleAnalyze = async () => {
    if (!resumeText.trim()) { toast.warning("Please paste your resume text first."); return; }
    if (!targetRole.trim()) { toast.warning("Please enter your target job role."); return; }
    setResult(null);
    const data = await call("optimizeLinkedInProfile", { resumeText, targetRole, language: langName });
    if (data) setResult(data);
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#0A66C2" }}>
            <Linkedin className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">LinkedIn Optimizer</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8">
          Paste your resume and target role — get AI-optimized headlines, skill keywords, and an About section rewrite.
        </p>
      </motion.div>

      {/* Inputs */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Your Resume</Label>
          <Textarea
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="min-h-[200px] bg-card ink-border resize-none text-sm"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Target Job Role</Label>
            <Input
              placeholder="e.g. Senior Product Manager, DevOps Engineer..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="bg-card ink-border"
            />
          </div>
          <div className="p-4 rounded-xl bg-[#0A66C2]/5 border border-[#0A66C2]/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">What you'll get:</strong>
              <br />• 3 keyword-rich headline options
              <br />• 15 high-impact skill keywords to add
              <br />• Full "About" section rewrite in your voice
            </p>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full h-12 rounded-full font-semibold gap-2 text-white"
            style={{ background: loading ? undefined : "#0A66C2" }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Optimize My Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Share bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl bg-[#0A66C2]/5 border border-[#0A66C2]/20">
              <p className="text-xs text-muted-foreground font-medium">Optimization complete — share your updated profile</p>
              <div className="flex gap-2">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold text-white transition-all"
                  style={{ background: "#0A66C2" }}
                >
                  <Linkedin className="w-3.5 h-3.5" /> Share on LinkedIn
                </a>
                <button
                  onClick={() => {
                    const text = `LinkedIn Profile Optimized!\n\nHeadlines:\n${result.headlines?.join("\n")}\n\nSkills: ${result.skills?.join(", ")}`;
                    const href = `https://mail.google.com/mail/?view=cm&fs=1&su=My+LinkedIn+Profile+Optimization&body=${encodeURIComponent(text)}`;
                    window.open(href, "_blank");
                  }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold text-white bg-[#EA4335] hover:bg-[#EA4335]/90 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Gmail
                </button>
                <button
                  onClick={() => {
                    const text = `My LinkedIn optimization summary:\n${result.headlines?.[0]}\n\nSkills: ${result.skills?.join(", ")}`;
                    navigator.clipboard.writeText(text);
                    toast.success("Optimization summary copied!");
                  }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border border-border bg-card hover:bg-muted transition-all text-foreground"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy All
                </button>
              </div>
            </div>
            {/* Headlines */}
            <ResultSection
              icon={<User className="w-4 h-4 text-[#0A66C2]" />}
              title="Headline Options"
              expanded={expanded.headline}
              onToggle={() => toggle("headline")}
            >
              <div className="space-y-3">
                {result.headlines?.map((h, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                    <p className="text-sm font-medium text-foreground flex-1">{h}</p>
                    <button onClick={() => copyText(h, `h${i}`)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                      {copiedKey === `h${i}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
              <SectionShareBar text={result.headlines?.join("\n") || ""} label="headlines" />
            </ResultSection>

            {/* Skills */}
            <ResultSection
              icon={<Tag className="w-4 h-4 text-[#0A66C2]" />}
              title="Skill Keywords to Add"
              expanded={expanded.skills}
              onToggle={() => toggle("skills")}
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {result.skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20">
                    {skill}
                  </span>
                ))}
              </div>
              <SectionShareBar text={`My LinkedIn Skills to Add:\n${result.skills?.join(", ")}`} label="skills" />
            </ResultSection>

            {/* About */}
            <ResultSection
              icon={<FileText className="w-4 h-4 text-[#0A66C2]" />}
              title="About Section Rewrite"
              expanded={expanded.about}
              onToggle={() => toggle("about")}
            >
              <div className="relative">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-4 border border-border pr-12">
                  {result.about}
                </p>
                <button
                  onClick={() => copyText(result.about, "about")}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedKey === "about" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <SectionShareBar text={result.about || ""} label="About section" />
            </ResultSection>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultSection({ icon, title, expanded, onToggle, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="font-semibold text-sm text-foreground">{title}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}