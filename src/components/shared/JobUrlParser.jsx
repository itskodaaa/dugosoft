import React, { useState } from "react";
import { API_BASE } from "@/api/config";
import { Link2, Sparkles, X, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

/**
 * JobUrlParser — paste a LinkedIn/Indeed URL and get job info extracted.
 * Props:
 *   onParsed({ title, company, description }) — called when extraction succeeds
 */
export default function JobUrlParser({ onParsed }) {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed]   = useState(null);

  const parse = async () => {
    const trimmed = url.trim();
    if (!trimmed) { toast.warning("Paste a job posting URL first."); return; }
    if (!trimmed.startsWith("http")) { toast.warning("Please paste a valid URL."); return; }

    setLoading(true);
    setParsed(null);
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${API_BASE}/api/ai/invoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: "parseJobUrl", url: trimmed })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setParsed(data.result);
      } else {
        toast.error(data.message || "Failed to parse job URL");
      }
    } catch (e) {
      toast.error("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    if (!parsed) return;
    onParsed(parsed);
    toast.success("Job details pre-filled!");
    setParsed(null);
    setUrl("");
  };

  return (
    <div className="bg-gradient-to-br from-accent/5 to-blue-500/5 border border-accent/20 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-accent shrink-0" />
        <p className="text-xs font-bold text-foreground">Auto-fill from LinkedIn / Indeed URL</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="https://linkedin.com/jobs/view/... or indeed.com/viewjob?..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && parse()}
          className="text-xs h-9 bg-background"
        />
        <Button onClick={parse} disabled={loading} size="sm"
          className="h-9 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shrink-0 gap-1.5">
          {loading
            ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Sparkles className="w-3.5 h-3.5" />Fetch</>}
        </Button>
      </div>

      <AnimatePresence>
        {parsed && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-card rounded-xl border border-border p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-accent" /> {parsed.title}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" /> {parsed.company} · {parsed.location}
                </p>
              </div>
              <button onClick={() => setParsed(null)} className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center shrink-0">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {parsed.requirements?.slice(0, 6).map((r, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{r}</span>
              ))}
              {parsed.requirements?.length > 6 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{parsed.requirements.length - 6} more</span>
              )}
            </div>
            <Button onClick={apply} size="sm" className="w-full h-8 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg text-xs gap-1.5">
              <Sparkles className="w-3 h-3" /> Pre-fill this job into the form
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}