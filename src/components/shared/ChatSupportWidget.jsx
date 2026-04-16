import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, ChevronDown, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_REPLIES = [
  "How do I upgrade my plan?",
  "How does the ATS Checker work?",
  "Can I translate my resume?",
  "How do I export to PDF?",
  "What's included in the free plan?",
];

const ANSWERS = {
  "how do i upgrade my plan": "Go to **Dashboard → Pricing** and choose Pro or Business. We support Flutterwave (Africa) and Stripe (global). 🚀",
  "how does the ats checker work": "Upload your resume and paste a job description. Our AI scores your match, shows missing keywords, and gives improvement tips. 🎯",
  "can i translate my resume": "Yes! Head to **Resume Translator** or **CV Vault**. We support 50+ languages and adapt the format to local norms. 🌍",
  "how do i export to pdf": "Open the **Resume Builder** or **Design Editor**, customize your resume, then click **Export PDF** in the top bar. 📄",
  "what's included in the free plan": "Free plan includes 3 resume generations/month, basic ATS checker, 1 cover letter, file sharing up to 100MB, and 500-word translation. Upgrade for unlimited access! ✨",
};

function getBotResponse(msg) {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(ANSWERS)) {
    if (lower.includes(key.split(" ")[0]) || lower.includes(key.split(" ")[1])) {
      return val;
    }
  }
  if (lower.includes("price") || lower.includes("cost") || lower.includes("plan")) {
    return "Our plans start at **free forever**. Pro is $9/month (Africa: $5), Business is $29/month (Africa: $15). See the Pricing page for full details! 💳";
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hi there! 👋 I'm Dugo, your support assistant. How can I help you today?";
  }
  return "Thanks for your message! For detailed help, please email **support@dugosoft.com** or check our documentation. I'll do my best to assist you with common questions. 😊";
}

function renderMarkdown(text) {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

export default function ChatSupportWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! 👋 I'm **Dugo**, your Dugosoft support assistant. Ask me anything about features, plans, or how to get started!" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hasNewMsg, setHasNewMsg] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
      setHasNewMsg(false);
    }
  }, [messages, open, minimized]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(p => [...p, { role: "user", text: msg }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    const reply = getBotResponse(msg);
    setTyping(false);
    setMessages(p => [...p, { role: "bot", text: reply }]);
    if (!open || minimized) setHasNewMsg(true);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => { setOpen(true); setMinimized(false); setHasNewMsg(false); }}
              className="relative w-14 h-14 bg-gradient-to-br from-accent to-blue-600 rounded-full shadow-2xl shadow-accent/40 flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              <MessageCircle className="w-6 h-6" />
              {hasNewMsg && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background animate-pulse" />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat window */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-0 right-0 w-[340px] sm:w-[380px] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
              style={{ height: minimized ? "auto" : "480px" }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-accent to-blue-600 p-4 flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">Dugo Support</p>
                  <p className="text-white/70 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online · replies instantly
                  </p>
                </div>
                <button onClick={() => setMinimized(p => !p)} className="text-white/70 hover:text-white transition-colors p-1">
                  {minimized ? <ChevronDown className="w-4 h-4 rotate-180" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!minimized && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        {m.role === "bot" && (
                          <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mr-2 mt-1 shrink-0">
                            <Bot className="w-3.5 h-3.5 text-accent" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                            m.role === "user"
                              ? "bg-accent text-accent-foreground rounded-tr-sm"
                              : "bg-card border border-border text-foreground rounded-tl-sm"
                          }`}
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }}
                        />
                      </div>
                    ))}
                    {typing && (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                          <Bot className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                          <div className="flex gap-1.5">
                            {[0, 1, 2].map(i => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Quick replies */}
                  {messages.length <= 2 && (
                    <div className="px-3 py-2 flex gap-1.5 overflow-x-auto shrink-0 border-t border-border bg-card">
                      {QUICK_REPLIES.slice(0, 3).map(q => (
                        <button key={q} onClick={() => sendMessage(q)}
                          className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-accent/30 text-accent bg-accent/5 hover:bg-accent/10 transition-colors shrink-0 font-medium">
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-3 border-t border-border bg-card flex gap-2 shrink-0">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                      placeholder="Ask anything…"
                      className="flex-1 text-sm bg-muted rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-accent border-0 text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim()}
                      className="w-9 h-9 bg-accent hover:bg-accent/90 rounded-xl flex items-center justify-center text-accent-foreground disabled:opacity-40 transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}