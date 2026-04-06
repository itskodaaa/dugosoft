import React from "react";
import { motion } from "framer-motion";
import { X, Copy, Mail, MessageCircle, Send, Linkedin } from "lucide-react";
import { toast } from "sonner";

/**
 * Multi-platform share modal for CV/document sharing.
 * Props: open, onClose, cv (object with title, content)
 */
export default function CVShareModal({ open, onClose, cv }) {
  if (!open || !cv) return null;

  const shareUrl = `${window.location.origin}/dashboard/cv-vault`;
  const shareText = encodeURIComponent(`Check out my CV: ${cv.title} — shared via Softdugo`);
  const encodedUrl = encodeURIComponent(shareUrl);

  const platforms = [
    {
      label: "LinkedIn",
      color: "bg-[#0A66C2] hover:bg-[#0A66C2]/90",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      color: "bg-[#25D366] hover:bg-[#25D366]/90",
      icon: MessageCircle,
      href: `https://wa.me/?text=${shareText}%20${encodedUrl}`,
    },
    {
      label: "Telegram",
      color: "bg-[#26A5E4] hover:bg-[#26A5E4]/90",
      icon: Send,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`,
    },
    {
      label: "Gmail",
      color: "bg-[#EA4335] hover:bg-[#EA4335]/90",
      icon: Mail,
      href: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(`My CV: ${cv.title}`)}&body=${shareText}%20${encodedUrl}`,
    },
    {
      label: "Email",
      color: "bg-muted hover:bg-muted/80 border border-border",
      textColor: "text-foreground",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(`My CV: ${cv.title}`)}&body=${shareText}%20${encodedUrl}`,
    },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="bg-card rounded-2xl shadow-2xl border border-border p-6 w-96 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground">Share CV</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[240px]">{cv.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Platform buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <a
                key={p.label}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold text-white transition-all ${p.color} ${p.textColor || ""}`}
              >
                <Icon className="w-4 h-4" />
                {p.label}
              </a>
            );
          })}
        </div>

        {/* Copy link */}
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
          <span className="text-xs text-muted-foreground truncate flex-1">{shareUrl}</span>
          <button
            onClick={copyLink}
            className="flex items-center gap-1 text-xs font-bold text-accent shrink-0 hover:underline"
          >
            <Copy className="w-3 h-3" /> Copy
          </button>
        </div>
      </motion.div>
    </div>
  );
}