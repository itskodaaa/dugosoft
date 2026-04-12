import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, RotateCcw, FileText, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MOCK_VERSIONS = [
  {
    id: 1,
    docName: "Senior_Dev_Resume_2026.pdf",
    versions: [
      { v: 3, date: "2026-04-10 14:32", label: "Added skills section", size: "245 KB" },
      { v: 2, date: "2026-04-08 09:15", label: "Updated work experience", size: "238 KB" },
      { v: 1, date: "2026-04-05 17:00", label: "Initial version", size: "210 KB" },
    ],
  },
  {
    id: 2,
    docName: "Cover_Letter_Google.pdf",
    versions: [
      { v: 2, date: "2026-04-09 11:20", label: "Personalized for Google role", size: "95 KB" },
      { v: 1, date: "2026-04-07 10:05", label: "Initial version", size: "88 KB" },
    ],
  },
  {
    id: 3,
    docName: "Marketing_Contract_FR.docx",
    versions: [
      { v: 1, date: "2026-03-29 16:45", label: "Translated to French", size: "188 KB" },
    ],
  },
];

function DocVersionGroup({ doc }) {
  const [open, setOpen] = useState(false);
  const latest = doc.versions[0];

  return (
    <div className="bg-card ink-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{doc.docName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {doc.versions.length} version{doc.versions.length !== 1 ? "s" : ""} · Latest: {latest.date}
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent shrink-0">
          v{latest.v}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            {doc.versions.map((ver, i) => (
              <div key={ver.v} className={`flex items-center gap-4 px-5 py-3.5 ${i !== doc.versions.length - 1 ? "border-b border-border" : ""}`}>
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                  v{ver.v}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{ver.label}</p>
                  <p className="text-xs text-muted-foreground">{ver.date} · {ver.size}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toast.info(`Previewing v${ver.v}…`)}
                    className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  {i > 0 && (
                    <button
                      onClick={() => toast.success(`Reverted to v${ver.v}`)}
                      className="w-8 h-8 rounded-lg hover:bg-accent/10 flex items-center justify-center transition-colors"
                      title="Revert to this version"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-accent" />
                    </button>
                  )}
                  {i === 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Current</span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function History() {
  return (
    <div className="max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">Version History</h1>
        <p className="text-muted-foreground text-sm">Track changes, view timestamps, and revert to previous versions of your documents.</p>
      </motion.div>

      <div className="space-y-3">
        {MOCK_VERSIONS.map((doc, i) => (
          <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <DocVersionGroup doc={doc} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}