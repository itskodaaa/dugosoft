import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocumentPreviewModal({ doc, onClose, onDownload, onShare }) {
  if (!doc) return null;

  const isPdf = doc.type === "PDF";
  const isText = ["TXT", "DOCX", "DOC"].includes(doc.type);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-card ink-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground truncate max-w-[280px]">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.type} · {doc.size}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => onShare?.(doc)} className="rounded-full h-8 text-xs gap-1.5">
                <Share2 className="w-3 h-3" /> Share
              </Button>
              <Button size="sm" onClick={() => onDownload?.(doc)} className="rounded-full h-8 text-xs gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Download className="w-3 h-3" /> Download
              </Button>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors ml-1">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto p-6">
            {isPdf ? (
              <div className="bg-muted/40 rounded-xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                <File className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">PDF Preview</p>
                <p className="text-xs text-muted-foreground mb-4">In-browser PDF rendering for {doc.name}</p>
                {/* Simulated PDF pages */}
                <div className="w-full max-w-sm space-y-3 text-left">
                  {[1,2,3].map(p => (
                    <div key={p} className="bg-card ink-border rounded-lg p-4">
                      <div className="h-2 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-2 bg-muted rounded w-full mb-2" />
                      <div className="h-2 bg-muted rounded w-5/6 mb-2" />
                      <div className="h-2 bg-muted rounded w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            ) : isText ? (
              <div className="bg-muted/30 rounded-xl p-6 min-h-[300px]">
                <pre className="text-sm font-mono text-foreground leading-relaxed whitespace-pre-wrap">
{doc.preview || `Document: ${doc.name}
${"=".repeat(40)}

Section 1: Introduction
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco.

Section 2: Key Points
• Point one: Important content from document
• Point two: Formatting preserved as accurately as possible
• Point three: Full text content is editable after download

Section 3: Summary
The document was processed successfully. All text 
content has been extracted and preserved for review.`}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <File className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Preview not available for this file type. Download to view.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}