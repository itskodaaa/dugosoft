import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, RefreshCw, AlertCircle, Settings } from "lucide-react";
import FileUpload from "../components/shared/FileUpload";
import StatusBadge from "../components/shared/StatusBadge";
import ProcessingBorder from "../components/shared/ProcessingBorder";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const CONVERSION_OPTIONS = [
  { from: "DOCX", to: "PDF",  label: "Word → PDF",  desc: "Convert Word documents to PDF format",          value: "docx-pdf" },
  { from: "PDF",  to: "DOCX", label: "PDF → Word",  desc: "Convert PDF files to editable Word documents",  value: "pdf-docx" },
  { from: "PDF",  to: "TXT",  label: "PDF → Text",  desc: "Extract plain text content from PDF files",      value: "pdf-txt"  },
];

export default function FileConverter() {
  const { user } = useAuth();
  const [file,       setFile]       = useState(null);
  const [conversion, setConversion] = useState(null);
  const [status,     setStatus]     = useState("idle"); // idle | uploading | provider_not_configured
  const [fileRecord, setFileRecord] = useState(null);

  const handleConvert = async () => {
    if (!file)       { toast.warning("Please upload a file first"); return; }
    if (!conversion) { toast.warning("Please select a conversion type"); return; }

    setStatus("uploading");
    setFileRecord(null);

    // Upload file to get a real URL
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // Record file metadata in DB
    const record = await base44.entities.FileRecord.create({
      user_id:       user?.id || "unknown",
      original_name: file.name,
      file_type:     file.type || conversion.split("-")[0],
      file_size:     file.size,
      file_url,
      storage_path:  file_url,
      tool_used:     "file-converter",
      status:        "provider_not_configured",
      error_message: "Automatic file conversion requires a third-party conversion provider (e.g. CloudConvert). Not yet configured.",
    });

    setFileRecord(record);
    setStatus("provider_not_configured");
  };

  const handleReset = () => {
    setFile(null);
    setConversion(null);
    setStatus("idle");
    setFileRecord(null);
  };

  const selectedOption = CONVERSION_OPTIONS.find(o => o.value === conversion);

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">File Converter</h1>
          {(file || fileRecord) && (
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
                <Button onClick={handleConvert} disabled={status === "uploading"}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-12 font-semibold gap-2">
                  {status === "uploading" ? (
                    <><div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" /> Uploading...</>
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
            {status !== "idle" && <StatusBadge status={status === "provider_not_configured" ? "error" : status} />}
          </div>

          <ProcessingBorder processing={status === "uploading"}>
            <div className="min-h-[380px] p-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {status === "provider_not_configured" && fileRecord ? (
                  <motion.div key="not-configured" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-center gap-4 max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                      <Settings className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground mb-1">Conversion Provider Not Configured</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your file <strong>{file?.name}</strong> was uploaded and saved, but automatic conversion requires a third-party provider (e.g. CloudConvert API) which is not yet configured.
                      </p>
                    </div>
                    <div className="w-full bg-muted/40 rounded-xl p-3 text-xs text-left space-y-1">
                      <p className="font-semibold text-foreground">File recorded:</p>
                      <p className="text-muted-foreground">Name: {fileRecord.original_name}</p>
                      <p className="text-muted-foreground">Size: {(file?.size / 1024).toFixed(1)} KB</p>
                      <p className="text-muted-foreground">Status: <span className="text-amber-600 font-medium">pending_setup</span></p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      To enable conversions, integrate a conversion API and connect it to the <code className="bg-muted px-1 rounded">FileRecord</code> entity.
                    </p>
                  </motion.div>
                ) : status === "uploading" ? (
                  <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <div className="w-7 h-7 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Uploading {file?.name}...</p>
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