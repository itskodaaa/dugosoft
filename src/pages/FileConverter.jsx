import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, RefreshCw, CheckCircle2 } from "lucide-react";
import FileUpload from "../components/shared/FileUpload";
import StatusBadge from "../components/shared/StatusBadge";
import ProcessingBorder from "../components/shared/ProcessingBorder";
import { toast } from "sonner";
import { API_BASE } from "@/api/config";

const CONVERSION_OPTIONS = [
  { from: "DOCX", to: "PDF",  label: "Word → PDF",  desc: "Convert Word documents to PDF format",         value: "docx-pdf", accept: ".docx,.doc" },
  { from: "PDF",  to: "DOCX", label: "PDF → Word",  desc: "Convert PDF files to editable Word documents", value: "pdf-docx", accept: ".pdf" },
  { from: "PDF",  to: "TXT",  label: "PDF → Text",  desc: "Extract plain text content from PDF files",    value: "pdf-txt",  accept: ".pdf" },
];

export default function FileConverter() {
  const [file,       setFile]       = useState(null);
  const [conversion, setConversion] = useState(null);
  const [status,     setStatus]     = useState("idle"); // idle | converting | done | error
  const [errorMsg,   setErrorMsg]   = useState("");

  const handleConvert = async () => {
    if (!file)       { toast.warning("Please upload a file first"); return; }
    if (!conversion) { toast.warning("Please select a conversion type"); return; }

    setStatus("converting");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversionType", conversion);

      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/api/convert`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Conversion failed" }));
        throw new Error(err.message || "Conversion failed");
      }

      const blob = await response.blob();
      const opt = CONVERSION_OPTIONS.find(o => o.value === conversion);
      const ext = opt?.to.toLowerCase();
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
      toast.error(err.message);
    }
  };

  const handleReset = () => {
    setFile(null);
    setConversion(null);
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">File Converter</h1>
          {file && (
            <Button variant="outline" size="sm" onClick={handleReset} className="rounded-full h-8 text-xs gap-1.5">
              <RefreshCw className="w-3 h-3" /> Start Over
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mb-4 text-sm">Convert documents between PDF, Word, and plain text formats.</p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left panel */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">1. Upload File</p>
            <FileUpload
              accept=".pdf,.docx,.doc"
              acceptLabel="PDF, DOCX"
              file={file}
              onFile={setFile}
              onRemove={handleReset}
            />
          </div>

          <AnimatePresence>
            {file && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">2. Choose Conversion</p>
                <div className="space-y-2">
                  {CONVERSION_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setConversion(opt.value)}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                        conversion === opt.value ? "border-accent bg-accent/5" : "border-border bg-card hover:border-accent/40"
                      }`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">{opt.from}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">{opt.to}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {file && conversion && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button onClick={handleConvert} disabled={status === "converting"}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-12 font-semibold gap-2">
                  {status === "converting" ? (
                    <><div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" /> Converting...</>
                  ) : (
                    <><ArrowRight className="w-4 h-4" /> Convert File</>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Output</p>
            {status !== "idle" && <StatusBadge status={status === "done" ? "complete" : status === "error" ? "error" : status} />}
          </div>

          <ProcessingBorder processing={status === "converting"}>
            <div className="min-h-[380px] p-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {status === "done" ? (
                  <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground mb-1">Conversion Complete</p>
                      <p className="text-sm text-muted-foreground">Your file has been downloaded automatically.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReset} className="rounded-full">
                      Convert Another File
                    </Button>
                  </motion.div>
                ) : status === "error" ? (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 text-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                      <FileText className="w-7 h-7 text-red-500" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Conversion Failed</p>
                    <p className="text-xs text-muted-foreground">{errorMsg}</p>
                    <Button variant="outline" size="sm" onClick={() => setStatus("idle")} className="rounded-full">Try Again</Button>
                  </motion.div>
                ) : status === "converting" ? (
                  <motion.div key="converting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <div className="w-7 h-7 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Converting {file?.name}...</p>
                    <p className="text-xs text-muted-foreground">This may take a moment.</p>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                      <FileText className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Upload a file and choose a conversion type to get started.
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
