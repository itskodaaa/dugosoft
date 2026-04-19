import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useDocumentTracker } from "@/lib/useDocumentTracker";
import { Upload, X, File, Download, RefreshCw, Merge, GripVertical, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "@/api/config";

// Free plan limits
const FREE_MAX_FILES = 3;
const FREE_MAX_SIZE_MB = 10;

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}


export default function DocumentMerger() {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | processing | done
  const [resultBlob, setResultBlob] = useState(null);
  const [dragOver, setDragOver] = useState(null); // index being dragged over

  const addFiles = useCallback((newFiles) => {
    const arr = Array.from(newFiles);
    const oversized = arr.filter((f) => f.size > FREE_MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`Files must be under ${FREE_MAX_SIZE_MB}MB on the free plan.`);
      return;
    }
    setFiles((prev) => {
      const combined = [...prev, ...arr];
      if (combined.length > FREE_MAX_FILES) {
        toast.warning(`Free plan: max ${FREE_MAX_FILES} files. Upgrade for more.`);
        return combined.slice(0, FREE_MAX_FILES);
      }
      return combined;
    });
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveFile = (from, to) => {
    setFiles((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  const { track } = useDocumentTracker();

  const handleMerge = async () => {
    if (files.length < 2) { toast.error("Add at least 2 files to merge."); return; }
    setStatus("processing");
    setResultBlob(null);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append("file", f));
      const token = localStorage.getItem("auth_token");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/merge`, { method: "POST", headers, body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Merge failed");
        setStatus("idle");
        return;
      }
      const blob = await res.blob();
      setResultBlob(blob);
      setStatus("done");
      track({ name: "merged_document.pdf", size: blob.size, category: "Merge" });
    } catch {
      toast.error("Merge request failed");
      setStatus("idle");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged_document.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFiles([]);
    setStatus("idle");
    setResultBlob(null);
  };

  const atLimit = files.length >= FREE_MAX_FILES;

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Document Merger</h1>
          {files.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleReset} className="rounded-full h-8 text-xs gap-1.5">
              <RefreshCw className="w-3 h-3" /> Start Over
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mb-6 text-sm">Combine multiple PDF or Word documents into one. Drag to reorder pages.</p>
      </motion.div>

      {/* Free plan banner */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-6 text-xs text-amber-700">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span><strong>Free plan:</strong> Up to {FREE_MAX_FILES} files · Max {FREE_MAX_SIZE_MB}MB each.
          <button className="underline ml-1 font-semibold hover:text-amber-900">Upgrade for unlimited</button>
        </span>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Upload + file list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Drop zone */}
          {!atLimit && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 p-8 flex flex-col items-center justify-center text-center ${
                dragging ? "border-accent bg-accent/5 scale-[1.01]" : "border-border hover:border-accent/50 hover:bg-muted/30 bg-card"
              }`}
            >
              <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.doc" className="hidden"
                onChange={(e) => addFiles(e.target.files)} />
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                dragging ? "bg-accent text-white" : "bg-accent/10 text-accent"
              }`}>
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                {dragging ? "Drop files here" : "Add PDF or Word files"}
              </p>
              <p className="text-xs text-muted-foreground">PDF, DOCX · Max {FREE_MAX_SIZE_MB}MB each</p>
            </div>
          )}

          {atLimit && (
            <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-6 text-center text-sm text-amber-700">
              <AlertCircle className="w-5 h-5 mx-auto mb-2" />
              File limit reached ({FREE_MAX_FILES}). <button className="underline font-semibold">Upgrade</button> for more.
            </div>
          )}

          {/* File list with drag-to-reorder */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Merge Order ({files.length}/{FREE_MAX_FILES})
              </p>
              {files.map((file, i) => (
                <motion.div
                  key={`${file.name}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-card ink-border cursor-move select-none ${
                    dragOver === i ? "border-accent bg-accent/5" : ""
                  }`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = parseInt(e.dataTransfer.getData("text/plain"));
                    moveFile(from, i);
                    setDragOver(null);
                  }}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 text-xs font-bold text-accent">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                  <button onClick={() => removeFile(i)}
                    className="w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {files.length >= 2 && status !== "done" && (
            <Button
              onClick={handleMerge}
              disabled={status === "processing"}
              className="w-full h-12 rounded-xl font-bold text-sm gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {status === "processing" ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <Merge className="w-4 h-4" />
                  Merge {files.length} Documents
                </>
              )}
            </Button>
          )}
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Output Preview</p>
          <div className="bg-card ink-border rounded-2xl min-h-[440px] p-6">
            <AnimatePresence mode="wait">
              {status === "done" && resultBlob ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-[380px] gap-5 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                    <File className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground mb-1">Merge complete!</p>
                    <p className="text-sm text-muted-foreground">{files.length} documents merged into one PDF</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleDownload}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-10 px-6 font-semibold gap-2">
                      <Download className="w-4 h-4" /> Download Merged PDF
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="rounded-full h-10 px-5 text-sm">
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Start Over
                    </Button>
                  </div>
                </motion.div>
              ) : status === "processing" ? (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-[380px] gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground mb-1">Merging your documents</p>
                    <p className="text-xs text-muted-foreground">{files.map(f => f.name).join(" + ")}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-[380px] gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <Merge className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {files.length < 2
                      ? "Add at least 2 files to start merging."
                      : "Click \"Merge Documents\" to combine your files."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}