import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, X, FileText, Image, RefreshCw, Layers, Scissors, Merge,
  Lock, Crown, Download, Eye, CheckCircle2, Zap, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_BASE } from "@/api/config";
import { useDocumentTracker } from "@/lib/useDocumentTracker";

// ─── Constants ────────────────────────────────────────────────────────────────
const isPremiumUser = false;
const FREE_LIMIT_MB = 10;

const TABS = [
  { key: "ocr", label: "OCR Tools", icon: Eye, color: "#4f8ef7" },
  { key: "to-pdf", label: "Convert to PDF", icon: FileText, color: "#f97316" },
  { key: "from-pdf", label: "Convert from PDF", icon: RefreshCw, color: "#10b981" },
  { key: "images", label: "Image Tools", icon: Image, color: "#8b5cf6" },
  { key: "pdf-tools", label: "PDF Tools", icon: Layers, color: "#0ea5e9" },
];

const OCR_FEATURES = [
  { label: "Scanned PDF → Editable DOCX", free: true },
  { label: "Image (JPG/PNG) → Editable Text", free: true },
  { label: "Multi-language recognition", free: false },
  { label: "Table & layout detection", free: false },
  { label: "Handwriting recognition", free: false },
  { label: "Selectable OCR regions", free: false },
];

// Maps UI conversion labels to API ?type= param and output filename extension
const CONVERSION_TYPE_MAP = {
  "Word → PDF":  { type: "docx-pdf", ext: "pdf" },
  "Text → PDF":  { type: "txt-pdf",  ext: "pdf" },
  "JPG → PDF":   { type: "img-pdf",  ext: "pdf" },
  "PNG → PDF":   { type: "img-pdf",  ext: "pdf" },
  "PDF → Word":  { type: "pdf-docx", ext: "docx" },
  "PDF → Text":  { type: "pdf-txt",  ext: "txt" },
};

const CONVERSION_MATRIX = {
  "to-pdf": [
    { from: "DOCX", to: "PDF", label: "Word → PDF", free: true },
    { from: "TXT",  to: "PDF", label: "Text → PDF", free: true },
    { from: "JPG",  to: "PDF", label: "JPG → PDF",  free: true },
    { from: "PNG",  to: "PDF", label: "PNG → PDF",  free: true },
    { from: "PPTX", to: "PDF", label: "PowerPoint → PDF", free: false },
    { from: "XLSX", to: "PDF", label: "Excel → PDF",      free: false },
    { from: "RTF",  to: "PDF", label: "RTF → PDF",        free: false },
    { from: "TIFF", to: "PDF", label: "TIFF → PDF",       free: false },
  ],
  "from-pdf": [
    { from: "PDF", to: "DOCX", label: "PDF → Word", free: true },
    { from: "PDF", to: "TXT",  label: "PDF → Text", free: true },
    { from: "PDF", to: "XLSX", label: "PDF → Excel",       free: false },
    { from: "PDF", to: "PPTX", label: "PDF → PowerPoint",  free: false },
  ],
  "images": [
    { from: "HEIC", to: "JPG", label: "HEIC → JPG", free: true },
    { from: "WebP", to: "JPG", label: "WebP → JPG", free: true },
    { from: "BMP",  to: "JPG", label: "BMP → JPG",  free: true },
    { from: "GIF",  to: "PNG", label: "GIF → PNG",  free: false },
  ],
  "pdf-tools": [
    { from: "PDF", to: "PDF", label: "Merge PDFs",   free: true,  icon: Merge },
    { from: "PDF", to: "PDF", label: "Split PDF",    free: true,  icon: Scissors },
    { from: "PDF", to: "PDF", label: "Compress PDF", free: false },
    { from: "PDF", to: "PDF", label: "Rotate Pages", free: false },
    { from: "PDF", to: "PDF", label: "Extract Images",       free: false },
    { from: "PDF", to: "PDF", label: "Add Watermark",        free: false },
    { from: "PDF", to: "PDF", label: "Password Protect",     free: false },
    { from: "PDF", to: "PDF", label: "Unlock PDF (remove password)", free: false, premium: true },
    { from: "PDF", to: "PDF", label: "Remove Watermark",     free: false, premium: true },
  ],
};

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ onFile, accept = "*", label = "Any file" }) {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);

  const handle = useCallback((f) => {
    if (!f) return;
    const mb = f.size / (1024 * 1024);
    if (!isPremiumUser && mb > FREE_LIMIT_MB) {
      toast.error(`Free plan: max ${FREE_LIMIT_MB}MB per file. Upgrade for larger uploads.`);
      return;
    }
    setFile(f);
    onFile(f);
  }, [onFile]);

  return !file ? (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => ref.current?.click()}
      className={`rounded-xl border-2 border-dashed cursor-pointer transition-all p-10 text-center ${dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/40 bg-muted/20"}`}>
      <input ref={ref} type="file" className="hidden" accept={accept} onChange={e => handle(e.target.files[0])} />
      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm font-semibold text-foreground mb-1">{dragging ? "Drop it here!" : "Drag & drop your file"}</p>
      <p className="text-xs text-muted-foreground mb-3">{label}</p>
      <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">Browse</span>
    </div>
  ) : (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-card ink-border">
      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
      </div>
      <button onClick={() => { setFile(null); onFile(null); }} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}

