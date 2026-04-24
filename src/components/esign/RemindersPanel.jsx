import React, { useState, useEffect } from "react";
import { Bell, Send, Clock, CheckCircle2 } from "lucide-react";
import { API_BASE } from "@/api/config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function RemindersPanel({ docId, docTitle }) {
  const [signers, setSigners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) return;
    const token = localStorage.getItem("auth_token");
    fetch(`${API_BASE}/api/esign/${docId}/signers`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setSigners(Array.isArray(d) ? d : []))
      .catch(() => setSigners([]))
      .finally(() => setLoading(false));
  }, [docId]);

  const sendReminder = (signer) => {
    const signingUrl = `${window.location.origin}/sign/${signer.token}`;
    navigator.clipboard.writeText(signingUrl);
    toast.success(`Signing link copied for ${signer.email}`);
  };

  const sendAllReminders = async () => {
    const pending = signers.filter(s => s.status === "pending");
    if (pending.length === 0) { toast.info("No pending signers."); return; }
    for (const s of pending) sendReminder(s);
    toast.success(`Signing links copied for ${pending.length} signer${pending.length > 1 ? "s" : ""}!`);
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
                <button onClick={() => sendReminder(signer)}
                  className="h-7 px-2.5 text-xs font-semibold bg-accent/10 hover:bg-accent/20 text-accent rounded-lg flex items-center gap-1 transition-colors">
                  <Send className="w-3 h-3" />
                  Copy Link
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}