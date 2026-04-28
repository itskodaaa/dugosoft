import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Upload, FileText, Sparkles, Send, X, Lightbulb, List, Globe, HelpCircle,
  Zap, BookOpen, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

const SUGGESTED_PROMPTS = [
  { icon: BookOpen, label: "Summarize this document", prompt: "Please summarize this document in 3-5 clear paragraphs." },
  { icon: List, label: "Extract key insights", prompt: "What are the 5 most important insights or findings in this document?" },
  { icon: Globe, label: "Translate a section", prompt: "Translate the introduction or first section of this document into Spanish." },
  { icon: Lightbulb, label: "Explain simply", prompt: "Explain the main concepts in simple, plain language anyone can understand." },
  { icon: HelpCircle, label: "Action items", prompt: "What are the key action items, requirements, or next steps mentioned in this document?" },
  { icon: Zap, label: "Key terms & definitions", prompt: "List and define the most important technical terms or concepts in this document." },
];

export default function ChatWithDocument() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [docText, setDocText] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setUploading(true);
    setMessages([]);
    // Extract text from file via LLM
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file: f });
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: uploadResult.file_url,
        json_schema: { type: "object", properties: { text: { type: "string" } } }
      });
      const text = extracted?.output?.text || `[Document: ${f.name}]`;
      setDocText(text);
    } catch (err) {
      if (err.message.includes("upgrade")) {
        toast.error("Limit Reached: Please upgrade to Premium or Business to continue.", {
          action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/pricing" }
        });
      } else {
        toast.error("Failed to read document.");
      }
    }
    setUploading(false);
    setMessages([{
      role: "assistant",
      content: `I've read **${f.name}**. Ask me anything about it — summarize, extract insights, translate sections, or ask specific questions.`
    }]);
  };

  const sendMessage = async (msgText) => {
    const text = msgText || input.trim();
    if (!text || !docText) return;
    const userMsg = { role: "user", content: text };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-6);
      const res = await base44.functions.invoke("aiService", {
        action: "chatWithDocument",
        documentText: docText,
        question: text,
        history,
      });

      const answer = res.data?.result?.answer || res.data?.message || "Sorry, I couldn't answer that. Please try again.";
      setMessages(p => [...p, { role: "assistant", content: answer }]);
    } catch (err) {
      if (err.message.includes("upgrade")) {
        toast.error("Limit Reached: Please upgrade to continue.", {
          action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/pricing" }
        });
      } else {
        toast.error("Failed to send message.");
      }
    }
    setLoading(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <div className="max-w-6xl flex flex-col" style={{ height: 'calc(100dvh - 10rem)' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-accent" /> Chat with Document
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Upload a PDF, Word, or text file and have a conversation with its content.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/5 border border-accent/20 text-[10px] text-accent font-black uppercase tracking-widest">
           Plan: {user?.plan || "Free"}
        </div>
      </motion.div>

      <div className="flex-1 grid lg:grid-cols-5 gap-5 min-h-0">
        {/* Left: Upload + info */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Upload zone */}
          {!file ? (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-muted/30"
              }`}
            >
              <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">Drop your document here</p>
              <p className="text-xs text-muted-foreground">PDF, DOCX, TXT supported</p>
              <Button size="sm" variant="outline" className="mt-4 rounded-full">Browse Files</Button>
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.doc" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="bg-card ink-border rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                {uploading && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    <span className="text-xs text-accent">Reading document...</span>
                  </div>
                )}
                {!uploading && docText && (
                  <span className="text-xs text-green-600 font-semibold">✓ Ready to chat</span>
                )}
              </div>
              <button onClick={() => { setFile(null); setDocText(""); setMessages([]); }}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-muted">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Suggested prompts */}
          {file && !uploading && (
            <div className="bg-card ink-border rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Suggested Questions</p>
              <div className="space-y-1.5">
                {SUGGESTED_PROMPTS.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <button key={i} onClick={() => sendMessage(p.prompt)}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted/50 text-left group transition-colors">
                      <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{p.label}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <div className="lg:col-span-3 flex flex-col bg-card ink-border rounded-2xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm font-semibold text-foreground mb-1">No document loaded yet</p>
                <p className="text-xs text-muted-foreground max-w-xs">Upload a document on the left, then ask questions about its content.</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted/60 text-foreground"
                  }`}>
                    {msg.role === "assistant"
                      ? <ReactMarkdown className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{msg.content}</ReactMarkdown>
                      : msg.content
                    }
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div className="bg-muted/60 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-3 items-end">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={file ? "Ask anything about this document..." : "Upload a document to start chatting..."}
                disabled={!file || uploading}
                className="resize-none min-h-[44px] max-h-[120px] text-sm bg-background"
                rows={1}
              />
              <Button onClick={() => sendMessage()} disabled={!input.trim() || !file || uploading || loading}
                className="h-11 w-11 shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl p-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}