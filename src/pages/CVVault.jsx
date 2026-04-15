import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Plus, Download, Share2, Eye, Trash2, Languages, Crown,
  FileText, CheckCircle2, Sparkles, X, Clock, Copy, GitCompare,
  Tag, Building2, Briefcase, Stethoscope, Code, TrendingUp, PenLine,
  Camera, RefreshCw
} from "lucide-react";
import CVShareModal from "../components/shared/CVShareModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const USER_PLAN = "premium";
const canUse = USER_PLAN === "premium" || USER_PLAN === "business";

const INDUSTRY_TAGS = [
  { id: "tech",       label: "Technology",   icon: Code,         color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "finance",    label: "Finance",      icon: TrendingUp,   color: "bg-green-100 text-green-700 border-green-200" },
  { id: "healthcare", label: "Healthcare",   icon: Stethoscope,  color: "bg-red-100 text-red-700 border-red-200" },
  { id: "marketing",  label: "Marketing",    icon: PenLine,      color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "general",    label: "General",      icon: Briefcase,    color: "bg-gray-100 text-gray-700 border-gray-200" },
];

const SUPPORTED_LANGS = [
  { code: "fr", name: "French",     flag: "🇫🇷" },
  { code: "es", name: "Spanish",    flag: "🇪🇸" },
  { code: "de", name: "German",     flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "ar", name: "Arabic",     flag: "🇸🇦" },
  { code: "zh", name: "Chinese",    flag: "🇨🇳" },
  { code: "it", name: "Italian",    flag: "🇮🇹" },
  { code: "ru", name: "Russian",    flag: "🇷🇺" },
  { code: "nl", name: "Dutch",      flag: "🇳🇱" },
  { code: "ko", name: "Korean",     flag: "🇰🇷" },
];

const INITIAL_CVS = [
  { id: 1, title: "Senior Dev — Tech Focus", lang: "en", flag: "🇬🇧", industry: "tech",    date: "2026-03-30", content: `Alex Johnson — Senior Software Engineer\nEmail: alex@example.com | +1 (555) 234-5678\n\nSUMMARY\nPassionate software engineer with 6+ years building scalable web applications. Expert in React, Node.js, AWS.\n\nEXPERIENCE\nSenior Engineer — TechCorp Inc. (2022–Present)\n• Led team of 5 engineers, built microservices serving 2M users\n• Reduced infrastructure costs by 40% via AWS optimization\n\nSKILLS\nReact, Node.js, TypeScript, Python, PostgreSQL, AWS, Docker, Kubernetes` },
  { id: 2, title: "Finance Sector CV",        lang: "en", flag: "🇬🇧", industry: "finance", date: "2026-03-28", content: `Alex Johnson — Software Engineer — Financial Systems\nEmail: alex@example.com | +1 (555) 234-5678\n\nSUMMARY\nSoftware engineer with 6+ years experience building high-availability financial systems, trading platforms, and data pipelines.\n\nEXPERIENCE\nSenior Engineer — TechCorp Inc. (2022–Present)\n• Built real-time data pipelines processing $2B+ daily transactions\n• Ensured SOC2 and PCI-DSS compliance across systems\n\nSKILLS\nPython, SQL, AWS, Kafka, Data Engineering, Compliance, Fintech APIs` },
  { id: 3, title: "French — Tech",            lang: "fr", flag: "🇫🇷", industry: "tech",    date: "2026-03-25", content: `Alex Johnson — Ingénieur Logiciel Senior\nEmail: alex@example.com | +1 (555) 234-5678\n\nRÉSUMÉ PROFESSIONNEL\nIngénieur passionné avec 6+ ans d'expérience dans le développement d'applications web évolutives.\n\nEXPÉRIENCE\nIngénieur Senior — TechCorp Inc. (2022–Présent)\n• Direction d'une équipe de 5 ingénieurs\n\nCOMPÉTENCES\nReact, Node.js, TypeScript, Python, PostgreSQL, AWS` },
];

