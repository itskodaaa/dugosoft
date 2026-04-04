import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertTriangle, CheckCircle2, Lightbulb, Share2 } from "lucide-react";
import ProcessingBorder from "../components/shared/ProcessingBorder";
import ShareModal from "../components/shared/ShareModal";
import JobUrlParser from "../components/shared/JobUrlParser";
import { useLang } from "@/lib/i18n";

const PLACEHOLDER_RESULT = {
  score: 72,
  missingKeywords: ["TypeScript", "Agile", "CI/CD", "Kubernetes", "Team Leadership"],
  suggestions: [
    "Add specific metrics and quantifiable achievements to your experience section.",
    "Include keywords like 'Agile' and 'CI/CD' that appear in the job description.",
    "Your skills section should mirror the technical requirements listed in the posting.",
    "Consider adding a 'Projects' section to showcase relevant work.",
  ],
};

export default function ATSChecker() {
  const { t } = useLang();
  const [resumeText, setResumeText]     = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [processing, setProcessing]     = useState(false);
  const [result, setResult]             = useState(null);
  const [showShare, setShowShare]       = useState(false);

  const handleAnalyze = () => {
    setProcessing(true);
    setResult(null);
    setTimeout(() => {
      setResult(PLACEHOLDER_RESULT);
      setProcessing(false);
    }, 2500);
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
          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
            {t("ats_your_resume")}
          </Label>
          <Textarea
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="min-h-[200px] bg-card ink-border resize-none"
          />
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
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl bg-destructive/5 ink-border">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <h3 className="text-sm font-semibold text-foreground">{t("ats_missing")}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map((kw) => (
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
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Scanning your resume...
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