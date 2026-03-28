import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, Image, File, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FILE_ICONS = {
  "application/pdf": FileText,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileText,
  "application/msword": FileText,
  "image/png": Image,
  "image/jpeg": Image,
  "text/plain": File,
};

const EXT_LABELS = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/msword": "DOC",
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "text/plain": "TXT",
};

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function FileUpload({
  accept = ".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt",
  acceptLabel = "PDF, DOCX, PNG, JPG, TXT",
  onFile,
  file,
  onRemove,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const simulateUpload = useCallback((selectedFile) => {
    setUploading(true);
    setUploaded(false);
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 25 + 10;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setUploading(false);
        setUploaded(true);
      }
      setProgress(Math.min(p, 100));
    }, 200);
    onFile && onFile(selectedFile);
  }, [onFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) simulateUpload(dropped);
  }, [simulateUpload]);

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected) simulateUpload(selected);
  };

  const handleRemove = () => {
    setProgress(0);
    setUploaded(false);
    setUploading(false);
    inputRef.current && (inputRef.current.value = "");
    onRemove && onRemove();
  };

  const Icon = file ? (FILE_ICONS[file.type] || File) : null;
  const ext = file ? (EXT_LABELS[file.type] || "FILE") : null;

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-8 flex flex-col items-center justify-center text-center min-h-[160px] ${
              dragging
                ? "border-accent bg-accent/5 scale-[1.01]"
                : "border-border hover:border-accent/50 hover:bg-muted/40 bg-card"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              dragging ? "bg-accent text-accent-foreground" : "bg-accent/10 text-accent"
            }`}>
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              {dragging ? "Drop your file here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground">{acceptLabel}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4 rounded-full h-8 text-xs px-4 pointer-events-none"
            >
              Browse Files
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl bg-card ink-border p-4"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                {Icon && <Icon className="w-5 h-5 text-accent" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
                    {ext}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>

                {/* Progress bar */}
                {(uploading || uploaded) && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {uploading ? "Uploading..." : "Upload complete"}
                      </span>
                      <span className="text-xs font-mono text-accent">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${uploaded ? "bg-success" : "bg-accent"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status + Remove */}
              <div className="flex items-center gap-2 shrink-0">
                {uploaded && <CheckCircle2 className="w-4 h-4 text-success" />}
                <button
                  onClick={handleRemove}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Replace */}
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-3 text-xs text-accent hover:underline"
            >
              Replace file
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}