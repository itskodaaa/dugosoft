import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Languages, Sparkles, Save, Copy, Check, ArrowRight,
  FileText, Loader2, Globe, Download, GitCompare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import DiffView from "@/components/resume-translator/DiffView";
import AIGradePanel from "@/components/resume-translator/AIGradePanel";

const LANGUAGES = [
  { code: "en", name: "English",    flag: "🇬🇧", tone: "Clear, ATS-optimised, action-verb driven" },
  { code: "fr", name: "French",     flag: "🇫🇷", tone: "Formal, concise, structured (French CV norms)" },
  { code: "de", name: "German",     flag: "🇩🇪", tone: "Precise, structured, formal (Lebenslauf style)" },
  { code: "es", name: "Spanish",    flag: "🇪🇸", tone: "Professional, warm, achievement-focused" },
  { code: "it", name: "Italian",    flag: "🇮🇹", tone: "Professional, formal (Curriculum Vitae format)" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷", tone: "Formal, Brazilian business style" },
  { code: "nl", name: "Dutch",      flag: "🇳🇱", tone: "Direct, factual, results-oriented" },
  { code: "ru", name: "Russian",    flag: "🇷🇺", tone: "Formal, detailed, academic-style" },
  { code: "zh", name: "Chinese",    flag: "🇨🇳", tone: "Structured, concise, quantified achievements" },
  { code: "ar", name: "Arabic",     flag: "🇸🇦", tone: "Formal, respectful, structured" },
  { code: "ko", name: "Korean",     flag: "🇰🇷", tone: "Formal, detailed, hierarchical" },
  { code: "ja", name: "Japanese",   flag: "🇯🇵", tone: "Formal, detailed, Rirekisho-inspired" },
];

const INITIAL_CVS = [
  { id: "1", title: "Senior Dev — Tech Focus", content: `Alex Johnson — Senior Software Engineer\nEmail: alex@example.com | +1 (555) 234-5678\n\nSUMMARY\nPassionate software engineer with 6+ years building scalable web applications. Expert in React, Node.js, AWS.\n\nEXPERIENCE\nSenior Engineer — TechCorp Inc. (2022–Present)\n• Led team of 5 engineers, built microservices serving 2M users\n• Reduced infrastructure costs by 40% via AWS optimization\n\nSKILLS\nReact, Node.js, TypeScript, Python, PostgreSQL, AWS, Docker, Kubernetes` },
  { id: "2", title: "Finance Sector CV",        content: `Alex Johnson — Software Engineer — Financial Systems\nEmail: alex@example.com | +1 (555) 234-5678\n\nSUMMARY\nSoftware engineer with 6+ years experience building high-availability financial systems, trading platforms, and data pipelines.\n\nEXPERIENCE\nSenior Engineer — TechCorp Inc. (2022–Present)\n• Built real-time data pipelines processing $2B+ daily transactions\n• Ensured SOC2 and PCI-DSS compliance across systems\n\nSKILLS\nPython, SQL, AWS, Kafka, Data Engineering, Compliance, Fintech APIs` },
];

export default function ResumeTranslator() {
  const navigate = useNavigate();
  const [source, setSource] = useState("vault"); // "vault" | "paste" | "upload"
  const [selectedCVId, setSelectedCVId] = useState(INITIAL_CVS[0].id);
  const [pasteContent, setPasteContent] = useState("");
  const [uploadedContent, setUploadedContent] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  const [targetLang, setTargetLang] = useState(LANGUAGES[1]); // French default
  const [jobTarget, setJobTarget] = useState("");
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const sourceContent = source === "vault"
    ? INITIAL_CVS.find(c => c.id === selectedCVId)?.content || ""
    : source === "upload"
    ? uploadedContent
    : pasteContent;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadedContent("");
    setUploadedFileName(file.name);
    const text = await file.text();
    setUploadedContent(text);
    setUploading(false);
    toast.success(`Loaded: ${file.name}`);
  };

  const handleTranslate = async () => {
    if (!sourceContent.trim()) { toast.error("Please provide resume content."); return; }
    setTranslating(true);
    setTranslated("");
    setSaved(false);
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch('http://localhost:3001/api/ai/invoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          action: "translateResume", 
          sourceContent, 
          targetLang, 
          jobTarget 
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTranslated(data.result);
        toast.success(`Resume translated to ${targetLang.name}!`);
      } else {
        toast.error(data.message || "Translation failed");
      }
    } catch (e) {
      toast.error("Failed to connect to AI service");
    } finally {
      setTranslating(false);
    }
  };

  const handleSaveToVault = async () => {
    if (!translated) return;
    setSaving(true);
    const sourceCVTitle = source === "vault"
      ? INITIAL_CVS.find(c => c.id === selectedCVId)?.title
      : "Pasted Resume";

    // Save metadata to entity + upload content as file
    const blob = new Blob([translated], { type: "text/plain" });
    const file = new File([blob], `resume_${targetLang.code}_${Date.now()}.txt`, { type: "text/plain" });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    await base44.entities.CVVaultEntry.create({
      title: `${sourceCVTitle} — ${targetLang.flag} ${targetLang.name}`,
      language: targetLang.name,
      language_code: targetLang.code,
      flag: targetLang.flag,
      original_title: sourceCVTitle,
      job_target: jobTarget || null,
      file_url,
      content: translated,
      version_type: "translation",
    });

    setSaving(false);
    setSaved(true);
    toast.success("Saved to CV Vault!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  const handleExportPDF = () => {
    if (!translated) return;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 15;
    const pageW = doc.internal.pageSize.getWidth();
    const maxW = pageW - margin * 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const lines = doc.splitTextToSize(translated, maxW);
    let y = margin;
    lines.forEach((line) => {
      if (y > 280) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 5.5;
    });

    doc.save(`resume_${targetLang.code}_${Date.now()}.pdf`);
    toast.success("PDF downloaded!");
  };

  return (
    <div className="max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1 flex items-center gap-2">
          <Languages className="w-6 h-6 text-accent" /> Resume Translator
        </h1>
        <p className="text-muted-foreground text-sm">
          AI-powered resume translation that adapts tone, formatting, and conventions for each country's job market.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT — Input */}
        <div className="space-y-4">
          <div className="bg-card ink-border rounded-2xl p-5 space-y-4">
            <p className="text-sm font-bold text-foreground">1. Source Resume</p>

            {/* Source toggle */}
            <div className="flex rounded-xl bg-muted p-1 gap-1">
              {[{ id: "vault", label: "CV Vault" }, { id: "paste", label: "Paste Text" }, { id: "upload", label: "Upload File" }].map(opt => (
                <button key={opt.id} onClick={() => setSource(opt.id)}
                  className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-all ${source === opt.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {opt.label}
                </button>
              ))}
            </div>

            {source === "vault" ? (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Select CV from Vault</label>
                <select value={selectedCVId} onChange={e => setSelectedCVId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  {INITIAL_CVS.map(cv => (
                    <option key={cv.id} value={cv.id}>{cv.title}</option>
                  ))}
                </select>
                {sourceContent && (
                  <div className="mt-3 bg-muted/40 rounded-xl p-3 max-h-40 overflow-auto">
                    <pre className="text-[11px] text-muted-foreground font-mono whitespace-pre-wrap">{sourceContent.slice(0, 400)}...</pre>
                  </div>
                )}
              </div>
            ) : source === "paste" ? (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Paste Resume Content</label>
                <textarea value={pasteContent} onChange={e => setPasteContent(e.target.value)}
                  rows={8} placeholder="Paste your resume text here..."
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring font-mono" />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Upload Resume File</label>
                <input ref={fileInputRef} type="file" accept=".txt,.md,.doc,.docx,.pdf" className="hidden" onChange={handleFileUpload} />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed border-input bg-background p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent/50 hover:bg-muted/30 transition-all">
                  {uploading ? (
                    <><Loader2 className="w-6 h-6 animate-spin text-accent mb-2" /><p className="text-sm text-muted-foreground">Reading file...</p></>
                  ) : uploadedFileName ? (
                    <><FileText className="w-6 h-6 text-accent mb-2" /><p className="text-sm font-semibold text-foreground">{uploadedFileName}</p><p className="text-xs text-muted-foreground mt-1">Click to replace</p></>
                  ) : (
                    <><FileText className="w-6 h-6 text-muted-foreground mb-2" /><p className="text-sm font-semibold text-foreground">Click to upload</p><p className="text-xs text-muted-foreground mt-1">.txt, .md, .doc, .docx, .pdf</p></>
                  )}
                </div>
                {uploadedContent && (
                  <div className="mt-3 bg-muted/40 rounded-xl p-3 max-h-40 overflow-auto">
                    <pre className="text-[11px] text-muted-foreground font-mono whitespace-pre-wrap">{uploadedContent.slice(0, 400)}...</pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-card ink-border rounded-2xl p-5 space-y-4">
            <p className="text-sm font-bold text-foreground">2. Translation Settings</p>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Target Language</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => setTargetLang(lang)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${targetLang.code === lang.code ? "bg-accent text-accent-foreground border-accent" : "bg-background border-border text-muted-foreground hover:border-accent/40"}`}>
                    <span>{lang.flag}</span> {lang.name}
                  </button>
                ))}
              </div>
              {targetLang && (
                <p className="text-[11px] text-muted-foreground mt-2 italic">Tone: {targetLang.tone}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Target Job Role <span className="font-normal">(optional)</span></label>
              <input value={jobTarget} onChange={e => setJobTarget(e.target.value)}
                placeholder="e.g. Senior Software Engineer, Product Manager..."
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>

            <Button onClick={handleTranslate} disabled={translating || !sourceContent.trim()}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-11 gap-2 font-bold">
              {translating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Translating with AI...</>
                : <><Sparkles className="w-4 h-4" /> Translate Resume</>}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">Powered by Claude AI · Endpoint: <code className="bg-muted px-1 rounded font-mono">/api/translate-resume</code></p>
          </div>
        </div>

        {/* RIGHT — Output */}
        <div className="space-y-4">
          <div className="bg-card ink-border rounded-2xl p-5 space-y-3 min-h-[360px] flex flex-col">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" /> Translation Output
                {translated && <span className="text-xs font-normal text-muted-foreground">— {targetLang.flag} {targetLang.name}</span>}
              </p>

            </div>

            {translating && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Languages className="w-7 h-7 text-accent animate-pulse" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">Translating to {targetLang.flag} {targetLang.name}...</p>
                <p className="text-xs text-muted-foreground">Adapting tone for {targetLang.name} job market norms</p>
              </div>
            )}

            {!translating && !translated && (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <Languages className="w-10 h-10 opacity-20" />
                <p className="text-sm">Your translated resume will appear here.</p>
              </div>
            )}

            {!translating && translated && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-3">
                <div className="bg-muted/30 rounded-xl p-4 max-h-[320px] overflow-auto border border-border">
                  <pre className="text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap">{translated}</pre>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={handleCopy}
                    className="rounded-full h-8 text-xs gap-1.5 flex-1">
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportPDF}
                    className="rounded-full h-8 text-xs gap-1.5 flex-1">
                    <Download className="w-3 h-3" /> Export PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowDiff(true)}
                    className="rounded-full h-8 text-xs gap-1.5 flex-1">
                    <GitCompare className="w-3 h-3" /> Diff View
                  </Button>
                </div>

                {/* Save to Vault */}
                <div className="space-y-2">
                  {saved ? (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      <p className="text-sm font-semibold text-green-700">Saved to CV Vault!</p>
                      <button onClick={() => navigate("/dashboard/cv-vault")}
                        className="ml-auto text-xs font-bold text-green-700 hover:underline flex items-center gap-1">
                        View Vault <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <Button onClick={handleSaveToVault} disabled={saving}
                      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 gap-2 font-semibold">
                      {saving
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        : <><Save className="w-4 h-4" /> Save to CV Vault</>}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* AI Grade Panel — show after translation */}
          {translated && (
            <AIGradePanel
              resumeText={translated}
              targetLang={targetLang}
              jobTarget={jobTarget}
            />
          )}
        </div>
      </div>

      {/* Diff View Modal */}
      <AnimatePresence>
        {showDiff && (
          <DiffView
            original={sourceContent}
            translated={translated}
            targetLang={targetLang}
            onClose={() => setShowDiff(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}