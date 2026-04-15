import React, { useState, useEffect } from "react";
import { Bell, Send, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function RemindersPanel({ docId, docTitle }) {
  const [signers, setSigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState({});

  useEffect(() => {
    if (!docId) return;
    base44.entities.ESignSigner.filter({ document_id: docId })
      .then(setSigners)
      .finally(() => setLoading(false));
  }, [docId]);

  const sendReminder = async (signer) => {
    setSending(s => ({ ...s, [signer.id]: true }));
    await base44.integrations.Core.SendEmail({
      to: signer.email,
      subject: `Reminder: Please sign "${docTitle}"`,
      body: `Hello ${signer.name || "there"},\n\nThis is a friendly reminder that your signature is still required on the document: "${docTitle}".\n\nClick here to sign:\n${window.location.origin}/sign/${signer.token}\n\nPlease sign at your earliest convenience.\n\nThank you,\nDugosoft E-Signature`,
    });
    setSending(s => ({ ...s, [signer.id]: false }));
    toast.success(`Reminder sent to ${signer.email}`);
  };

  const sendAllReminders = async () => {
    const pending = signers.filter(s => s.status === "pending");
    if (pending.length === 0) { toast.info("No pending signers."); return; }
    for (const s of pending) await sendReminder(s);
    toast.success(`Reminders sent to ${pending.length} signer${pending.length > 1 ? "s" : ""}!`);
  };

  const pendingCount = signers.filter(s => s.status === "pending").length;

  if (loading) return null;
  if (signers.length === 0) return null;

  return (
    <div className="bg-card ink-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          <p className="text-sm font-bold text-foreground">Signers & Reminders</p>
        </div>
        {pendingCount > 0 && (
          <Button size="sm" onClick={sendAllReminders}
            className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-1.5">
            <Bell className="w-3 h-3" /> Remind All ({pendingCount})
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {signers.map(signer => (
          <div key={signer.id} className="flex items-center gap-3 px-3 py-2.5 bg-muted/40 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent shrink-0">
              {(signer.name || signer.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{signer.name || signer.email}</p>
              <p className="text-xs text-muted-foreground truncate">{signer.email}</p>
            </div>
            {signer.status === "signed" ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> Signed
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                  <Clock className="w-3.5 h-3.5" /> Pending
                </span>
                <button onClick={() => sendReminder(signer)} disabled={sending[signer.id]}
                  className="h-7 px-2.5 text-xs font-semibold bg-accent/10 hover:bg-accent/20 text-accent rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50">
                  {sending[signer.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Remind
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}