import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, ChevronRight, ChevronLeft, CheckCircle2, Brain, Sparkles, RotateCcw, Play, Star, ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useAI } from "@/lib/useAI";

const QUESTION_TYPES = [
  { id: "behavioral",  label: "Behavioral",   color: "bg-blue-100 text-blue-700" },
  { id: "technical",   label: "Technical",    color: "bg-purple-100 text-purple-700" },
  { id: "situational", label: "Situational",  color: "bg-green-100 text-green-700" },
  { id: "culture",     label: "Culture Fit",  color: "bg-orange-100 text-orange-700" },
];

// ── Timer ─────────────────────────────────────────────────────────────────────
function Timer({ running }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) { setSecs(0); return; }
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return <span className="font-mono text-sm text-foreground">{m}:{s}</span>;
}

// ── Question Card ─────────────────────────────────────────────────────────────
function QuestionCard({ question, index, total, onNext, onPrev, isLast }) {
  const [answer, setAnswer]     = useState("");
  const [recording, setRec]     = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading]   = useState(false);
  const recRef = useRef(null);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { toast.error("Microphone not available."); return; }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    const chunks = [];
    mr.ondataavailable = e => chunks.push(e.data);
    mr.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      // Simulated voice-to-text (real would use a speech API)
      toast.info("Voice recorded! Transcription simulated.");
      setAnswer(prev => prev + (prev ? " " : "") + "[Voice response recorded — in production this would be transcribed via Web Speech API]");
    };
    mr.start();
    recRef.current = mr;
    setRec(true);
  };

  const stopRecording = () => {
    recRef.current?.stop();
    setRec(false);
  };

  const getFeedback = async () => {
    if (!answer.trim()) { toast.warning("Please write or record your answer first."); return; }
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert interview coach. Evaluate the following interview answer and provide detailed, actionable feedback.

Interview Question: ${question.question}
Question Type: ${question.type}
Candidate Answer: ${answer}

Evaluate on: clarity (how clearly ideas are communicated), tone (professional and confident), keyword usage (relevant industry terms), and structure (logical flow). Be honest but constructive.`,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number", description: "Overall score out of 100" },
            verdict: { type: "string", description: "One-sentence overall assessment" },
            clarity_score: { type: "number", description: "Clarity score 0-100" },
            tone_score: { type: "number", description: "Tone score 0-100" },
            keyword_score: { type: "number", description: "Keyword relevance score 0-100" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            missing_keywords: { type: "array", items: { type: "string" }, description: "Important keywords missing from the answer" },
            model_answer_snippet: { type: "string", description: "A brief example of how a strong answer would start" },
            tip: { type: "string" }
          }
        }
      });
      setFeedback(res);
    } catch {
      toast.error("Failed to get AI feedback.");
    }
    setLoading(false);
  };

  const typeTag = QUESTION_TYPES.find(t => t.id === question.type);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium">Question {index + 1} of {total}</span>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= index ? "bg-accent" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-accent/5 to-blue-500/5 border border-accent/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeTag?.color}`}>{typeTag?.label}</span>
          {question.difficulty && (
            <span className="text-[10px] font-medium text-muted-foreground">Difficulty: {question.difficulty}</span>
          )}
        </div>
        <p className="text-base font-semibold text-foreground leading-relaxed">{question.question}</p>
        {question.hint && (
          <p className="text-xs text-muted-foreground mt-2 italic">💡 Hint: {question.hint}</p>
        )}
      </div>

      {/* Answer area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Answer</label>
          <div className="flex items-center gap-2">
            {recording && <Timer running={recording} />}
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${recording ? "bg-red-500 text-white animate-pulse" : "bg-muted text-foreground hover:bg-muted/80"}`}>
              {recording ? <><MicOff className="w-3 h-3" />Stop</> : <><Mic className="w-3 h-3" />Record</>}
            </button>
          </div>
        </div>
        <Textarea
          placeholder="Type your answer here, or use the microphone to record your response..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          className="min-h-[120px] resize-none bg-background text-sm"
        />
      </div>

      {/* AI Feedback */}
      <div className="flex gap-2">
        <Button onClick={getFeedback} disabled={loading} variant="outline" className="gap-2 rounded-xl h-9 text-xs flex-1">
          {loading ? <div className="w-3.5 h-3.5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Get AI Feedback
        </Button>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card ink-border rounded-2xl p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">AI Feedback</p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(feedback.score / 20) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                ))}
                <span className="text-xs font-bold text-foreground ml-1">{feedback.score}/100</span>
              </div>
            </div>
            <p className="text-sm text-foreground font-medium italic">{feedback.verdict}</p>

            {/* Dimension scores */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Clarity", value: feedback.clarity_score, color: "bg-blue-500" },
                { label: "Tone", value: feedback.tone_score, color: "bg-purple-500" },
                { label: "Keywords", value: feedback.keyword_score, color: "bg-green-500" },
              ].map(dim => (
                <div key={dim.label} className="bg-muted/40 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-foreground">{dim.value}</p>
                  <div className="w-full h-1.5 bg-muted rounded-full my-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${dim.color}`} style={{ width: `${dim.value}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-semibold">{dim.label}</p>
                </div>
              ))}
            </div>

            {/* Strengths & Improvements */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1.5">Strengths</p>
                <ul className="space-y-1">
                  {feedback.strengths?.map((s, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />{s}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">Improve</p>
                <ul className="space-y-1">
                  {feedback.improvements?.map((s, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1.5"><ChevronRight className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />{s}</li>)}
                </ul>
              </div>
            </div>

            {/* Missing keywords */}
            {feedback.missing_keywords?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Keywords to Include</p>
                <div className="flex flex-wrap gap-1.5">
                  {feedback.missing_keywords.map((k, i) => (
                    <span key={i} className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Model answer snippet */}
            {feedback.model_answer_snippet && (
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 space-y-1">
                <p className="text-[10px] font-bold text-accent uppercase tracking-wider">Strong Answer Example</p>
                <p className="text-xs text-foreground leading-relaxed italic">"{feedback.model_answer_snippet}..."</p>
              </div>
            )}

            {feedback.tip && (
              <div className="bg-muted/40 rounded-xl p-3 text-xs text-muted-foreground font-medium">
                💡 {feedback.tip}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-2 pt-2">
        {index > 0 && (
          <Button variant="outline" onClick={onPrev} className="rounded-full h-9 text-xs gap-1.5">
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </Button>
        )}
        <Button onClick={onNext} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-9 text-xs gap-1.5">
          {isLast ? <><ThumbsUp className="w-3.5 h-3.5" />Finish Session</> : <>Next Question <ChevronRight className="w-3.5 h-3.5" /></>}
        </Button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InterviewPrep() {
  const { call, loading: generating } = useAI();
  const [step, setStep]           = useState("setup");
  const [jobDesc, setJobDesc]     = useState("");
  const [resume, setResume]       = useState("");
  const [jobTitle, setJobTitle]   = useState("");
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex]       = useState(0);

  const generateQuestions = async () => {
    if (!jobDesc.trim()) { toast.warning("Please paste a job description."); return; }
    const data = await call("generateInterviewQuestionsFromJD", { jobDesc, resume });
    if (!data) return;
    setJobTitle(data.job_title || "Interview");
    setQuestions(data.questions || []);
    setStep("practice");
    setQIndex(0);
  };

  const handleNext = () => {
    if (qIndex >= questions.length - 1) { setStep("done"); }
    else setQIndex(i => i + 1);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
          <Brain className="w-6 h-6 text-accent" /> AI Interview Prep
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Upload a job description and get tailored interview questions with a real-time practice mode.</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Setup */}
        {step === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-5">
            <div className="bg-card ink-border rounded-2xl p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Job Description <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                  className="min-h-[160px] resize-none bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Your Resume (optional — for more tailored questions)
                </label>
                <Textarea
                  placeholder="Paste your resume text here (optional)..."
                  value={resume}
                  onChange={e => setResume(e.target.value)}
                  className="min-h-[100px] resize-none bg-background text-sm"
                />
              </div>
            </div>

            {/* Type legend */}
            <div className="flex flex-wrap gap-2">
              {QUESTION_TYPES.map(t => (
                <span key={t.id} className={`text-xs font-semibold px-3 py-1 rounded-full ${t.color}`}>{t.label}</span>
              ))}
              <span className="text-xs text-muted-foreground self-center ml-1">question types will be generated</span>
            </div>

            <Button onClick={generateQuestions} disabled={generating}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold gap-2 text-sm">
              {generating
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating tailored questions...</>
                : <><Sparkles className="w-4 h-4" />Generate Interview Questions</>}
            </Button>
          </motion.div>
        )}

        {/* Practice mode */}
        {step === "practice" && questions.length > 0 && (
          <motion.div key="practice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-accent" />
                <p className="text-sm font-bold text-foreground">Practice Mode — {jobTitle}</p>
              </div>
              <button onClick={() => setStep("setup")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium">
                <RotateCcw className="w-3.5 h-3.5" /> Restart
              </button>
            </div>
            <div className="bg-card ink-border rounded-2xl p-6">
              <QuestionCard
                question={questions[qIndex]}
                index={qIndex}
                total={questions.length}
                onNext={handleNext}
                onPrev={() => setQIndex(i => Math.max(0, i - 1))}
                isLast={qIndex >= questions.length - 1}
              />
            </div>

            {/* All questions sidebar */}
            <div className="mt-4 bg-card ink-border rounded-2xl p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">All Questions</p>
              <div className="space-y-1.5">
                {questions.map((q, i) => {
                  const tag = QUESTION_TYPES.find(t => t.id === q.type);
                  return (
                    <button key={i} onClick={() => setQIndex(i)}
                      className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-all ${i === qIndex ? "bg-accent/10 border border-accent/20" : "hover:bg-muted"}`}>
                      <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                      <span className="truncate text-foreground flex-1">{q.question}</span>
                      <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tag?.color}`}>{tag?.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Done */}
        {step === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card ink-border rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground">Practice Session Complete!</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              You answered all {questions.length} questions. Review your AI feedback above, then practice again to improve.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => { setStep("practice"); setQIndex(0); }} className="rounded-full gap-2">
                <RotateCcw className="w-3.5 h-3.5" /> Practice Again
              </Button>
              <Button onClick={() => setStep("setup")} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full gap-2">
                <Sparkles className="w-3.5 h-3.5" /> New Session
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}