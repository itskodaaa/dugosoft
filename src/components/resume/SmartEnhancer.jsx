import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, X, RefreshCw, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function SmartEnhancer({ initialText = "", onApply }) {
  const [original, setOriginal] = useState(initialText);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(new Set());

  const enhance = async () => {
    if (!original.trim()) { toast.warning("Enter some text to enhance."); return; }
    setLoading(true);
    setSuggestions([]);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert resume coach. Analyze the following resume bullets/text and provide specific, improved versions.

TEXT TO IMPROVE:
${original}

Return a JSON object with:
- suggestions: array of objects, each with:
  - original: the original line/bullet (exact quote from input)
  - improved: the rewritten version (stronger, quantified, action-verb led, professional)
  - reason: 1 short sentence explaining what was improved
  
Focus on: stronger action verbs, quantified achievements (use XYZ: "Accomplished X, as measured by Y, by doing Z"), clarity, impact.
If no specific metrics exist, suggest where to add them (e.g., "Increased sales by [X]%").
Provide 3-6 suggestions.`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                original: { type: "string" },
                improved: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    });
    setSuggestions(result.suggestions || []);
    setLoading(false);
  };

  const apply = (idx, text) => {
    setApplied(p => new Set([...p, idx]));
    if (onApply) onApply(text);
    toast.success("Improvement applied!");
  };

  const reject = (idx) => {
    setSuggestions(p => p.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-accent/5 to-green-500/5 ink-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">AI Resume Enhancer</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Premium</span>
        </div>
        <Textarea
          value={original}
          onChange={e => setOriginal(e.target.value)}
          placeholder="Paste your resume bullets or experience text here to improve them..."
          className="min-h-[100px] resize-none text-sm bg-background mb-3"
        />
        <Button onClick={enhance} disabled={loading}
          className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2 font-semibold text-sm">
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enhancing with AI...</>
            : <><Zap className="w-4 h-4" />Enhance Resume Text</>
          }
        </Button>
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{suggestions.length} Improvements Found</p>
            {suggestions.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`bg-card ink-border rounded-xl p-4 transition-all ${applied.has(i) ? "opacity-60" : ""}`}>
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Original</p>
                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 rounded-lg p-2.5">{s.original}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1.5">Improved</p>
                    <p className="text-xs text-foreground leading-relaxed bg-green-50 border border-green-200 rounded-lg p-2.5">{s.improved}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-accent" />{s.reason}
                  </p>
                  {!applied.has(i) ? (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => reject(i)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                        <X className="w-3.5 h-3.5" />Dismiss
                      </button>
                      <Button size="sm" onClick={() => apply(i, s.improved)}
                        className="h-7 rounded-lg text-xs bg-green-600 hover:bg-green-700 text-white gap-1">
                        <CheckCircle2 className="w-3 h-3" />Apply
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />Applied
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}