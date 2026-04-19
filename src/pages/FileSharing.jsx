import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Copy, CheckCircle2, File, Link2, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_BASE } from "@/api/config";
import { useAuth } from "@/lib/AuthContext";

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function timeLeft(expiresAt) {
  const ms = new Date(expiresAt) - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.floor(ms / 86_400_000);
  const hrs = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days > 0) return `${days}d ${hrs}h left`;
  return `${hrs}h left`;
}

const FREE_MAX_FILES = 5;
const FREE_MAX_SIZE_MB = 25;

const EXPIRY_OPTIONS = [
  { label: "1 day",  value: "1d", free: true },
  { label: "3 days", value: "3d", free: true },
  { label: "7 days", value: "7d", free: false },
];

export default function FileSharing() {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [files, setFiles]               = useState([]);
  const [dragging, setDragging]         = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderEmail, setSenderEmail]   = useState(user?.email || "");
  const [message, setMessage]           = useState("");
  const [expiry, setExpiry]             = useState("3d");
  const [creating, setCreating]         = useState(false);
  const [result, setResult]             = useState(null); // { link, token, expiresAt, fileCount }
  const [copied, setCopied]             = useState(false);
  const [history, setHistory]           = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user) { setSenderEmail(user.email || ""); loadHistory(); }
  }, [user]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/api/share/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.shares || []);
      }
    } catch { /* silent */ }
    finally { setLoadingHistory(false); }
  };

  const addFiles = useCallback((newFiles) => {
    const arr = Array.from(newFiles);
    const oversized = arr.filter(f => f.size > FREE_MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length > 0) { toast.error(`Files must be under ${FREE_MAX_SIZE_MB}MB each.`); return; }
    setFiles(prev => {
      const combined = [...prev, ...arr];
      if (combined.length > FREE_MAX_FILES) {
        toast.warning(`Free plan: max ${FREE_MAX_FILES} files per transfer.`);
        return combined.slice(0, FREE_MAX_FILES);
      }
      return combined;
    });
  }, []);

  const handleDrop = useCallback(e => {
    e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = idx => setFiles(prev => prev.filter((_, i) => i !== idx));

  const isEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleCreate = async () => {
    if (files.length === 0)                         { toast.error("Please upload at least one file."); return; }
    if (!senderEmail.trim() || !isEmail(senderEmail)) { toast.error("Enter a valid sender email."); return; }
    if (!recipientEmail.trim() || !isEmail(recipientEmail)) { toast.error("Enter a valid recipient email."); return; }

    setCreating(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append("file", f));

      const authToken = localStorage.getItem("auth_token");
      const headers = {};
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const params = new URLSearchParams({
        sender:    senderEmail,
        recipient: recipientEmail,
        expires:   expiry,
        ...(message ? { message } : {}),
      });

      const res = await fetch(`${API_BASE}/api/share?${params}`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Upload failed"); return; }

      setResult(data);
      if (user) loadHistory();
    } catch (err) {
      toast.error("Upload failed — please try again");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFiles([]); setResult(null); setRecipientEmail(""); setMessage(""); setExpiry("3d");
  };

  return (
    <div className="max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-xs text-amber-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span><strong>Free plan:</strong> Up to {FREE_MAX_FILES} files · Max {FREE_MAX_SIZE_MB}MB each · Links expire in max 3 days.
            <button className="underline ml-1 font-semibold hover:text-amber-900">Upgrade for 7-day links & unlimited files</button>
          </span>
        </div>
        <div className="relative rounded-2xl overflow-hidden h-32 mb-8"
          style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 40%, #16a34a 100%)" }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-20 w-24 h-24 rounded-full bg-green-300/20" />
          <div className="relative z-10 p-7 h-full flex flex-col justify-center">
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-0.5">File Sharing</h1>
            <p className="text-white/80 text-sm">Share files instantly — like WeTransfer, built into Dugosoft.</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="bg-card ink-border rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground mb-1">Your transfer is ready!</h2>
            <p className="text-sm text-muted-foreground mb-6">Share this link with anyone to let them download your files.</p>

            <div className="flex items-center gap-2 bg-muted rounded-xl p-3 mb-4 max-w-md mx-auto">
              <Link2 className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm font-mono text-foreground truncate flex-1 text-left">{result.link}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button onClick={() => handleCopy(result.link)} className="rounded-full gap-2 bg-green-500 hover:bg-green-600 text-white">
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button variant="outline" className="rounded-full gap-2" onClick={() => window.open(result.link, "_blank")}>
                <ExternalLink className="w-4 h-4 text-orange-500" /> Open Download Page
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              {result.fileCount} file{result.fileCount !== 1 ? "s" : ""} · Expires {new Date(result.expiresAt).toLocaleDateString()}
            </p>
            <button onClick={handleReset} className="text-xs text-accent hover:underline">Create another transfer</button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid lg:grid-cols-5 gap-6">

            {/* Left: Upload */}
            <div className="lg:col-span-3 space-y-4">
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 p-12 flex flex-col items-center justify-center text-center min-h-[220px] ${
                  dragging ? "border-orange-400 bg-orange-50/50 scale-[1.01]" : "border-border hover:border-accent/50 hover:bg-muted/30 bg-card"
                }`}>
                <input ref={inputRef} type="file" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${dragging ? "bg-orange-500 text-white" : "bg-orange-500/10 text-orange-500"}`}>
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-base font-semibold text-foreground mb-1">{dragging ? "Drop files here" : "Drag & drop files to share"}</p>
                <p className="text-sm text-muted-foreground mb-4">Any file type · Max {FREE_MAX_SIZE_MB}MB each</p>
                <Button size="sm" variant="outline" className="rounded-full h-8 text-xs px-5 pointer-events-none border-orange-300">Browse Files</Button>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card ink-border">
                      <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                        <File className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                      </div>
                      <button onClick={() => removeFile(i)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Settings */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-card ink-border rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Transfer Settings</h3>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Your Email <span className="text-destructive">*</span></Label>
                  <Input placeholder="you@example.com" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} className="h-9 text-sm bg-background" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Recipient Email <span className="text-destructive">*</span></Label>
                  <Input placeholder="recipient@example.com" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} className="h-9 text-sm bg-background" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Message <span className="text-muted-foreground/60">(optional)</span></Label>
                  <Textarea placeholder="Add a message..." value={message} onChange={e => setMessage(e.target.value)} className="min-h-[80px] text-sm resize-none bg-background" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Link Expires In</Label>
                  <div className="flex gap-2">
                    {EXPIRY_OPTIONS.map(opt => (
                      <button key={opt.value}
                        onClick={() => opt.free ? setExpiry(opt.value) : toast.warning("7-day links require a Pro plan.")}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          expiry === opt.value ? "border-green-500 bg-green-500/10 text-green-600"
                          : opt.free ? "border-border text-muted-foreground hover:border-accent/40"
                          : "border-border text-muted-foreground/40 cursor-default"
                        }`}>
                        {opt.label}
                        {!opt.free && <span className="block text-[9px] text-amber-500">Pro</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={creating || files.length === 0}
                className="w-full h-12 rounded-xl font-bold text-sm gap-2"
                style={{ background: creating ? undefined : "linear-gradient(135deg, #f97316, #16a34a)" }}>
                {creating
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                  : <><Link2 className="w-4 h-4" /> Create Transfer Link</>}
              </Button>
              <p className="text-center text-xs text-muted-foreground">{files.length} file{files.length !== 1 ? "s" : ""} selected</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer History */}
      {user && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card ink-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-2 h-6 rounded-full bg-orange-500" />
            <h2 className="text-base font-bold text-foreground">Transfer History</h2>
          </div>
          {loadingHistory ? (
            <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No transfers yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map(item => {
                const expired = new Date() > new Date(item.expiresAt);
                const files = item.files || [];
                const link = `${window.location.origin}/download/${item.token}`;
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                      <File className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {files[0]?.name || "Transfer"}{files.length > 1 ? ` +${files.length - 1} more` : ""}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>→ {item.recipientEmail}</span>
                        <span>·</span>
                        <Clock className="w-3 h-3" />
                        <span>{expired ? "Expired" : timeLeft(item.expiresAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        expired ? "bg-muted text-muted-foreground" : "bg-green-500/10 text-green-600"
                      }`}>{expired ? "Expired" : "Active"}</span>
                      {!expired && (
                        <button onClick={() => handleCopy(link)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
