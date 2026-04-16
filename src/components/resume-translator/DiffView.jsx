import React, { useMemo } from "react";
import { X, GitCompare } from "lucide-react";
import { motion } from "framer-motion";

function computeDiff(original, translated) {
  const origLines = original.split("\n");
  const transLines = translated.split("\n");
  const maxLen = Math.max(origLines.length, transLines.length);
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    const o = origLines[i] ?? null;
    const t = transLines[i] ?? null;
    const changed = o !== t;
    result.push({ orig: o, trans: t, changed });
  }
  return result;
}

export default function DiffView({ original, translated, targetLang, onClose }) {
  const diff = useMemo(() => computeDiff(original, translated), [original, translated]);
  const changedCount = diff.filter(d => d.changed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-accent" />
            <div>
              <h2 className="font-bold text-foreground">Diff View — Original vs Translation</h2>
              <p className="text-xs text-muted-foreground">{changedCount} changed lines · {targetLang.flag} {targetLang.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Removed</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" /> Added</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted border border-border inline-block" /> Unchanged</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border shrink-0">
          <div className="px-4 py-2.5 bg-red-50/50">
            <p className="text-xs font-bold text-red-700">🇬🇧 Original</p>
          </div>
          <div className="px-4 py-2.5 bg-green-50/50">
            <p className="text-xs font-bold text-green-700">{targetLang.flag} {targetLang.name} Translation</p>
          </div>
        </div>

        {/* Diff lines */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 divide-x divide-border">
            {/* Left column */}
            <div className="font-mono text-xs leading-relaxed">
              {diff.map((row, i) => (
                <div key={i} className={`px-4 py-0.5 flex items-start gap-2 ${row.changed ? "bg-red-50 dark:bg-red-900/10" : ""}`}>
                  <span className="text-muted-foreground/40 select-none w-6 shrink-0 text-right">{i + 1}</span>
                  {row.orig !== null ? (
                    <span className={row.changed ? "text-red-700 dark:text-red-400" : "text-foreground"}>
                      {row.orig || " "}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/30 italic">—</span>
                  )}
                </div>
              ))}
            </div>
            {/* Right column */}
            <div className="font-mono text-xs leading-relaxed">
              {diff.map((row, i) => (
                <div key={i} className={`px-4 py-0.5 flex items-start gap-2 ${row.changed ? "bg-green-50 dark:bg-green-900/10" : ""}`}>
                  <span className="text-muted-foreground/40 select-none w-6 shrink-0 text-right">{i + 1}</span>
                  {row.trans !== null ? (
                    <span className={row.changed ? "text-green-700 dark:text-green-400" : "text-foreground"}>
                      {row.trans || " "}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/30 italic">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}