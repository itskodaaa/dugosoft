import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertTriangle, CheckCircle2, Lightbulb, Share2, Upload, FileText, X } from "lucide-react";
import ProcessingBorder from "../components/shared/ProcessingBorder";
import ShareModal from "../components/shared/ShareModal";
import JobUrlParser from "../components/shared/JobUrlParser";
import AINotConfigured from "../components/shared/AINotConfigured";
import { useLang } from "@/lib/i18n";
import { useAI } from "@/lib/useAI";

export default function ATSChecker() {
  const { t } = useLang();
  const { call, loading: processing } = useAI();
  const [resumeText, setResumeText]     = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult]             = useState(null);
  const [showShare, setShowShare]       = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeInputMode, setResumeInputMode] = useState("paste");
  const resumeFileRef = useRef(null);

  const handleResumeFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setResumeText(ev.target.result);
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      return;
    }
    setResult(null);
    setNotConfigured(false);
    const data = await call("scoreResumeATS", { resumeText, jobDescription });
    if (data === null) {
      // Check if it was a config error vs limit error (both handled by useAI)
      return;
    }
    if (data?.score !== undefined) {
      setResult(data);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-500";
    return "text-destructive";
  };

  const getProgressColor = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {t("ats_title")}
          </h1>
          {result && (
            <Button variant="outline" size="sm" onClick={() => setShowShare(true)} className="rounded-full h-8 text-xs gap-1.5">
              <Share2 className="w-3.5 h-3.5" /> Share Results
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mb-6">{t("ats_subtitle")}</p>
      </motion.div>

      {/* Job URL Parser */}
      <div className="mb-6">
        <JobUrlParser onParsed={({ description }) => setJobDescription(description)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("ats_your_resume")}</Label>
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              {["paste","upload"].map(m => (
                <button key={m} onClick={() => { setResumeInputMode(m); setResumeFile(null); }}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${resumeInputMode === m ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
                  {m === "paste" ? "Paste" : "Upload"}
                </button>
              ))}
            </div>
          </div>
          {resumeInputMode === "paste" ? (
            <Textarea
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="min-h-[200px] bg-card ink-border resize-none"
            />
          ) : (
            <div>
              <input ref={resumeFileRef} type="file" accept=".txt,.pdf,.doc,.docx,.md" className="hidden" onChange={handleResumeFile} />
              {resumeFile ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card ink-border min-h-[80px]">
                  <FileText className="w-8 h-8 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{resumeFile.name}</p>
                    <p className="text-xs text-green-600 font-medium mt-0.5">✓ File loaded</p>
                  </div>
                  <button onClick={() => { setResumeFile(null); setResumeText(""); }}
                    className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <div onClick={() => resumeFileRef.current?.click()}
                  className="min-h-[200px] rounded-xl border-2 border-dashed border-border hover:border-accent/50 bg-card cursor-pointer flex flex-col items-center justify-center gap-3 transition-all hover:bg-muted/20">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Upload Resume</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, MD</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
            {t("ats_job_desc")}
          </Label>
          <Textarea
            placeholder="Paste the job description here, or use the URL parser above..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[200px] bg-card ink-border resize-none"
          />
        </div>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={processing}
        className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-12 px-10 font-semibold gap-2 mb-8"
      >
        {processing ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
            {t("ats_analyzing")}
          </>
        ) : (
          <>
            <BarChart3 className="w-4 h-4" />
            {t("ats_analyze")}
          </>
        )}
      </Button>

      {/* Results */}
      {(result || processing) && (
        <ProcessingBorder processing={processing}>
          <div className="p-6">
            {result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="text-center">
                  <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    {t("ats_score")}
                  </p>
                  <div className={`text-6xl font-extrabold ${getScoreColor(result.score)} mb-3`}>
                    {result.score}
                  </div>
                  <div className="max-w-xs mx-auto">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${getProgressColor(result.score)}`}
                      />
                    </div>
                  </div>
                  {result.assessment && (
                    <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{result.assessment}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl bg-destructive/5 ink-border">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <h3 className="text-sm font-semibold text-foreground">{t("ats_missing")}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords?.map((kw) => (
                        <Badge key={kw} variant="outline" className="border-destructive/30 text-destructive text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-accent/5 ink-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-accent" />
                      <h3 className="text-sm font-semibold text-foreground">{t("ats_suggestions")}</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.suggestions?.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {result.foundKeywords?.length > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-semibold text-emerald-800">Matching Keywords ({result.foundKeywords.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.foundKeywords.map((kw) => (
                        <Badge key={kw} className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Analyzing your resume with AI...
              </div>
            )}
          </div>
        </ProcessingBorder>
      )}

      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        title="Share ATS Results"
        shareText={result ? `My resume scored ${result.score}/100 on the ATS Checker! Check yours at Softdugo.` : ""}
        emailSubject="My ATS Resume Score"
      />
    </div>
  );
}