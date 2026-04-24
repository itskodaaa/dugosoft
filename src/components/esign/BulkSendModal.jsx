import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2, Send, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/api/config";
import { toast } from "sonner";

export default function BulkSendModal({ doc, onClose, onSent }) {
  const [recipients, setRecipients] = useState([{ email: "", name: "" }]);
  const [sending, setSending] = useState(false);
  const [signingLinks, setSigningLinks] = useState([]);

  const addRecipient = () => setRecipients(r => [...r, { email: "", name: "" }]);
  const removeRecipient = (i) => setRecipients(r => r.filter((_, idx) => idx !== i));
  const updateRecipient = (i, field, val) =>
    setRecipients(r => r.map((x, idx) => idx === i ? { ...x, [field]: val } : x));

  const handleSend = async () => {
    const valid = recipients.filter(r => r.email.trim());
    if (valid.length === 0) { toast.error("Add at least one recipient email."); return; }
    setSending(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/api/esign/${doc.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ signers: valid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send");
      setSigningLinks(data.signers || []);
      toast.success(`Signing links generated for ${valid.length} recipient${valid.length > 1 ? "s" : ""}!`);
    } catch (err) {
      toast.error(err?.message || "Failed.");
    } finally {
      setSending(false);
    }
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

        {signingLinks.length > 0 ? (
          <div className="p-5 space-y-3 max-h-[60vh] overflow-auto">
            <p className="text-sm font-semibold text-foreground">Share these links with your signers:</p>
            {signingLinks.map((s, i) => (
              <div key={i} className="bg-muted/50 rounded-xl p-3 space-y-1">
                <p className="text-xs font-semibold text-foreground">{s.name || s.email}</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-muted-foreground flex-1 truncate">{s.signing_url}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(s.signing_url); toast.success("Copied!"); }}
                    className="text-xs text-accent font-semibold hover:underline shrink-0"
                  >Copy</button>
                </div>
              </div>
            ))}
            <div className="pt-2 flex gap-2">
              <Button onClick={onSent} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">Done</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-3 max-h-[60vh] overflow-auto">
              <p className="text-xs text-muted-foreground">Each recipient will receive a unique signing link.</p>
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
          </>
        )}
      </motion.div>
    </div>
  );
}