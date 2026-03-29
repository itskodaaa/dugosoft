import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Linkedin, Copy, CheckCircle2, ExternalLink, Sparkles, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const SHARE_MODES = [
  { id: "post", label: "LinkedIn Post", icon: User, desc: "Share as a profile post" },
  { id: "message", label: "Connection Message", icon: MessageSquare, desc: "Send to a connection" },
  { id: "headline", label: "Profile Headline", icon: Sparkles, desc: "Optimize your headline" },
];

const OPTIMIZATION_TIPS = [
  { tip: "Use action verbs at the start of each bullet point", impact: "High" },
  { tip: "Include measurable achievements with numbers & percentages", impact: "High" },
  { tip: "Add relevant LinkedIn Skills that match your experience", impact: "Medium" },
  { tip: "Keep your summary to 3-5 lines — recruiters skim fast", impact: "Medium" },
  { tip: "Use industry-specific keywords for better discoverability", impact: "High" },
  { tip: "Add a professional photo — profiles with photos get 21x more views", impact: "High" },
];

export default function LinkedInShareModal({ isOpen, onClose, content, type = "resume", metadata = {} }) {
  const [mode, setMode] = useState("post");
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("share");

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedText("");

    let prompt = "";
    if (mode === "post") {
      prompt = `Create a compelling LinkedIn post (max 250 words) for someone who just ${
        type === "resume" ? `updated their resume for a ${metadata.role || "new role"}` : `wrote a cover letter for ${metadata.jobTitle || "a position"} at ${metadata.company || "a company"}`
      }. Make it professional, engaging, and include 3-5 relevant hashtags. Do NOT use the actual resume/letter content — write a motivational career-update post. Tone: confident but humble.`;
    } else if (mode === "message") {
      prompt = `Write a short, warm LinkedIn connection message (max 100 words) for someone who is ${
        type === "resume" ? `a ${metadata.role || "professional"} looking for new opportunities` : `applying for ${metadata.jobTitle || "a role"} at ${metadata.company || "a company"}`
      }. It should feel personal, not copy-paste. Include a specific reason to connect.`;
    } else {
      prompt = `Write 3 compelling LinkedIn profile headline options (one per line) for ${
        type === "resume" ? `a ${metadata.role || "professional"} with skills: ${metadata.skills || "various skills"}` : `someone applying as ${metadata.jobTitle || "a professional"}`
      }. Format: just the 3 headlines, numbered. Max 120 chars each. Use power words and value propositions.`;
    }

    const text = await base44.integrations.Core.InvokeLLM({ prompt });
    setGeneratedText(text);
    setGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLinkedIn = () => {
    const encoded = encodeURIComponent(generatedText || "");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?text=${encoded}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-[#0A66C2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">LinkedIn Integration</h2>
              <p className="text-xs text-muted-foreground">Share & optimize for LinkedIn</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-5">
          {[{ id: "share", label: "Share Content" }, { id: "optimize", label: "Optimization Tips" }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-[#0A66C2] text-[#0A66C2]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === "share" ? (
            <>
              {/* Mode selection */}
              <div className="grid grid-cols-3 gap-3">
                {SHARE_MODES.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setMode(m.id); setGeneratedText(""); }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        mode === m.id
                          ? "border-[#0A66C2] bg-[#0A66C2]/5"
                          : "border-border hover:border-[#0A66C2]/40"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1.5 ${mode === m.id ? "text-[#0A66C2]" : "text-muted-foreground"}`} />
                      <p className={`text-xs font-semibold ${mode === m.id ? "text-[#0A66C2]" : "text-foreground"}`}>{m.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full h-11 rounded-xl gap-2 font-semibold"
                style={{ background: "#0A66C2" }}
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate {SHARE_MODES.find(m => m.id === mode)?.label}
                  </>
                )}
              </Button>

              {/* Generated result */}
              <AnimatePresence>
                {generatedText && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className="relative">
                      <Textarea
                        value={generatedText}
                        onChange={(e) => setGeneratedText(e.target.value)}
                        className="min-h-[160px] text-sm resize-none bg-background pr-4"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopy} className="rounded-full h-8 text-xs gap-1.5 flex-1">
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied!" : "Copy Text"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleOpenLinkedIn}
                        className="rounded-full h-8 text-xs gap-1.5 flex-1"
                        style={{ background: "#0A66C2" }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open LinkedIn
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Boost your LinkedIn visibility with these evidence-based tips:
              </p>
              {OPTIMIZATION_TIPS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0A66C2]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[#0A66C2]">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{item.tip}</p>
                  </div>
                  <Badge
                    className={`text-xs shrink-0 ${
                      item.impact === "High"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                        : "bg-amber-500/10 text-amber-600 border-amber-200"
                    }`}
                    variant="outline"
                  >
                    {item.impact}
                  </Badge>
                </motion.div>
              ))}

              <div className="mt-4 p-4 rounded-xl border border-[#0A66C2]/20 bg-[#0A66C2]/5">
                <p className="text-xs font-semibold text-[#0A66C2] mb-1">Pro Tip</p>
                <p className="text-xs text-muted-foreground">
                  LinkedIn profiles that are complete and updated regularly rank higher in recruiter searches. Aim for "All-Star" profile status.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}