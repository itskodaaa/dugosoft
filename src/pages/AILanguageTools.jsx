import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Languages, BookOpen, Lightbulb, ShieldCheck, RefreshCw,
  Copy, Check, ArrowRight, Send, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAI } from "@/lib/useAI";
import ReactMarkdown from "react-markdown";

const TOOLS = [
  { id: "context-translate", icon: Languages,   label: "Context Translation", color: "from-blue-500 to-cyan-400",    bg: "bg-blue-50",   desc: "Context-aware translation preserving tone, idioms and intent." },
  { id: "examples",          icon: BookOpen,    label: "Sentence Examples",   color: "from-purple-500 to-violet-400", bg: "bg-purple-50", desc: "See native usage examples for any phrase or word." },
  { id: "synonyms",          icon: Lightbulb,   label: "Synonym Suggestions", color: "from-amber-500 to-yellow-400",  bg: "bg-amber-50",  desc: "Find richer alternatives and expand vocabulary." },
  { id: "grammar",           icon: ShieldCheck, label: "Grammar Correction",  color: "from-green-500 to-emerald-400", bg: "bg-green-50",  desc: "Fix grammar mistakes with explanations. Connects to Cover Letter AI." },
  { id: "paraphrase",        icon: RefreshCw,   label: "Paraphrasing Tool",   color: "from-rose-500 to-pink-400",    bg: "bg-rose-50",   desc: "Rewrite text in different tones: formal, casual, academic." },
];

const LANGS  = ["English","French","Spanish","German","Italian","Portuguese","Dutch","Russian","Chinese","Japanese","Arabic"];
const TONES  = ["Formal","Casual","Academic","Professional","Simplified"];

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

function ResultBox({ result, extraActions }) {
  const { copied, copy } = useCopy();
  if (!result) return null;
  return (
    <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm text-foreground leading-relaxed flex-1 min-w-0">
          <ReactMarkdown components={{
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            p:      ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul:     ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
            ol:     ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>,
            li:     ({ children }) => <li className="leading-relaxed">{children}</li>,
            h1:     ({ children }) => <p className="font-bold text-foreground mt-3 mb-1">{children}</p>,
            h2:     ({ children }) => <p className="font-bold text-foreground mt-3 mb-1">{children}</p>,
            h3:     ({ children }) => <p className="font-semibold text-foreground mt-2 mb-1">{children}</p>,
          }}>{result}</ReactMarkdown>
        </div>
        <button onClick={() => copy(result)} className="shrink-0 w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
      </div>
      {extraActions}
    </div>
  );
}

function ContextTranslate() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("French");
  const [result, setResult] = useState("");
  const { call, loading } = useAI();
  const navigate = useNavigate();

  const run = async () => {
    if (!text.trim()) { toast.error("Enter text to translate."); return; }
    const res = await call("generateText", {
      prompt: `You are an expert context-aware translator. Translate the following text to ${lang}.
Do NOT translate word-for-word — preserve idioms, tone, cultural context, and intent.
Format your response as:
TRANSLATION:
[the translated text]

CONTEXT NOTES:
[2-3 bullet points explaining any cultural adaptations or idiomatic changes made]

Text to translate:
${text}`,
    });
    if (res) setResult(res);
  };

  return (
    <div className="space-y-3">
      <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="Paste text to translate..."
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
      <div className="flex gap-2">
        <select value={lang} onChange={e => setLang(e.target.value)}
          className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none">
          {LANGS.map(l => <option key={l}>{l}</option>)}
        </select>
        <Button onClick={run} disabled={loading} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2 px-5">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Languages className="w-4 h-4" />Translate</>}
        </Button>
      </div>
      <ResultBox result={result} extraActions={
        <button onClick={() => navigate("/dashboard/resume-builder-v2")}
          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
          <ArrowRight className="w-3 h-3" /> Send to Resume Builder
        </button>
      } />
    </div>
  );
}

