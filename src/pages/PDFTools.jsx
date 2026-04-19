import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileDown, PenLine, RotateCw, Scissors, Hash, Lock, Unlock,
  Upload, CheckCircle2, ChevronDown, Download, Loader2, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { processPdf } from "@/api/pdfTools";

// ── Tool definitions ──────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: "compress",
    icon: FileDown,
    label: "Compress PDF",
    desc: "Reduce PDF file size while preserving quality.",
    color: "from-orange-500 to-amber-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800/40",
    endpoint: "/compress",
    options: [
      {
        label: "Compression Level",
        type: "select",
        key: "level",
        choices: ["Low (best quality)", "Medium (balanced)", "High (smallest size)"],
      },
    ],
    outputName: "compressed.pdf",
  },
  {
    id: "rotate",
    icon: RotateCw,
    label: "Rotate PDF",
    desc: "Rotate all or specific pages of a PDF document.",
    color: "from-blue-500 to-cyan-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800/40",
    endpoint: "/rotate",
    options: [
      {
        label: "Rotation",
        type: "select",
        key: "degrees",
        choices: ["90° Clockwise", "180°", "90° Counter-clockwise"],
      },
      { label: "Pages", type: "text", key: "pages", placeholder: "e.g. all, 1-3, 2,4" },
    ],
    outputName: "rotated.pdf",
  },
  {
    id: "extract",
    icon: Scissors,
    label: "Extract Pages",
    desc: "Extract specific pages from a PDF as a new file.",
    color: "from-purple-500 to-violet-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800/40",
    endpoint: "/extract-pages",
    options: [
      { label: "Pages to extract", type: "text", key: "pages", placeholder: "e.g. 1-3, 5, 7-10" },
    ],
    outputName: "extracted.pdf",
  },
  {
    id: "pagenumbers",
    icon: Hash,
    label: "Add Page Numbers",
    desc: "Automatically add page numbers to your PDF.",
    color: "from-green-500 to-emerald-400",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800/40",
    endpoint: "/add-page-numbers",
    options: [
      {
        label: "Position",
        type: "select",
        key: "position",
        choices: ["Bottom Center", "Bottom Right", "Top Center", "Top Right"],
      },
      { label: "Start from page", type: "text", key: "startPage", placeholder: "1" },
    ],
    outputName: "numbered.pdf",
  },
  {
    id: "protect",
    icon: Lock,
    label: "Protect PDF",
    desc: "Add password protection to your PDF.",
    color: "from-red-500 to-rose-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800/40",
    endpoint: "/protect",
    options: [
      { label: "Password", type: "password", key: "password", placeholder: "Enter password" },
      { label: "Confirm Password", type: "password", key: "confirmPassword", placeholder: "Confirm password" },
    ],
    outputName: "protected.pdf",
  },
  {
    id: "unlock",
    icon: Unlock,
    label: "Unlock PDF",
    desc: "Remove password protection from a PDF.",
    color: "from-yellow-500 to-amber-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-800/40",
    endpoint: "/unlock",
    options: [
      { label: "Current Password (if known)", type: "password", key: "password", placeholder: "Enter current password" },
    ],
    outputName: "unlocked.pdf",
  },
  {
    id: "edit",
    icon: PenLine,
    label: "Edit PDF",
    desc: "Add text, annotations, and highlights to PDFs.",
    color: "from-indigo-500 to-blue-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-800/40",
    endpoint: "/edit-pdf",
    options: [
      {
        label: "Edit Mode",
        type: "select",
        key: "mode",
        choices: ["Add Text", "Highlight", "Annotate", "Redact"],
      },
      { label: "Text to add (for text/annotate)", type: "text", key: "text", placeholder: "Your text here..." },
      { label: "Target page", type: "text", key: "page", placeholder: "1" },
    ],
    outputName: "edited.pdf",
  },
];

// ── ToolCard ──────────────────────────────────────────────────────────────────
function ToolCard({ tool }) {
  const [expanded, setExpanded] = useState(false);
  const [file, setFile] = useState(null);
  const [opts, setOpts] = useState({});
  const [loading, setLoading] = useState(false);
  const [resultBlob, setResultBlob] = useState(null);
  const Icon = tool.icon;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF file.");
      return;
    }
    setFile(f);
    setResultBlob(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      if (!f.name.toLowerCase().endsWith(".pdf")) { toast.error("Please drop a PDF."); return; }
      setFile(f);
      setResultBlob(null);
    }
  };

  const handleProcess = async () => {
    if (!file) { toast.error("Please upload a PDF first."); return; }
    if (tool.id === "protect") {
      if (!opts.password) { toast.error("Password is required."); return; }
      if (opts.password !== opts.confirmPassword) { toast.error("Passwords don't match."); return; }
    }

    setLoading(true);
    try {
      const fields = { ...opts };
      delete fields.confirmPassword; // don't send confirmation field
      const blob = await processPdf(tool.endpoint, file, fields);
      setResultBlob(blob);
      toast.success(`${tool.label} complete! Click Download.`);
    } catch (err) {
      toast.error(err.message || "Processing failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = tool.outputName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`bg-white dark:bg-card border rounded-2xl overflow-hidden transition-all duration-200 ${
        expanded ? "shadow-lg border-border" : `border-border hover:shadow-md hover:-translate-y-0.5`
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((o) => !o)}
        className="w-full flex items-center gap-4 p-5 text-left group"
      >
        <div className={`w-11 h-11 rounded-xl ${tool.bg} flex items-center justify-center shrink-0`}>
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-sm`}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground">{tool.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-t border-border"
          >
            <div className="px-5 pb-5 pt-4 space-y-4">
              {/* File drop zone */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Upload PDF
                </label>
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${
                    file
                      ? "border-green-400/60 bg-green-50/60 dark:bg-green-950/20"
                      : "border-border hover:border-accent/50 hover:bg-accent/5"
                  }`}
                >
                  <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
                  {file ? (
                    <FileText className="w-5 h-5 text-green-600 shrink-0" />
                  ) : (
                    <Upload className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                  {file ? (
                    <div>
                      <p className="text-sm font-semibold text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Click or drag & drop a PDF file</p>
                  )}
                </label>
              </div>

              {/* Options */}
              {tool.options.map((opt) => (
                <div key={opt.key}>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                    {opt.label}
                  </label>
                  {opt.type === "select" ? (
                    <select
                      value={opts[opt.key] || ""}
                      onChange={(e) => setOpts((o) => ({ ...o, [opt.key]: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select...</option>
                      {opt.choices.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={opt.type || "text"}
                      value={opts[opt.key] || ""}
                      placeholder={opt.placeholder}
                      onChange={(e) => setOpts((o) => ({ ...o, [opt.key]: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>
              ))}

              {/* Result download */}
              {resultBlob && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 rounded-xl px-4 py-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 flex-1">
                    {tool.label} complete!
                  </p>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-400 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </motion.div>
              )}

              {/* Process button */}
              <Button
                onClick={handleProcess}
                disabled={loading || !file}
                className={`w-full rounded-xl h-10 gap-2 bg-gradient-to-r ${tool.color} text-white border-0 hover:opacity-90 disabled:opacity-50`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Icon className="w-4 h-4" />
                    {tool.label}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PDFTools() {
  return (
    <div className="max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">PDF Tools</h1>
        <p className="text-muted-foreground text-sm">
          Professional PDF utilities — compress, edit, rotate, protect and more.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-3">
        {TOOLS.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <ToolCard tool={tool} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}