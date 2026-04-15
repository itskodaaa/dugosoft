import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2, Send, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function BulkSendModal({ doc, onClose, onSent }) {
  const [recipients, setRecipients] = useState([{ email: "", name: "" }]);
  const [sending, setSending] = useState(false);

  const addRecipient = () => setRecipients(r => [...r, { email: "", name: "" }]);
  const removeRecipient = (i) => setRecipients(r => r.filter((_, idx) => idx !== i));
  const updateRecipient = (i, field, val) =>
    setRecipients(r => r.map((x, idx) => idx === i ? { ...x, [field]: val } : x));

  const handleSend = async () => {
    const valid = recipients.filter(r => r.email.trim());
    if (valid.length === 0) { toast.error("Add at least one recipient email."); return; }
    setSending(true);

    for (const r of valid) {
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      await base44.entities.ESignSigner.create({
        document_id: doc.id,
        email: r.email.trim(),
        name: r.name.trim() || r.email,
        status: "pending",
        token,
      });
      await base44.integrations.Core.SendEmail({
        to: r.email.trim(),
        subject: `Action Required: Please sign "${doc.title}"`,
        body: `Hello ${r.name || "there"},\n\nYou've been requested to sign the document: "${doc.title}".\n\nClick the link below to review and sign:\n${window.location.origin}/sign/${token}\n\nThis request was sent via Dugosoft E-Signature.\n\nThank you.`,
      });
    }

    await base44.entities.ESignDocument.update(doc.id, { status: "pending" });
    setSending(false);
    toast.success(`Signing request sent to ${valid.length} recipient${valid.length > 1 ? "s" : ""}!`);
    onSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card ink-border rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="font-bold text-foreground">Bulk Send — {doc.title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[60vh] overflow-auto">
          <p className="text-xs text-muted-foreground">Each recipient will receive a unique signing link via email.</p>
          {recipients.map((r, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">{i + 1}</span>
              <input value={r.email} onChange={e => updateRecipient(i, "email", e.target.value)}
                placeholder="Email address *"
                className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <input value={r.name} onChange={e => updateRecipient(i, "name", e.target.value)}
                placeholder="Name (optional)"
                className="w-32 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              {recipients.length > 1 && (
                <button onClick={() => removeRecipient(i)} className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              )}
            </div>
          ))}
          <button onClick={addRecipient}
            className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline mt-1">
            <Plus className="w-3.5 h-3.5" /> Add Another Recipient
          </button>
        </div>

        <div className="p-5 border-t border-border flex gap-2">
          <Button onClick={handleSend} disabled={sending}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2">
            {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send to All</>}
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
        </div>
      </motion.div>
    </div>
  );
}