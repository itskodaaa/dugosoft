import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Copy, Check, Download, Type, FileUp } from "lucide-react";
import ProcessingBorder from "../components/shared/ProcessingBorder";
import FileUpload from "../components/shared/FileUpload";
import InputModeToggle from "../components/shared/InputModeToggle";
import StatusBadge from "../components/shared/StatusBadge";
import { toast } from "sonner";

const TRANSLATIONS = {
  italian: `Documento tradotto con intelligenza artificiale — Softdugo Translation Engine v1.0

Questo è un documento tradotto automaticamente dall'intelligenza artificiale. L'accuratezza della traduzione dipende dalla complessità del testo originale e dal dominio linguistico.

Paragrafo 1:
Il sistema di traduzione analizza il contesto semantico per garantire coerenza e precisione. Le frasi tecniche e i termini specializzati vengono gestiti con la massima cura.

Paragrafo 2:
La traduzione mantiene la struttura originale del documento, incluse le formattazioni di titoli, elenchi e paragrafi. Il documento è ora pronto per essere scaricato o copiato.`,

  french: `Document traduit par intelligence artificielle — Softdugo Translation Engine v1.0

Ceci est un document traduit automatiquement par l'intelligence artificielle. La précision dépend de la complexité du texte original et du domaine linguistique.

Paragraphe 1:
Le système d'analyse sémantique garantit cohérence et précision dans la traduction. Les termes techniques et spécialisés sont traités avec le plus grand soin.

Paragraphe 2:
La traduction conserve la structure originale du document, y compris les titres, listes et paragraphes. Le document est maintenant prêt à être téléchargé ou copié.`,

  spanish: `Documento traducido con inteligencia artificial — Softdugo Translation Engine v1.0

Este es un documento traducido automáticamente por inteligencia artificial. La precisión depende de la complejidad del texto original y del dominio lingüístico.

Párrafo 1:
El sistema analiza el contexto semántico para garantizar coherencia y precisión. Los términos técnicos y especializados se gestionan con el mayor cuidado.

Párrafo 2:
La traducción mantiene la estructura original del documento, incluidos títulos, listas y párrafos. El documento ya está listo para ser descargado o copiado.`,

  german: `Mit KI übersetztes Dokument — Softdugo Translation Engine v1.0

Dies ist ein automatisch von künstlicher Intelligenz übersetztes Dokument. Die Genauigkeit hängt von der Komplexität des Originaltextes und der Fachdomäne ab.

Absatz 1:
Das System analysiert den semantischen Kontext, um Konsistenz und Präzision sicherzustellen. Fachbegriffe werden mit größter Sorgfalt behandelt.

Absatz 2:
Die Übersetzung behält die ursprüngliche Dokumentstruktur bei, einschließlich Überschriften, Listen und Absätzen. Das Dokument kann jetzt heruntergeladen oder kopiert werden.`,

  english: `AI-translated document — Softdugo Translation Engine v1.0

This is a document automatically translated by artificial intelligence. Accuracy depends on the complexity of the original text and the linguistic domain.

Paragraph 1:
The system analyzes semantic context to ensure consistency and precision. Technical and specialized terms are handled with the utmost care.

Paragraph 2:
The translation preserves the original document structure, including headings, lists, and paragraphs. The document is now ready to be downloaded or copied.`,
};

const languages = [
  { value: "english", label: "🇬🇧 English" },
  { value: "italian", label: "🇮🇹 Italian" },
  { value: "french", label: "🇫🇷 French" },
  { value: "spanish", label: "🇪🇸 Spanish" },
  { value: "german", label: "🇩🇪 German" },
];

const inputModes = [
  { value: "paste", label: "Paste Text", icon: Type },
  { value: "upload", label: "Upload Document", icon: FileUp },
];

export default function Translator() {
  const [inputMode, setInputMode] = useState("paste");
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState("italian");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const canTranslate = inputMode === "paste" ? inputText.trim().length > 0 : file !== null;

  const handleTranslate = () => {
    if (!canTranslate) {
      toast.warning(inputMode === "paste" ? "Please enter some text first" : "Please upload a document first");
      return;
    }
    setStatus("processing");
    setResult("");
    setTimeout(() => {
      setResult(TRANSLATIONS[targetLang] || TRANSLATIONS.english);
      setStatus("complete");
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Translation copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModeChange = (mode) => {
    setInputMode(mode);
    setResult("");
    setStatus("idle");
  };

  return (
    <div className="max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">
          Document Translator
        </h1>
        <p className="text-muted-foreground mb-6">
          Translate text or full documents between multiple languages with AI accuracy.
        </p>
      </motion.div>

      {/* Mode toggle */}
      <div className="mb-6">
        <InputModeToggle modes={inputModes} active={inputMode} onChange={handleModeChange} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input pane */}
        <motion.div
          key={inputMode}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
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
                      accept=".pdf,.docx,.doc"
                      acceptLabel="PDF, DOCX — up to 10MB"
                      file={file}
                      onFile={setFile}
                      onRemove={() => { setFile(null); setResult(""); setStatus("idle"); }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language selector + action */}
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
                  disabled={status === "processing"}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-11 px-6 font-semibold gap-2 shrink-0"
                >
                  {status === "processing" ? (
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
          </div>
        </motion.div>

        {/* Output pane */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Translation Output
            </Label>
            <div className="flex items-center gap-2">
              {status !== "idle" && <StatusBadge status={status} />}
            </div>
          </div>

          <ProcessingBorder processing={status === "processing"}>
            <div className="p-5 min-h-[280px]">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-5">{result}</p>
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopy}
                        className="rounded-full h-8 text-xs gap-1.5"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied" : "Copy Text"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full h-8 text-xs gap-1.5"
                        onClick={() => toast.success("Download started (simulated)")}
                      >
                        <Download className="w-3 h-3" />
                        Download Translated File
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center h-[240px] text-center"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                        <Languages className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {status === "processing"
                          ? "Translating your document..."
                          : "Your translation will appear here."}
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