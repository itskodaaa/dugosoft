import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ESignUpload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();
  const navigate = useNavigate();

  const onFile = (f) => {
    if (!f) return;
    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)) {
      toast.error("Only PDF or DOCX files are supported.");
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    onFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file || !title) { toast.error("Please provide a file and title."); return; }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const doc = await base44.entities.ESignDocument.create({
      title,
      file_url,
      status: "draft",
    });
    toast.success("Document uploaded!");
    navigate(`/dashboard/esign/editor/${doc.id}`);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">Upload Document</h1>
        <p className="text-muted-foreground text-sm">Upload a PDF or DOCX to set up for signing.</p>
      </motion.div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 bg-muted/20"}`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={e => onFile(e.target.files[0])} />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-accent" />
            <div className="text-left">
              <p className="font-semibold text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button onClick={e => { e.stopPropagation(); setFile(null); setTitle(""); }} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center ml-2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-1">Drag & drop or click to upload</p>
            <p className="text-xs text-muted-foreground">PDF or DOCX · Max 20 MB</p>
          </>
        )}
      </div>

      {file && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Document Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <Button onClick={handleSubmit} disabled={uploading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2 h-11">
            {uploading ? "Uploading..." : <><span>Continue to Editor</span><ArrowRight className="w-4 h-4" /></>}
          </Button>
        </motion.div>
      )}
    </div>
  );
}