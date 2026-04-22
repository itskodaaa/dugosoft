import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Sparkles, FileText, Briefcase, BarChart3, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

const CONTEXT_OPTIONS = [
  { id: "resume",   label: "My Resume",        icon: FileText,  color: "text-accent bg-accent/10",          desc: "Analyze and improve your resume" },
  { id: "career",   label: "Career Data",      icon: Briefcase, color: "text-orange-500 bg-orange-500/10",  desc: "Job applications, skill gaps, goals" },
  { id: "analytics",label: "Usage Analytics",  icon: BarChart3, color: "text-purple-500 bg-purple-500/10", desc: "Your platform activity & insights" },
];

const SUGGESTIONS = [
  "Summarize my resume in 3 bullet points",
  "What skills am I missing for a Product Manager role?",
  "How can I improve my LinkedIn profile?",
  "What jobs match my current experience?",
  "Give me a career roadmap for the next 2 years",
  "What are my most-used tools on this platform?",
];

const CONTEXT_DATA = {
  resume: `User's mock resume: Alex Johnson, Senior Software Engineer. 6+ years experience. Skills: React, Node.js, TypeScript, Python, AWS, Docker. Experience at TechCorp (2022-present), StartupXYZ (2019-2022). Education: BSc Computer Science.`,
  career: `Career data: Applied to 5 jobs this month. ATS score average: 78%. Skill gaps identified: Kubernetes, Go, system design. Target roles: Staff Engineer, Engineering Manager. Saved jobs: Google SWE, Stripe Backend Engineer.`,
  analytics: `Platform analytics: 9 resumes built, 15 translations, 6 ATS checks, 11 file conversions. Most used tool: AI Translator. Peak day: Tuesday. Translations grew 25% vs last month. Free plan - 1 resume build remaining.`,
};

export default function AIAssistant() {
  const [activeContext, setActiveContext] = useState("resume");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your personal Dugosoft AI assistant. I have access to your resume, career data, and platform analytics. Ask me anything — I'll give you personalized insights!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(p => [...p, { role: "user", content: msg }]);
    setLoading(true);

    const contextLabel = CONTEXT_OPTIONS.find(c => c.id === activeContext)?.label;
    const prompt = `You are a helpful AI assistant for Dugosoft, a career & document platform. 
The user has given you access to their ${contextLabel} context:

CONTEXT:
${CONTEXT_DATA[activeContext]}

USER QUESTION: ${msg}

Respond in a friendly, concise, and actionable way. Use markdown formatting. Keep it focused and personalized based on the context above.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setMessages(p => [...p, { role: "assistant", content: response }]);
    } catch (err) {
      // The useAI hook inside InvokeLLM handles toasts, but we need to stop loading if it throws
      console.error(err);
      setMessages(p => [...p, { role: "assistant", content: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat cleared! What would you like to know?" }]);
  };

  return (
    <div className="max-w-4xl flex flex-col" style={{ height: 'calc(100dvh - 5rem)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground">AI Assistant</h1>
              <p className="text-xs text-muted-foreground">Personalized answers using your career data</p>
            </div>
          </div>
          <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
            <Trash2 className="w-3.5 h-3.5" /> Clear chat
          </button>
        </div>

        {/* Context selector */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {CONTEXT_OPTIONS.map(ctx => {
            const Icon = ctx.icon;
            return (
              <button key={ctx.id} onClick={() => setActiveContext(ctx.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${activeContext === ctx.id ? "border-accent bg-accent/10 text-accent" : "border-border bg-card text-muted-foreground hover:border-accent/40"}`}>
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${ctx.color}`}>
                  <Icon className="w-3 h-3" />
                </div>
                {ctx.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-accent text-accent-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm"}`}>
                {msg.role === "assistant" ? (
                  <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:leading-relaxed">{msg.content}</ReactMarkdown>
                ) : (
                  <p className="leading-relaxed">{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="shrink-0 mb-3">
          <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Suggested questions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-accent/10 hover:text-accent border border-border hover:border-accent/30 transition-all text-muted-foreground">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 flex gap-3 items-end bg-card border border-border rounded-2xl p-3 shadow-sm">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask me about your resume, career data, or analytics..."
          className="flex-1 min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 text-sm p-0"
          rows={1}
        />
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl w-10 h-10 p-0 shrink-0"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}