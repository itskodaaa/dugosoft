import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, ChevronDown, ChevronUp, Eye,
  RefreshCw, PenLine, Inbox, File, Globe, Cpu, ScanText, Merge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { API_BASE } from "@/api/config";

const CATEGORY_ICONS = {
  Resume:     { icon: FileText,  color: "text-accent",       bg: "bg-accent/10" },
  Translation:{ icon: Globe,     color: "text-green-500",    bg: "bg-green-500/10" },
  Conversion: { icon: File,      color: "text-blue-500",     bg: "bg-blue-500/10" },
  OCR:        { icon: ScanText,  color: "text-purple-500",   bg: "bg-purple-500/10" },
  Merge:      { icon: Merge,     color: "text-orange-500",   bg: "bg-orange-500/10" },
  Sharing:    { icon: PenLine,   color: "text-pink-500",     bg: "bg-pink-500/10" },
  AI:         { icon: Cpu,       color: "text-indigo-500",   bg: "bg-indigo-500/10" },
};

function formatBytes(b) {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function DocRow({ doc }) {
  const [open, setOpen] = useState(false);
  const cfg = CATEGORY_ICONS[doc.category] || CATEGORY_ICONS.Conversion;
  const Icon = cfg.icon;
  const date = new Date(doc.createdAt).toLocaleDateString();

  return (
    <div className="bg-card ink-border rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left">
        <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{doc.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {doc.category} · {doc.type} {doc.size ? `· ${formatBytes(doc.size)}` : ""}
          </p>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
          doc.status === "ready" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
        }`}>{doc.status}</span>
        <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{date}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border px-5 py-4 space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Link to="/dashboard/my-documents">
                <Button size="sm" variant="outline" className="rounded-full h-8 text-xs gap-1">
                  <Eye className="w-3 h-3" /> View in My Documents
                </Button>
              </Link>
              {doc.shareToken && (
                <a href={`/download/${doc.shareToken}`} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline" className="rounded-full h-8 text-xs gap-1">
                    <File className="w-3 h-3" /> Download
                  </Button>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResumeRow({ resume }) {
  const [open, setOpen] = useState(false);
  const date = new Date(resume.updatedAt || resume.createdAt).toLocaleDateString();

  return (
    <div className="bg-card ink-border rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{resume.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Template: {resume.templateId || "—"} {resume.targetRegion ? `· ${resume.targetRegion}` : ""}
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 bg-green-100 text-green-700">saved</span>
        <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{date}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border px-5 py-4">
            <div className="flex gap-2">
              <Link to="/dashboard/resume-builder-v2">
                <Button size="sm" variant="outline" className="rounded-full h-8 text-xs gap-1">
                  <Eye className="w-3 h-3" /> Open Editor
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CATEGORY_ORDER = ["Resume", "Translation", "Conversion", "OCR", "Merge", "Sharing"];

export default function History() {
  const { user } = useAuth();
  const [resumes,   setResumes]   = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const authHeader = () => {
    const t = localStorage.getItem("auth_token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    Promise.all([
      fetch(`${API_BASE}/api/resumes`, { headers: authHeader() }).then(r => r.ok ? r.json() : { resumes: [] }),
      fetch(`${API_BASE}/api/documents`, { headers: authHeader() }).then(r => r.ok ? r.json() : { documents: [] }),
    ]).then(([rd, dd]) => {
      setResumes(rd.resumes || []);
      setDocuments(dd.documents || []);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  // Group documents by category
  const byCategory = {};
  for (const doc of documents) {
    if (!byCategory[doc.category]) byCategory[doc.category] = [];
    byCategory[doc.category].push(doc);
  }

  const isEmpty = !loading && resumes.length === 0 && documents.length === 0;

  const TABS = ["all", "resumes", ...CATEGORY_ORDER.filter(c => byCategory[c]?.length)];

  return (
    <div className="max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">History</h1>
        <p className="text-muted-foreground text-sm">Your saved resumes and all processed documents.</p>
      </motion.div>

      {/* Tabs */}
      {!loading && !isEmpty && (
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${activeTab === tab ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border text-muted-foreground hover:border-accent/40"}`}>
              {tab === "all" ? `All (${resumes.length + documents.length})` : tab === "resumes" ? `Resumes (${resumes.length})` : `${tab} (${byCategory[tab]?.length || 0})`}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Inbox className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">No history yet</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Build a resume or process files using the tools — they'll appear here automatically.
          </p>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            <Link to="/dashboard/resume-builder-v2">
              <Button size="sm" variant="outline" className="rounded-full text-xs">Build Resume</Button>
            </Link>
            <Link to="/dashboard/file-converter">
              <Button size="sm" variant="outline" className="rounded-full text-xs">Convert File</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Resumes section */}
      {!loading && resumes.length > 0 && (activeTab === "all" || activeTab === "resumes") && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Resumes ({resumes.length})</h2>
          {resumes.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <ResumeRow resume={r} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Processed documents by category */}
      {!loading && (activeTab === "all"
        ? CATEGORY_ORDER.filter(c => byCategory[c]?.length)
        : activeTab !== "resumes" ? [activeTab] : []
      ).map(cat => (
        <div key={cat} className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{cat} ({byCategory[cat].length})</h2>
          {byCategory[cat].map((doc, i) => (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <DocRow doc={doc} />
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}