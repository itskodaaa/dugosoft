import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Download, Eye, RefreshCw, AlertCircle } from "lucide-react";
import FileUpload from "../components/shared/FileUpload";
import StatusBadge from "../components/shared/StatusBadge";
import ProcessingBorder from "../components/shared/ProcessingBorder";
import { toast } from "sonner";

const CONVERSION_OPTIONS = [
  { from: "DOCX", to: "PDF", label: "Word → PDF", desc: "Convert Word documents to PDF format", value: "docx-pdf" },
  { from: "PDF", to: "DOCX", label: "PDF → Word", desc: "Convert PDF files to editable Word documents", value: "pdf-docx" },
  { from: "PDF", to: "TXT", label: "PDF → Text", desc: "Extract plain text content from PDF files", value: "pdf-txt" },
];

const PREVIEW_TEXT = `CONVERSION PREVIEW
==================

This document has been successfully converted.

Section 1: Introduction
-----------------------
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Section 2: Key Points
---------------------
• Point one: Important information extracted from the document
• Point two: Formatting has been preserved where possible
• Point three: All text content is fully editable

Section 3: Conclusion
---------------------
The conversion process completed with 100% text accuracy.
Tables, headers, and bullet points have been mapped appropriately.`;

export default function FileConverter() {
  const [file, setFile] = useState(null);
  const [conversion, setConversion] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  const handleConvert = () => {
    if (!file) { toast.warning("Please upload a file first"); return; }
    if (!conversion) { toast.warning("Please select a conversion type"); return; }
    setStatus("processing");
    setResult(null);
    setTimeout(() => {
      setStatus("complete");
      setResult(PREVIEW_TEXT);
    }, 2800);
  };

  const handleReset = () => {
    setFile(null);
    setConversion(null);
    setStatus("idle");
    setResult(null);
  };

  const selectedOption = CONVERSION_OPTIONS.find((o) => o.value === conversion);

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">File Converter</h1>
          {(file || result) && (
            <Button variant="outline" size="sm" onClick={handleReset} className="rounded-full h-8 text-xs gap-1.5">
              <RefreshCw className="w-3 h-3" /> Start Over
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mb-4 text-sm">Convert documents between PDF, Word, and plain text formats.</p>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-6 text-xs text-emerald-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span><strong>Free:</strong> PDF ↔ DOCX and all document conversions are completely free — no limits!</span>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              1. Upload File
            </p>
            <FileUpload
              accept=".pdf,.docx,.doc"
              acceptLabel="PDF, DOCX"
              file={file}
              onFile={setFile}
              onRemove={() => { setFile(null); setConversion(null); setStatus("idle"); setResult(null); }}
            />
          </div>

          {/* Conversion type */}
          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  2. Choose Conversion
                </p>
                <div className="space-y-2">
                  {CONVERSION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setConversion(opt.value)}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                        conversion === opt.value
                          ? "border-accent bg-accent/5"
                          : "border-border bg-card hover:border-accent/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {opt.from}
                          </span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                            {opt.to}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground mt-1">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Convert button */}
          <AnimatePresence>
            {file && conversion && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  onClick={handleConvert}
                  disabled={status === "processing"}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-12 font-semibold gap-2"
                >
                  {status === "processing" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Convert File
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right panel — Output */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Output Preview
            </p>
            {status !== "idle" && <StatusBadge status={status} />}
          </div>

          <ProcessingBorder processing={status === "processing"}>
            <div className="min-h-[440px] p-6">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-success/5 border border-success/20">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {file?.name?.replace(/\.[^/.]+$/, "")}_converted.{selectedOption?.to.toLowerCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">Conversion complete · Ready to download</p>
                      </div>
                    </div>

                    {/* Preview pane */}
                    <div className="rounded-lg ink-border bg-muted/30 p-5 mb-5 max-h-64 overflow-y-auto">
                      <pre className="text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap">
                        {result}
                      </pre>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-10 px-6 font-semibold gap-2"
                        onClick={() => toast.success("Download started (simulated)")}
                      >
                        <Download className="w-4 h-4" />
                        Download {selectedOption?.to}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full h-10 px-6 font-semibold gap-2"
                        onClick={() => toast.info("Full preview available in the complete version")}
                      >
                        <Eye className="w-4 h-4" />
                        Full Preview
                      </Button>
                    </div>
                  </motion.div>
                ) : status === "processing" ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-[380px] gap-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <div className="w-7 h-7 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground mb-1">Converting your document</p>
                      <p className="text-xs text-muted-foreground">
                        {file?.name} → {selectedOption?.to}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-[380px] gap-3 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                      <FileText className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Upload a file and choose a conversion type to see the output here.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ProcessingBorder>
        </div>
      </div>
    </div>
  );
}