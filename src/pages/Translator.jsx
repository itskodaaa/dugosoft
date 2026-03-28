import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Copy, Check, ArrowRight } from "lucide-react";
import ProcessingBorder from "../components/shared/ProcessingBorder";
import { toast } from "sonner";

const TRANSLATIONS = {
  italian: "Questo è un esempio di testo tradotto dall'intelligenza artificiale. L'accuratezza della traduzione dipende dal contesto e dalla complessità del documento originale.",
  french: "Ceci est un exemple de texte traduit par l'intelligence artificielle. La précision de la traduction dépend du contexte et de la complexité du document original.",
  spanish: "Este es un ejemplo de texto traducido por inteligencia artificial. La precisión de la traducción depende del contexto y la complejidad del documento original.",
  german: "Dies ist ein Beispiel für einen KI-übersetzten Text. Die Übersetzungsgenauigkeit hängt vom Kontext und der Komplexität des Originaldokuments ab.",
  english: "This is an example of AI-translated text. Translation accuracy depends on the context and complexity of the original document.",
};

const languages = [
  { value: "english", label: "English" },
  { value: "italian", label: "Italian" },
  { value: "french", label: "French" },
  { value: "spanish", label: "Spanish" },
  { value: "german", label: "German" },
];

export default function Translator() {
  const [inputText, setInputText] = useState("");
  const [targetLang, setTargetLang] = useState("italian");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTranslate = () => {
    setProcessing(true);
    setResult("");
    setTimeout(() => {
      setResult(TRANSLATIONS[targetLang] || TRANSLATIONS.english);
      setProcessing(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Translation copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">
          Document Translator
        </h1>
        <p className="text-muted-foreground mb-8">
          Translate text between multiple languages with AI-powered accuracy.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
            Source Text
          </Label>
          <Textarea
            placeholder="Type or paste your text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[250px] bg-card ink-border resize-none mb-4"
          />

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                Translate to
              </Label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger className="ink-border bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleTranslate}
              disabled={processing}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-10 px-6 font-semibold gap-2 mt-6"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  Translate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Translation
            </Label>
            {result && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="rounded-full h-7 text-xs gap-1.5"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          <ProcessingBorder processing={processing}>
            <div className="p-6 min-h-[250px]">
              {result ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-foreground leading-relaxed"
                >
                  {result}
                </motion.p>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                  {processing ? "Translating..." : "Your translation will appear here."}
                </div>
              )}
            </div>
          </ProcessingBorder>
        </div>
      </div>
    </div>
  );
}