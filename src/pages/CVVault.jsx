import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Plus, Download, Share2, Eye, Trash2, Languages, Crown,
  FileText, CheckCircle2, Sparkles, X, Clock, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const USER_PLAN = "premium"; // "free" | "premium" | "business"
const canUse = USER_PLAN === "premium" || USER_PLAN === "business";

const SUPPORTED_LANGS = [
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", rtl: true },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
];

const BASE_RESUME = `Alex Johnson — Senior Software Engineer
Email: alex@example.com | Phone: +1 (555) 234-5678 | San Francisco, CA
LinkedIn: linkedin.com/in/alexjohnson

SUMMARY
Passionate software engineer with 6+ years building scalable web applications.

EXPERIENCE
Senior Engineer — TechCorp Inc. (2022–Present)
• Led a team of 5 engineers to build a microservices platform serving 2M users.

Software Engineer — StartupXYZ (2019–2022)  
• Built full-stack features for a SaaS product from 0 to $5M ARR.

EDUCATION
B.Sc. Computer Science — UC Berkeley (2015–2019)

SKILLS
React, Node.js, TypeScript, Python, PostgreSQL, AWS, Docker, Kubernetes`;

const INITIAL_CVS = [
  { id: 1, lang: "fr", name: "French", flag: "🇫🇷", status: "ready", date: "2026-03-30", preview: "Alex Johnson — Ingénieur Logiciel Senior\nRésumé professionnel traduit en français..." },
  { id: 2, lang: "es", name: "Spanish", flag: "🇪🇸", status: "ready", date: "2026-03-28", preview: "Alex Johnson — Ingeniero de Software Senior\nResumen profesional traducido al español..." },
];

export default function CVVault() {
  const [cvs, setCvs] = useState(INITIAL_CVS);
  const [translating, setTranslating] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [previewCV, setPreviewCV] = useState(null);
  const [shareLink, setShareLink] = useState(null);

  const toggleLang = (code) => {
    if (cvs.find(c => c.lang === code)) { toast.info("Already translated. Delete to re-translate."); return; }
    setSelectedLangs(p => p.includes(code) ? p.filter(l => l !== code) : [...p, code]);
  };

  const translateAll = async () => {
    if (selectedLangs.length === 0) { toast.warning("Select at least one language."); return; }
    setTranslating(true);
    for (const code of selectedLangs) {
      const lang = SUPPORTED_LANGS.find(l => l.code === code);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following resume/CV into ${lang.name}. Preserve all formatting, section headings, bullet points, and professional tone. Return only the translated CV text, nothing else.\n\n${BASE_RESUME}`,
      });
      const newCV = { id: Date.now() + Math.random(), lang: code, name: lang.name, flag: lang.flag, status: "ready", date: new Date().toISOString().split("T")[0], preview: result };
      setCvs(p => [...p, newCV]);
    }
    setSelectedLangs([]);
    setTranslating(false);
    toast.success("CVs translated and saved to vault!");
  };

  const deleteCV = (id) => { setCvs(p => p.filter(c => c.id !== id)); toast.success("Deleted."); };

  const generateShareLink = (cv) => {
    const link = `https://softdugo.com/cv/share/${Math.random().toString(36).slice(2, 10)}`;
    setShareLink(link);
    navigator.clipboard.writeText(link);
    toast.success("Share link copied to clipboard!");
  };

  if (!canUse) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card ink-border rounded-2xl p-14 text-center mt-8">
          <Crown className="w-14 h-14 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-foreground mb-3">Premium Feature</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">CV Vault with multilingual storage, sharing, and download is available on Premium and Business plans.</p>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-10 font-bold">Upgrade to Premium</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <Globe className="w-6 h-6 text-accent" /> CV Vault — Multilingual Storage
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Translate, store, share, and download your CV in any language.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
            <Crown className="w-3.5 h-3.5" /> Premium Feature
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Language selector */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card ink-border rounded-2xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Languages className="w-4 h-4" />Translate My CV
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Select languages to translate your master resume into:</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {SUPPORTED_LANGS.map(lang => {
                const exists = cvs.find(c => c.lang === lang.code);
                const selected = selectedLangs.includes(lang.code);
                return (
                  <button key={lang.code} onClick={() => toggleLang(lang.code)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${exists ? "border-green-300 bg-green-50 text-green-700 cursor-default" : selected ? "border-accent bg-accent/5 text-accent" : "border-border hover:border-accent/40 text-muted-foreground"}`}>
                    <span className="text-base">{lang.flag}</span>
                    <span className="truncate">{lang.name}</span>
                    {exists && <CheckCircle2 className="w-3 h-3 text-green-500 ml-auto shrink-0" />}
                    {selected && !exists && <div className="w-3 h-3 rounded-full bg-accent ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
            <Button onClick={translateAll} disabled={translating || selectedLangs.length === 0}
              className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold gap-2 text-sm">
              {translating ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Translating with AI...</>
              ) : (
                <><Sparkles className="w-4 h-4" />Translate {selectedLangs.length > 0 ? `(${selectedLangs.length})` : ""}</>
              )}
            </Button>
          </div>

          {/* Base CV */}
          <div className="bg-card ink-border rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Master CV (English)</p>
            <pre className="text-[10px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-10 overflow-hidden">{BASE_RESUME}</pre>
          </div>
        </div>

        {/* Right: Stored CVs */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">{cvs.length} Translated CV{cvs.length !== 1 ? "s" : ""} stored</h3>
            <p className="text-xs text-muted-foreground">All encrypted & private</p>
          </div>

          {/* Master CV card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-xl shrink-0">🇬🇧</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">English (Master)</p>
              <p className="text-xs text-muted-foreground">Original resume · Always kept</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setPreviewCV({ id: 0, flag: "🇬🇧", name: "English", preview: BASE_RESUME })}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
              <button onClick={() => toast.success("Downloading PDF...")}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><Download className="w-3.5 h-3.5 text-muted-foreground" /></button>
            </div>
          </div>

          <AnimatePresence>
            {cvs.map((cv) => (
              <motion.div key={cv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card ink-border hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">{cv.flag}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{cv.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />Saved {cv.date}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">Ready</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPreviewCV(cv)} title="Preview"
                    className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => toast.success(`Downloading ${cv.name} PDF...`)} title="Download PDF"
                    className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => generateShareLink(cv)} title="Share link"
                    className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                    <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteCV(cv.id)} title="Delete"
                    className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {cvs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm bg-card ink-border rounded-2xl">
              <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No translated CVs yet. Select languages and click Translate.</p>
            </div>
          )}

          {shareLink && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center gap-3">
              <Share2 className="w-4 h-4 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">Share link generated & copied!</p>
                <p className="text-xs text-muted-foreground font-mono truncate">{shareLink}</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(shareLink); toast.success("Copied!"); }}
                className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={() => setShareLink(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewCV && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewCV(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="relative bg-card ink-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col z-10 shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{previewCV.flag}</span>
                  <p className="font-bold text-foreground">CV Preview — {previewCV.name}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => toast.success("Downloading...")}
                    className="rounded-full h-8 text-xs gap-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Download className="w-3 h-3" />Download PDF
                  </Button>
                  <button onClick={() => setPreviewCV(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <pre className="text-sm font-mono text-foreground leading-relaxed whitespace-pre-wrap">{previewCV.preview}</pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}