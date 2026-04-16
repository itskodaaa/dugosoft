import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Copy, Check, Download, Type, FileUp, ArrowRight } from "lucide-react";
import ProcessingBorder from "../components/shared/ProcessingBorder";
import FileUpload from "../components/shared/FileUpload";
import InputModeToggle from "../components/shared/InputModeToggle";
import StatusBadge from "../components/shared/StatusBadge";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAI } from "@/lib/useAI";

const LANGUAGES = [
  { value: "English",    label: "🇬🇧 English" },
  { value: "Italian",    label: "🇮🇹 Italian" },
  { value: "French",     label: "🇫🇷 French" },
  { value: "Spanish",    label: "🇪🇸 Spanish" },
  { value: "German",     label: "🇩🇪 German" },
  { value: "Portuguese", label: "🇧🇷 Portuguese" },
  { value: "Arabic",     label: "🇸🇦 Arabic" },
  { value: "Chinese",    label: "🇨🇳 Chinese" },
  { value: "Dutch",      label: "🇳🇱 Dutch" },
  { value: "Russian",    label: "🇷🇺 Russian" },
  { value: "Japanese",   label: "🇯🇵 Japanese" },
  { value: "Korean",     label: "🇰🇷 Korean" },
];

const INPUT_MODES = [
  { value: "paste",  label: "Paste Text",      icon: Type },
  { value: "upload", label: "Upload Document", icon: FileUp },
];

export default function Translator() {
  const { call, loading } = useAI();
  const [inputMode, setInputMode] = useState("paste");
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState("Italian");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const canTranslate = inputMode === "paste" ? inputText.trim().length > 10 : file !== null;

  const handleTranslate = async () => {
    if (!canTranslate) {
      toast.warning(inputMode === "paste" ? "Please enter some text to translate" : "Please upload a document first");
      return;
    }
    setStatus("processing");
    setResult("");

    const data = await call("translateText", {
      text: inputText,
      targetLanguage: targetLang,
      tone: "professional",
    });

    if (data?.translation) {
      setResult(data.translation);
      setStatus("complete");
    } else {
      setStatus("idle");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Translation copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translation-${targetLang.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">
          Document Translator
        </h1>
        <p className="text-muted-foreground mb-4 text-sm">
          Translate text or full documents between 12+ languages using real AI.
        </p>
        <div className="flex items-center gap-2 bg-accent/5 border border-accent/20 rounded-xl px-4 py-2.5 mb-4 text-xs text-accent">
          <Languages className="w-4 h-4 shrink-0" />
          <span>Powered by Gemini AI. Preserves professional tone and document structure.</span>
        </div>
      </motion.div>

      <div className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl px-4 py-3 mb-4 text-sm">
        <Languages className="w-4 h-4 text-accent shrink-0" />
        <span className="text-muted-foreground">Need context translation, synonyms, or grammar correction?</span>
        <Link to="/dashboard/ai-language" className="ml-auto text-accent font-semibold hover:underline flex items-center gap-1 shrink-0">
          AI Language Tools <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="mb-6">
        <InputModeToggle modes={INPUT_MODES} active={inputMode} onChange={(m) => { setInputMode(m); setResult(""); setStatus("idle"); }} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input */}
        <motion.div key={inputMode} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
                {inputMode === "paste" ? "Source Text" : "Upload Document"}
              </Label>
              <AnimatePresence mode="wait">
                {inputMode === "paste" ? (
                  <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Textarea
                      placeholder="Type or paste your text here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[220px] bg-card ink-border resize-none"
                    />
                    {inputText && (
                      <p className="text-xs text-muted-foreground mt-1.5 text-right">
                        {inputText.split(/\s+/).filter(Boolean).length} words
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <FileUpload
                      accept=".pdf,.docx,.doc,.txt"
                      acceptLabel="PDF, DOCX, TXT — up to 10MB"
                      file={file}
                      onFile={setFile}
                      onRemove={() => { setFile(null); setResult(""); setStatus("idle"); }}
                    />
                    {file && (
                      <p className="text-xs text-muted-foreground mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                        Note: File content extraction is coming soon. Please paste the text content directly for now.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                Translate to
              </Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="ink-border bg-card h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleTranslate}
                  disabled={loading || !canTranslate}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-11 px-6 font-semibold gap-2 shrink-0"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    : <><Languages className="w-4 h-4" /> Translate</>}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Translation Output
            </Label>
            {status !== "idle" && <StatusBadge status={status} />}
          </div>

          <ProcessingBorder processing={loading}>
            <div className="p-5 min-h-[280px]">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-5">{result}</p>
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                      <Button size="sm" variant="outline" onClick={handleCopy} className="rounded-full h-8 text-xs gap-1.5">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDownload} className="rounded-full h-8 text-xs gap-1.5">
                        <Download className="w-3 h-3" /> Download
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center justify-center h-[240px] text-center">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                        <Languages className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {loading ? "Translating with AI..." : "Your translation will appear here."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ProcessingBorder>
        </div>
      </div>
    </div>
  );
}