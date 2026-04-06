import React from "react";
import { Linkedin, Mail, MessageCircle, Copy, Send } from "lucide-react";
import { toast } from "sonner";

/**
 * SectionShareBar — inline share strip for any text content.
 * Props:
 *   text: string to share
 *   label?: string — display label
 */
export default function SectionShareBar({ text, label = "this" }) {
  const encoded = encodeURIComponent(text);
  const shortText = text.length > 200 ? text.slice(0, 200) + "..." : text;

  const copy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-border mt-3">
      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mr-1">Share:</span>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encoded}`}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1 h-7 px-2.5 rounded-full text-[10px] font-bold text-white bg-[#0A66C2] hover:bg-[#0A66C2]/90 transition-all">
        <Linkedin className="w-3 h-3" /> LinkedIn
      </a>
      <a href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1 h-7 px-2.5 rounded-full text-[10px] font-bold text-white bg-[#25D366] hover:bg-[#25D366]/90 transition-all">
        <MessageCircle className="w-3 h-3" /> WhatsApp
      </a>
      <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encoded}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1 h-7 px-2.5 rounded-full text-[10px] font-bold text-white bg-[#26A5E4] hover:bg-[#26A5E4]/90 transition-all">
        <Send className="w-3 h-3" /> Telegram
      </a>
      <a href={`mailto:?subject=LinkedIn Optimization&body=${encoded}`}
        className="flex items-center gap-1 h-7 px-2.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border hover:bg-muted/80 transition-all">
        <Mail className="w-3 h-3" /> Email
      </a>
      <button onClick={copy}
        className="flex items-center gap-1 h-7 px-2.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border hover:bg-muted/80 transition-all">
        <Copy className="w-3 h-3" /> Copy
      </button>
    </div>
  );
}