import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Sparkles, FileText, Briefcase, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";

const SUGGESTED_QUESTIONS = [
  "How can I prepare for a technical interview at a FAANG company?",
  "What should I emphasize in my next promotion conversation?",
  "How do I negotiate a higher salary for this role?",
  "What skills should I develop to move into a leadership position?",
  "How can I improve my LinkedIn profile to attract recruiters?",
  "What are the biggest red flags in a resume I should fix?",
];

export default function CareerMentor() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `👋 Hi! I'm your **Career Mentor**. Ask me anything about interviews, promotions, salary negotiation, career transitions, or how to stand out in your job search.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [resumeContext, setResumeContext] = useState("");
  const [coverLetterContext, setCoverLetterContext] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load real resume/cover letter context from DB
  useEffect(() => {
    if (!user?.id) return;
    base44.entities.ResumeProject.list("-updated_date", 1).then(items => {
      if (items[0]?.resume_data) {
        try {
          const parsed = JSON.parse(items[0].resume_data);
          const ctx = `Latest resume: "${items[0].title}" | Role: ${parsed.targetRole || ""} | Skills: ${parsed.skills || ""}`;
          setResumeContext(ctx);
        } catch { setResumeContext(`Latest resume: "${items[0].title}"`); }
      }
    }).catch(() => {});
    base44.entities.CoverLetter.list("-created_date", 1).then(items => {
      if (items[0]) {
        const ctx = `Last cover letter: ${items[0].job_title} @ ${items[0].company} | Tone: ${items[0].tone || "Professional"}`;
        setCoverLetterContext(ctx);
      }
    }).catch(() => {});
  }, [user?.id]);

  const langName = { en: "English", it: "Italian", fr: "French", es: "Spanish", de: "German" }[lang] || "English";

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    const history = messages.slice(-8);
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    const res = await base44.functions.invoke("aiService", {
      action: "careerMentorChat",
      question: userText,
      history,
      resumeContext,
      coverLetterContext,
      language: langName,
    });

    const answer = res.data?.result?.answer || res.data?.message || "Sorry, I couldn't respond. Please try again.";
    setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl flex flex-col" style={{ height: 'calc(100dvh - 7rem)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mb-0.5 flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              Career Mentor
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">AI-powered career advisor with your personal context</p>
          </div>

          {/* Context toggle */}
          <button
            onClick={() => setShowContext(!showContext)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            View context
            <ChevronDown className={`w-3 h-3 transition-transform ${showContext ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Context panel */}
        <AnimatePresence>
          {showContext && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">Resume</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{resumeContext || "No resume saved yet. Build one in Resume Builder."}</p>
                </div>
                <div className="bg-violet-500/5 border border-violet-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-xs font-bold text-violet-500 uppercase tracking-wider">Cover Letter</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{coverLetterContext || "No cover letter saved yet."}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Suggested questions (only before first user message) */}
      {messages.length === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-left text-xs p-3 rounded-xl border border-border bg-card hover:border-accent/40 hover:bg-accent/5 transition-all text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="w-3 h-3 text-accent inline mr-1.5" />
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent text-accent-foreground rounded-tr-sm"
                  : "bg-card border border-border rounded-tl-sm text-foreground"
              }`}
            >
              {msg.role === "assistant" ? (
                <div
                  className="prose prose-sm max-w-none prose-strong:text-foreground prose-ul:my-1 prose-li:my-0.5"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(/^• (.+)$/gm, "<li>$1</li>")
                      .replace(/(<li>.*<\/li>)/gs, "<ul class='list-disc pl-4 space-y-1'>$1</ul>")
                      .replace(/\n/g, "<br/>"),
                  }}
                />
              ) : (
                msg.content
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-accent"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border border-border rounded-2xl bg-card p-3 flex gap-3 items-end">
        <Textarea
          ref={textareaRef}
          placeholder="Ask about interviews, promotions, salary, career goals..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm min-h-[44px] max-h-32"
          rows={1}
        />
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          size="icon"
          className="rounded-xl h-10 w-10 bg-accent hover:bg-accent/90 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}