function SentenceExamples() {
  const [phrase, setPhrase] = useState("");
  const [lang, setLang] = useState("French");
  const [result, setResult] = useState("");
  const { call, loading } = useAI();

  const run = async () => {
    if (!phrase.trim()) { toast.error("Enter a phrase."); return; }
    const res = await call("generateText", {
      prompt: `Provide 5 natural, diverse sentence examples in ${lang} that use or illustrate the phrase/word: "${phrase}".
For each example, provide:
1. The ${lang} sentence
2. Its English translation in parentheses

Format as a numbered list. Keep examples varied in context (formal, casual, written, spoken).`,
    });
    if (res) setResult(res);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={phrase} onChange={e => setPhrase(e.target.value)} placeholder="Enter a word or phrase..."
          className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          onKeyDown={e => e.key === "Enter" && run()} />
        <select value={lang} onChange={e => setLang(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none">
          {LANGS.map(l => <option key={l}>{l}</option>)}
        </select>
        <Button onClick={run} disabled={loading} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-4">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
      <ResultBox result={result} />
    </div>
  );
}

function Synonyms() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState("");
  const { call, loading } = useAI();

  const run = async () => {
    if (!word.trim()) { toast.error("Enter a word."); return; }
    const res = await call("generateText", {
      prompt: `For the English word/phrase "${word}", provide:

SYNONYMS (10-15 alternatives, from common to sophisticated):
[list]

ANTONYMS (5 opposites):
[list]

USAGE CONTEXT:
[Brief note on when to use each main synonym — formal vs casual, positive vs negative connotation]

Make it suitable for professional writing and resume/cover letter improvement.`,
    });
    if (res) setResult(res);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={word} onChange={e => setWord(e.target.value)} placeholder="Enter a word (e.g. 'important', 'help')..."
          className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          onKeyDown={e => e.key === "Enter" && run()} />
        <Button onClick={run} disabled={loading} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-4">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
        </Button>
      </div>
      <ResultBox result={result} />
    </div>
  );
}

function GrammarCorrection() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const { call, loading } = useAI();
  const navigate = useNavigate();

  const run = async () => {
    if (!text.trim()) { toast.error("Enter text to check."); return; }
    const res = await call("generateText", {
      prompt: `You are a professional English grammar editor. Analyze and correct the following text.

FORMAT YOUR RESPONSE AS:

CORRECTED TEXT:
[The fully corrected version]

CHANGES MADE:
[Bullet list of each correction with explanation — grammar rule violated and fix applied]

STYLE SUGGESTIONS:
[Optional: 1-2 suggestions to improve clarity or professionalism]

Original text:
${text}`,
    });
    if (res) setResult(res);
  };

  return (
    <div className="space-y-3">
      <textarea value={text} onChange={e => setText(e.target.value)} rows={5} placeholder="Paste your text for grammar checking..."
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
      <Button onClick={run} disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : <><ShieldCheck className="w-4 h-4" /> Check Grammar</>}
      </Button>
      <ResultBox result={result} extraActions={
        <button onClick={() => navigate("/dashboard/cover-letter-architect")}
          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
          <ArrowRight className="w-3 h-3" /> Apply to Cover Letter AI
        </button>
      } />
    </div>
  );
}

function Paraphrase() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState("Professional");
  const [result, setResult] = useState("");
  const { call, loading } = useAI();

  const run = async () => {
    if (!text.trim()) { toast.error("Enter text to paraphrase."); return; }
    const res = await call("generateText", {
      prompt: `Paraphrase the following text in a ${tone.toLowerCase()} tone.

Provide 3 different paraphrased versions labeled as:
VERSION 1: [paraphrase]
VERSION 2: [paraphrase]
VERSION 3: [paraphrase]

Make each version meaningfully different. Preserve the original meaning but vary structure, vocabulary, and emphasis.

Original text:
${text}`,
    });
    if (res) setResult(res);
  };

  return (
    <div className="space-y-3">
      <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="Enter text to paraphrase..."
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
      <div className="flex gap-2">
        <div className="flex gap-1 flex-wrap flex-1">
          {TONES.map(t => (
            <button key={t} onClick={() => setTone(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${tone === t ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:border-accent/40"}`}>
              {t}
            </button>
          ))}
        </div>
        <Button onClick={run} disabled={loading} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2 px-5 shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4" />Paraphrase</>}
        </Button>
      </div>
      <ResultBox result={result} />
    </div>
  );
}

const TOOL_COMPONENTS = {
  "context-translate": ContextTranslate,
  "examples":          SentenceExamples,
  "synonyms":          Synonyms,
  "grammar":           GrammarCorrection,
  "paraphrase":        Paraphrase,
};

export default function AILanguageTools() {
  const [activeTool, setActiveTool] = useState("context-translate");
  const active = TOOLS.find(t => t.id === activeTool);
  const ActiveComponent = TOOL_COMPONENTS[activeTool];

  return (
    <div className="max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">AI Language Tools</h1>
        <p className="text-muted-foreground text-sm">Reverso-inspired AI tools: context translation, synonyms, grammar correction, and paraphrasing.</p>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          return (
            <button key={tool.id} onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${activeTool === tool.id ? "bg-accent text-accent-foreground border-accent shadow-sm" : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-accent/40"}`}>
              <Icon className="w-3.5 h-3.5" />{tool.label}
            </button>
          );
        })}
      </div>

      <motion.div key={activeTool} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl ${active.bg} flex items-center justify-center shrink-0`}>
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${active.color} flex items-center justify-center`}>
              {React.createElement(active.icon, { className: "w-3.5 h-3.5 text-white" })}
            </div>
          </div>
          <div>
            <h2 className="font-bold text-foreground">{active.label}</h2>
            <p className="text-xs text-muted-foreground">{active.desc}</p>
          </div>
        </div>
        <ActiveComponent />
      </motion.div>
    </div>
  );
}