// ── Compare Modal ──────────────────────────────────────────────────────────────
function CompareModal({ cvs, onClose }) {
  const [leftId, setLeftId]   = useState(cvs[0]?.id);
  const [rightId, setRightId] = useState(cvs[1]?.id);
  const left  = cvs.find(c => c.id === leftId);
  const right = cvs.find(c => c.id === rightId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-accent" />
            <h2 className="font-bold text-foreground">Compare CV Versions</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-4 p-4 border-b border-border shrink-0">
          {[{ id: leftId, setId: setLeftId, label: "Left" }, { id: rightId, setId: setRightId, label: "Right" }].map(({ id, setId, label }) => (
            <div key={label}>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">{label} Version</label>
              <select value={id} onChange={e => setId(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-border bg-background text-sm px-3 focus:outline-none focus:ring-1 focus:ring-accent">
                {cvs.map(c => <option key={c.id} value={c.id}>{c.flag} {c.title}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Side by side */}
        <div className="grid grid-cols-2 gap-0 flex-1 overflow-hidden divide-x divide-border">
          {[left, right].map((cv, i) => (
            <div key={i} className="flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/40 shrink-0 border-b border-border">
                <p className="text-xs font-bold text-foreground truncate">{cv?.flag} {cv?.title}</p>
                <p className="text-[10px] text-muted-foreground">{cv?.date} · {INDUSTRY_TAGS.find(t => t.id === cv?.industry)?.label}</p>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <pre className="text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap">{cv?.content}</pre>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Add Version Modal ──────────────────────────────────────────────────────────
function AddVersionModal({ onClose, onAdd }) {
  const [title, setTitle]       = useState("");
  const [industry, setIndustry] = useState("tech");
  const [content, setContent]   = useState("");
  const [lang, setLang]         = useState("en");
  const [translating, setTranslating] = useState(false);

  const save = async () => {
    if (!title.trim() || !content.trim()) { toast.warning("Please fill in title and content."); return; }
    const flag = lang === "en" ? "🇬🇧" : (SUPPORTED_LANGS.find(l => l.code === lang)?.flag || "🌐");
    onAdd({ id: Date.now(), title, industry, content, lang, flag, date: new Date().toISOString().split("T")[0] });
    onClose();
  };

  const translateAndSave = async () => {
    if (!content.trim()) { toast.warning("Paste content to translate."); return; }
    if (lang === "en") { save(); return; }
    setTranslating(true);
    const langObj = SUPPORTED_LANGS.find(l => l.code === lang);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Translate this resume/CV into ${langObj.name}. Preserve all formatting and professional tone.\n\n${content}`,
    });
    setContent(result);
    setTranslating(false);
    toast.success("Translated! Review and save.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-foreground">Add CV Version</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Version Title</label>
            <Input placeholder="e.g. Senior Dev — Finance Sector" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Industry</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background text-sm px-3 focus:outline-none focus:ring-1 focus:ring-accent">
                {INDUSTRY_TAGS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Language</label>
              <select value={lang} onChange={e => setLang(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background text-sm px-3 focus:outline-none focus:ring-1 focus:ring-accent">
                <option value="en">🇬🇧 English</option>
                {SUPPORTED_LANGS.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">CV Content</label>
            <Textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Paste your CV/resume text here..." className="min-h-[160px] resize-none text-xs" />
          </div>
          <div className="flex gap-2">
            {lang !== "en" && (
              <Button variant="outline" onClick={translateAndSave} disabled={translating} className="flex-1 gap-2 rounded-xl h-10">
                {translating ? <><div className="w-3 h-3 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />Translating...</> : <><Sparkles className="w-3.5 h-3.5" />Translate & Save</>}
              </Button>
            )}
            <Button onClick={save} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-10 gap-2">
              <Plus className="w-3.5 h-3.5" /> Save Version
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CVVault() {
  const [cvs, setCvs]                 = useState(INITIAL_CVS);
  const [filterIndustry, setFilter]   = useState("all");
  const [previewCV, setPreviewCV]     = useState(null);
  const [comparing, setComparing]     = useState(false);
  const [addingNew, setAddingNew]     = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [photoMap, setPhotoMap]       = useState({}); // cvId -> dataURL

  const filtered = filterIndustry === "all" ? cvs : cvs.filter(c => c.industry === filterIndustry);

  const deleteCV = (id) => { setCvs(p => p.filter(c => c.id !== id)); toast.success("Deleted."); };

  const handlePhotoUpload = (cvId, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoMap(p => ({ ...p, [cvId]: e.target.result }));
      toast.success("Profile photo updated!");
    };
    reader.readAsDataURL(file);
  };

  if (!canUse) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-card ink-border rounded-2xl p-14 text-center">
          <Crown className="w-14 h-14 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-foreground mb-3">Premium Feature</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">CV Vault is available on Premium and Business plans.</p>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-10 font-bold">Upgrade to Premium</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <Globe className="w-6 h-6 text-accent" /> CV Vault
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Store and organize multiple CV versions by industry. Compare side-by-side.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {cvs.length >= 2 && (
              <Button variant="outline" onClick={() => setComparing(true)} className="rounded-full h-9 text-xs gap-1.5">
                <GitCompare className="w-3.5 h-3.5" /> Compare Versions
              </Button>
            )}
            <Link to="/dashboard/resume-translator">
              <Button variant="outline" className="rounded-full h-9 text-xs gap-1.5">
                <Languages className="w-3.5 h-3.5" /> Translate Resume
              </Button>
            </Link>
            <Button onClick={() => setAddingNew(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-9 text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Version
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Industry Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterIndustry === "all" ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border text-muted-foreground hover:border-accent/40"}`}>
          All ({cvs.length})
        </button>
        {INDUSTRY_TAGS.map(tag => {
          const count = cvs.filter(c => c.industry === tag.id).length;
          if (count === 0) return null;
          return (
            <button key={tag.id} onClick={() => setFilter(tag.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterIndustry === tag.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/30"}`}>
              {tag.label} ({count})
            </button>
          );
        })}
      </div>

      {/* CV Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map(cv => {
            const industryTag = INDUSTRY_TAGS.find(t => t.id === cv.industry);
            const Icon = industryTag?.icon || Briefcase;
            return (
              <motion.div key={cv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-card ink-border rounded-2xl p-5 hover:shadow-md transition-all flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Profile photo */}
                    <div className="relative shrink-0">
                      {photoMap[cv.id] ? (
                        <img src={photoMap[cv.id]} alt="profile" className="w-10 h-10 rounded-full object-cover border-2 border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border text-muted-foreground text-lg">
                          {cv.flag}
                        </div>
                      )}
                      <label title="Upload photo" className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center cursor-pointer hover:bg-accent/80 transition-colors">
                        <Camera className="w-2.5 h-2.5 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handlePhotoUpload(cv.id, e.target.files[0])} />
                      </label>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{cv.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{cv.date}</p>
                    </div>
                  </div>
                </div>

                {/* Industry badge */}
                <div className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full border text-[11px] font-semibold ${industryTag?.color}`}>
                  <Icon className="w-3 h-3" /> {industryTag?.label}
                </div>

                {/* Preview snippet */}
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed bg-muted/40 rounded-lg p-2.5 font-mono">
                  {cv.content.slice(0, 120)}...
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1 pt-1 border-t border-border">
                  <button onClick={() => setPreviewCV(cv)} title="Preview"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => setShareTarget(cv)} title="Share"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button onClick={() => toast.success("Downloading PDF...")} title="Download"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button onClick={() => deleteCV(cv.id)} title="Delete"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add new card */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => setAddingNew(true)}
          className="bg-card ink-border rounded-2xl p-5 border-2 border-dashed border-border hover:border-accent/50 hover:bg-accent/5 transition-all flex flex-col items-center justify-center gap-2 min-h-[200px] text-muted-foreground hover:text-accent">
          <Plus className="w-8 h-8" />
          <p className="text-sm font-semibold">Add CV Version</p>
          <p className="text-xs text-center">Store a tailored version for a specific industry</p>
        </motion.button>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewCV && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewCV(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-card ink-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl z-10"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{previewCV.flag}</span>
                  <p className="font-bold text-foreground">{previewCV.title}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => toast.success("Downloading...")}
                    className="rounded-full h-8 text-xs gap-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Download className="w-3 h-3" /> Download PDF
                  </Button>
                  <button onClick={() => setPreviewCV(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <pre className="text-sm font-mono text-foreground leading-relaxed whitespace-pre-wrap">{previewCV.content}</pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {comparing && <CompareModal cvs={cvs} onClose={() => setComparing(false)} />}
      </AnimatePresence>

      {/* Add Version Modal */}
      <AnimatePresence>
        {addingNew && (
          <AddVersionModal
            onClose={() => setAddingNew(false)}
            onAdd={(cv) => { setCvs(p => [...p, cv]); toast.success("CV version saved!"); }}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareTarget && (
          <CVShareModal open={!!shareTarget} onClose={() => setShareTarget(null)} cv={shareTarget} />
        )}
      </AnimatePresence>
    </div>
  );
}