import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, File, Clock, AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/api/config";

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function timeLeft(expiresAt) {
  const ms = new Date(expiresAt) - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.floor(ms / 86_400_000);
  const hrs  = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days > 0) return `${days}d ${hrs}h left`;
  return `${hrs}h left`;
}

export default function ShareDownload() {
  const { token } = useParams();
  const [share, setShare]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/api/share/${token}`)
      .then(res => {
        if (res.status === 404) throw new Error("Transfer not found or the link is invalid.");
        if (res.status === 410) throw new Error("This transfer link has expired.");
        if (!res.ok) throw new Error("Failed to load transfer.");
        return res.json();
      })
      .then(setShare)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const downloadFile = async (index, name) => {
    setDownloading(prev => ({ ...prev, [index]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/share/${token}/file/${index}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. The file may no longer be available.");
    } finally {
      setDownloading(prev => ({ ...prev, [index]: false }));
    }
  };

  const downloadAll = async () => {
    for (let i = 0; i < share.files.length; i++) {
      await downloadFile(i, share.files[i].name);
      if (i < share.files.length - 1) await new Promise(r => setTimeout(r, 400));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-10 text-center max-w-md w-full">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Link unavailable</h1>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <Link to="/">
          <Button variant="outline" className="rounded-full">Back to Dugosoft</Button>
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg">

        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-extrabold text-foreground tracking-tight">Dugosoft</Link>
          <p className="text-sm text-muted-foreground mt-1">Secure file transfer</p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          {/* Top banner */}
          <div className="h-3 w-full" style={{ background: "linear-gradient(90deg, #f97316, #16a34a)" }} />

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-foreground">Files ready to download</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>From: {share.senderEmail}</span>
                  <span>·</span>
                  <Clock className="w-3 h-3" />
                  <span>{timeLeft(share.expiresAt)}</span>
                </div>
              </div>
            </div>

            {share.message && (
              <div className="bg-muted/50 rounded-xl p-4 mb-5 text-sm text-foreground italic border border-border">
                "{share.message}"
              </div>
            )}

            {/* File list */}
            <div className="space-y-2 mb-6">
              {share.files.map((file, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <File className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    onClick={() => downloadFile(i, file.name)}
                    disabled={downloading[i]}
                    className="w-8 h-8 rounded-lg bg-accent/10 hover:bg-accent/20 flex items-center justify-center transition-colors shrink-0">
                    {downloading[i]
                      ? <div className="w-3.5 h-3.5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                      : <Download className="w-3.5 h-3.5 text-accent" />}
                  </button>
                </motion.div>
              ))}
            </div>

            {share.files.length > 1 && (
              <Button onClick={downloadAll} className="w-full h-11 rounded-xl font-bold gap-2"
                style={{ background: "linear-gradient(135deg, #f97316, #16a34a)" }}>
                <Download className="w-4 h-4" /> Download All ({share.files.length} files)
              </Button>
            )}
            {share.files.length === 1 && (
              <Button onClick={() => downloadFile(0, share.files[0].name)} disabled={downloading[0]}
                className="w-full h-11 rounded-xl font-bold gap-2"
                style={{ background: "linear-gradient(135deg, #f97316, #16a34a)" }}>
                {downloading[0]
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Downloading...</>
                  : <><Download className="w-4 h-4" /> Download File</>}
              </Button>
            )}
          </div>

          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-muted-foreground">
              Powered by <Link to="/" className="text-accent hover:underline font-semibold">Dugosoft</Link> · Files auto-delete after expiry
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
