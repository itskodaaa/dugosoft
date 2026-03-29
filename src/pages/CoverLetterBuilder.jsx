import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Copy, Download, CheckCircle2, Sparkles, Linkedin } from "lucide-react";
import LinkedInShareModal from "../components/linkedin/LinkedInShareModal";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";

const TONES = ["Professional", "Enthusiastic", "Formal", "Creative"];

const PLACEHOLDER = `Dear Hiring Manager,

I am writing to express my strong interest in the [Job Title] position at [Company]. With [X] years of experience in [field], I have developed a robust skill set that aligns perfectly with your requirements.

Throughout my career, I have consistently demonstrated [key qualification], which has enabled me to [achievement]. My experience with [skill] positions me well to contribute meaningfully to your team from day one.

I am particularly drawn to [Company] because of your commitment to innovation and excellence. I am confident that my background in [area] and my passion for [field] would make me a valuable addition to your organization.

I would welcome the opportunity to discuss how my experience can benefit [Company]. Thank you for considering my application.

Sincerely,
[Your Name]`;

export default function CoverLetterBuilder() {
  const { t } = useLang();
  const [form, setForm] = useState({ jobTitle: "", company: "", name: "", qualifications: "", experience: "", tone: "Professional" });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleGenerate = async () => {
    if (!form.jobTitle || !form.company) {
      toast.error("Please fill in the job title and company name.");
      return;
    }
    setGenerating(true);
    setResult(null);
    const prompt = `Write a ${form.tone.toLowerCase()} professional cover letter for:
- Job Title: ${form.jobTitle}
- Company: ${form.company}
- Applicant Name: ${form.name || "the applicant"}
- Years of Experience: ${form.experience || "several years"}
- Key Qualifications: ${form.qualifications || "relevant skills and experience"}

Write a complete, ready-to-send cover letter with proper greeting, 3 paragraphs (introduction, experience, closing), and sign-off. Make it specific, compelling, and tailored to the role.`;

    const text = await base44.integrations.Core.InvokeLLM({ prompt });
    setResult(text);
    setGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format) => {
    if (format === "txt") {
      const blob = new Blob([result], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover-letter-${form.company || "download"}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      toast.info(`${format.toUpperCase()} download coming soon.`);
    }
  };

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative rounded-2xl overflow-hidden h-32 mb-8"
          style={{ background: "linear-gradient(135deg, #4f8ef7 0%, #6366f1 50%, #8b5cf6 100%)" }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-20 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          <div className="relative z-10 p-7 h-full flex flex-col justify-center">
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-0.5">{t("cl_title")}</h1>
            <p className="text-white/80 text-sm">{t("cl_subtitle")}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form — left */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4">
          <div className="bg-card ink-border rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Job Details</h3>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">{t("cl_job_title")} *</Label>
              <Input placeholder="e.g. Senior Software Engineer" value={form.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)} className="h-9 text-sm bg-background" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">{t("cl_company")} *</Label>
              <Input placeholder="e.g. Stripe" value={form.company}
                onChange={(e) => update("company", e.target.value)} className="h-9 text-sm bg-background" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">{t("cl_your_name")}</Label>
              <Input placeholder="e.g. John Doe" value={form.name}
                onChange={(e) => update("name", e.target.value)} className="h-9 text-sm bg-background" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">{t("cl_experience")}</Label>
              <Input placeholder="e.g. 5" value={form.experience}
                onChange={(e) => update("experience", e.target.value)} className="h-9 text-sm bg-background" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">{t("cl_qualifications")}</Label>
              <Textarea placeholder="e.g. React, TypeScript, team leadership, CI/CD..."
                value={form.qualifications} onChange={(e) => update("qualifications", e.target.value)}
                className="min-h-[80px] text-sm resize-none bg-background" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">{t("cl_tone")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((tone) => (
                  <button key={tone} onClick={() => update("tone", tone)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      form.tone === tone
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:border-accent/40"
                    }`}>
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={generating}
            className="w-full h-12 rounded-xl font-bold text-sm gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                {t("cl_generating")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t("cl_generate")}
              </>
            )}
          </Button>
        </motion.div>

        {/* Preview — right */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 rounded-full bg-accent" />
              <h2 className="text-base font-bold text-foreground">{t("cl_preview")}</h2>
            </div>
            {result && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}
                  className="rounded-full h-8 text-xs gap-1.5">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {t("cl_copy")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload("txt")}
                  className="rounded-full h-8 text-xs gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  {t("cl_download_pdf")}
                </Button>
                <Button size="sm" className="rounded-full h-8 text-xs gap-1.5 text-white"
                  style={{ background: "#0A66C2" }}
                  onClick={() => setShowLinkedIn(true)}>
                  <Linkedin className="w-3.5 h-3.5" />
                  {t("li_share_cover")}
                </Button>
              </div>
            )}
          </div>

          <div className="bg-card ink-border rounded-2xl p-6 min-h-[520px] flex flex-col">
            {generating ? (
              <div className="flex-1 flex items-center justify-center flex-col gap-3">
                <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">{t("cl_generating")}</p>
              </div>
            ) : result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex flex-col">
                {/* Letter header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{form.jobTitle} @ {form.company}</p>
                      <p className="text-xs text-muted-foreground">{form.name || "Applicant"}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-semibold">{form.tone}</span>
                </div>
                <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-inter flex-1">
                  {result}
                </pre>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col gap-3">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Fill in the job details and click "{t("cl_generate")}" to create your cover letter.
                </p>
                <pre className="text-xs text-muted-foreground/50 leading-relaxed whitespace-pre-wrap mt-4 max-w-sm text-center font-inter line-clamp-6 opacity-50">
                  {PLACEHOLDER}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <LinkedInShareModal
        isOpen={showLinkedIn}
        onClose={() => setShowLinkedIn(false)}
        content={result}
        type="cover"
        metadata={{ jobTitle: form.jobTitle, company: form.company }}
      />
    </div>
  );
}