// ─── OCR Panel ────────────────────────────────────────────────────────────────
function OCRPanel() {
  const { track } = useDocumentTracker();
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [lang, setLang] = useState("English");

  const run = async () => {
    if (!file) { toast.warning("Please upload a file first."); return; }
    setProcessing(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("auth_token");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/ocr`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.text);
        track({ name: file.name, size: file.size, category: "OCR" });
      } else {
        toast.error(data.message || "OCR failed");
      }
    } catch (err) {
      toast.error("OCR request failed");
    } finally {
      setProcessing(false);
    }
  };

  const downloadTxt = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const baseName = file?.name.replace(/\.[^.]+$/, "") || "ocr-result";
    downloadBlob(blob, `${baseName}.txt`);
  };

  const downloadDocx = async () => {
    if (!result || !file) return;
    try {
      const token = localStorage.getItem("auth_token");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Convert the extracted text as a plain-text file to DOCX
      const txtBlob = new Blob([result], { type: "text/plain" });
      const txtFile = new File([txtBlob], "ocr-result.txt", { type: "text/plain" });

      const formData = new FormData();
      formData.append("file", txtFile);

      // txt-pdf doesn't help here; we'll download as TXT wrapped in a DOCX via pdf-docx path
      // Instead: use the existing pdf-docx route by uploading original PDF if available,
      // otherwise just download TXT with .docx extension won't work — download TXT instead
      const baseName = file?.name.replace(/\.[^.]+$/, "") || "ocr-result";

      if (file.type === "application/pdf") {
        const pdfForm = new FormData();
        pdfForm.append("file", file);
        const res = await fetch(`${API_BASE}/api/convert?type=pdf-docx`, {
          method: "POST",
          headers,
          body: pdfForm,
        });
        if (!res.ok) throw new Error("Conversion failed");
        const blob = await res.blob();
        downloadBlob(blob, `${baseName}.docx`);
      } else {
        // For images, OCR text → download as TXT (DOCX conversion not supported without a server-side text-to-docx route)
        toast.info("Downloading as TXT (DOCX available for PDF sources only)");
        const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
        downloadBlob(blob, `${baseName}.txt`);
      }
    } catch (err) {
      toast.error("Download failed");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">Upload Document or Image</h2>
        <UploadZone onFile={setFile} accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.tiff" label="PDF, JPG, PNG, HEIC, WebP, TIFF" />
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">Language</label>
          <select value={lang} onChange={e => setLang(e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option>English</option>
            <option disabled={!isPremiumUser}>French {!isPremiumUser ? "(Pro)" : ""}</option>
            <option disabled={!isPremiumUser}>Spanish {!isPremiumUser ? "(Pro)" : ""}</option>
            <option disabled={!isPremiumUser}>Arabic {!isPremiumUser ? "(Pro)" : ""}</option>
            <option disabled={!isPremiumUser}>Chinese {!isPremiumUser ? "(Pro)" : ""}</option>
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</p>
          {OCR_FEATURES.map((f, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs ${f.free || isPremiumUser ? "text-foreground" : "text-muted-foreground/60"}`}>
              {f.free || isPremiumUser ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              {f.label}
              {!f.free && !isPremiumUser && <span className="ml-auto text-[10px] text-amber-600 font-bold">PRO</span>}
            </div>
          ))}
        </div>
        <Button onClick={run} disabled={processing || !file}
          className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold gap-2">
          {processing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing OCR...</> : <><Eye className="w-4 h-4" />Extract Text</>}
        </Button>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Extracted Text</p>
          {result && (
            <button onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied!"); }}
              className="text-xs text-accent hover:underline">Copy</button>
          )}
        </div>
        <div className="min-h-[380px] bg-muted/30 rounded-xl ink-border p-5">
          {result ? (
            <pre className="text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap">{result}</pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-muted-foreground">
              <Eye className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">OCR result will appear here</p>
            </div>
          )}
        </div>
        {result && (
          <div className="flex gap-2 mt-3">
            <Button onClick={downloadTxt} variant="outline" className="flex-1 rounded-full h-9 text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" /> Download TXT
            </Button>
            <Button onClick={downloadDocx} className="flex-1 rounded-full h-9 text-xs gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Download className="w-3.5 h-3.5" /> Download DOCX
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Conversion Panel ─────────────────────────────────────────────────────────
function ConversionPanel({ tabKey }) {
  const { track } = useDocumentTracker();
  const options = CONVERSION_MATRIX[tabKey] || [];
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resultBlob, setResultBlob] = useState(null);

  const run = async () => {
    if (!file) { toast.warning("Upload a file first."); return; }
    if (!selected) { toast.warning("Select a conversion type."); return; }
    if (!selected.free && !isPremiumUser) { toast.warning("This conversion requires a Pro plan."); return; }

    const mapping = CONVERSION_TYPE_MAP[selected.label];
    if (!mapping) {
      toast.warning("This conversion is not yet available.");
      return;
    }

    setProcessing(true);
    setDone(false);
    setResultBlob(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("auth_token");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/convert?type=${mapping.type}`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Conversion failed");
        return;
      }

      const blob = await res.blob();
      setResultBlob({ blob, ext: mapping.ext });
      setDone(true);
      track({ name: file.name, size: file.size, category: "Conversion" });
    } catch (err) {
      toast.error("Conversion request failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const baseName = file?.name.replace(/\.[^.]+$/, "") || "converted";
    downloadBlob(resultBlob.blob, `${baseName}.${resultBlob.ext}`);
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">1. Choose Conversion</p>
          <div className="grid grid-cols-1 gap-2">
            {options.map((opt, i) => {
              const locked = !opt.free && !isPremiumUser;
              return (
                <button key={i} onClick={() => { if (locked) { toast.warning("Upgrade to Pro to unlock this conversion."); return; } setSelected(opt); setDone(false); setResultBlob(null); }}
                  className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between ${selected?.label === opt.label ? "border-accent bg-accent/5" : "border-border hover:border-accent/30 bg-card"} ${locked ? "opacity-60" : ""}`}>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                  {locked ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : opt.free ? <span className="text-[10px] text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded">FREE</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="lg:col-span-3 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">2. Upload File</p>
          <UploadZone onFile={(f) => { setFile(f); setDone(false); setResultBlob(null); }} />
        </div>
        <Button onClick={run} disabled={processing || !file || !selected}
          className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold gap-2">
          {processing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Converting...</>
          : done ? <><CheckCircle2 className="w-4 h-4" />Converted!</>
          : <><RefreshCw className="w-4 h-4" />Convert</>}
        </Button>
        {done && resultBlob && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-800">Conversion complete!</p>
                <p className="text-xs text-green-600">{file?.name} → {selected?.to}</p>
              </div>
            </div>
            <Button onClick={handleDownload} size="sm" className="rounded-full h-8 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-3 h-3" />Download
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OCRTools() {
  const [activeTab, setActiveTab] = useState("ocr");

  return (
    <div className="max-w-6xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">File Conversion & OCR Suite</h1>
            <p className="text-muted-foreground text-sm">Convert files, extract text, and process documents with AI-powered OCR.</p>
          </div>
          {!isPremiumUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
              <Crown className="w-3.5 h-3.5" />
              Free Plan · <button className="underline font-bold">Upgrade for full access</button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5 mt-3">
          <Shield className="w-3.5 h-3.5 text-green-500 shrink-0" />
          Files are encrypted during upload and automatically deleted after 1 hour. We never store or share your content.
        </div>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeTab === tab.key ? "text-white border-transparent" : "bg-card border-border text-muted-foreground hover:border-opacity-50"}`}
              style={activeTab === tab.key ? { background: tab.color, borderColor: tab.color } : {}}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="bg-card ink-border rounded-2xl p-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            {activeTab === "ocr" ? <OCRPanel /> : <ConversionPanel tabKey={activeTab} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Upgrade banner */}
      {!isPremiumUser && (
        <div className="bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/20 rounded-2xl p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="font-bold text-foreground">Unlock Full OCR & Conversion Power</p>
              <p className="text-sm text-muted-foreground mt-0.5">Multi-language OCR, batch processing, larger uploads, unlimited conversions.</p>
            </div>
          </div>
          <Button className="shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 font-bold">Upgrade to Pro</Button>
        </div>
      )}
    </div>
  );
}
