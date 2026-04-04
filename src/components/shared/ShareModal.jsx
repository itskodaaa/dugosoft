import React from "react";
import { motion } from "framer-motion";
import { X, Copy } from "lucide-react";
import { toast } from "sonner";

/**
 * Generic share modal.
 * Props: open, onClose, title, shareText, emailSubject
 */
export default function ShareModal({ open, onClose, title = "Share", shareText = "", emailSubject = "" }) {
  if (!open) return null;

  const encoded = encodeURIComponent(shareText);
  const url = encodeURIComponent(window.location.href);

  const actions = [
    { label: "LinkedIn",  color: "bg-[#0A66C2] hover:bg-[#0A66C2]/90", href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    { label: "WhatsApp",  color: "bg-[#25D366] hover:bg-[#25D366]/90",  href: `https://wa.me/?text=${encoded}` },
    { label: "Telegram",  color: "bg-[#26A5E4] hover:bg-[#26A5E4]/90",  href: `https://t.me/share/url?url=${url}&text=${encoded}` },
    { label: "Email",     color: "bg-muted hover:bg-muted/80 border border-border !text-foreground", href: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encoded}` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="bg-card rounded-2xl shadow-2xl border border-border p-6 w-80 mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {actions.map(a => (
            <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-center h-10 rounded-xl text-xs font-bold text-white transition-all ${a.color}`}>
              {a.label}
            </a>
          ))}
        </div>

        {shareText && (
          <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
            <span className="text-xs text-muted-foreground truncate flex-1">{shareText}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(shareText); toast.success("Copied!"); }}
              className="text-xs font-bold text-accent shrink-0 hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}