import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function SignerModal({ docId, docTitle, onClose, onSent }) {
  const [signers, setSigners] = useState([{ email: "", name: "" }]);
  const [sending, setSending] = useState(false);

  const addSigner = () => setSigners(s => [...s, { email: "", name: "" }]);
  const removeSigner = (i) => setSigners(s => s.filter((_, idx) => idx !== i));
  const update = (i, field, val) => setSigners(s => s.map((sig, idx) => idx === i ? { ...sig, [field]: val } : sig));

  const handleSend = async () => {
    if (signers.some(s => !s.email)) { toast.error("All signers need an email."); return; }
    setSending(true);
    for (const signer of signers) {
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      await base44.entities.ESignSigner.create({ document_id: docId, email: signer.email, name: signer.name, token, status: "pending" });
      await base44.integrations.Core.SendEmail({
        to: signer.email,
        subject: `[Dugosoft] Please sign: ${docTitle}`,
        body: `Hello ${signer.name || ""},\n\nYou have been requested to sign a document on Dugosoft.\n\nDocument: ${docTitle}\n\nClick the link below to sign:\nhttps://dugosoft.com/sign/${token}\n\nThis link is unique to you.\n\n— Dugosoft Team`,
      });
    }
    await base44.entities.ESignDocument.update(docId, { status: "pending" });
    toast.success("Signing request sent to all signers!");
    setSending(false);
    onSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card ink-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-foreground text-lg">Request Signatures</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">Add signers below. Each will receive an email with a secure signing link.</p>

        <div className="space-y-3">
          {signers.map((s, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <input placeholder="Signer email *" value={s.email} onChange={e => update(i, "email", e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                <input placeholder="Name (optional)" value={s.name} onChange={e => update(i, "name", e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              {signers.length > 1 && (
                <button onClick={() => removeSigner(i)} className="w-8 h-8 mt-0.5 rounded-lg hover:bg-destructive/10 flex items-center justify-center shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button onClick={addSigner} className="flex items-center gap-2 text-xs font-semibold text-accent hover:underline">
          <Plus className="w-3.5 h-3.5" /> Add another signer
        </button>
        <p className="text-[11px] text-muted-foreground">Free plan: 1 signer max. <a href="/dashboard/pricing" className="text-accent hover:underline">Upgrade for more.</a></p>

        <div className="flex gap-2 pt-1">
          <Button onClick={handleSend} disabled={sending} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2">
            <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send for Signature"}
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
        </div>
      </motion.div>
    </div>
  );
}