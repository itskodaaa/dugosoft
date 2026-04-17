import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, ChevronUp, Eye,
  Send, RefreshCw, PenLine, Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";

const TYPE_COLORS = {
  note:     "bg-blue-100 text-blue-700",
  feedback: "bg-amber-100 text-amber-700",
  action:   "bg-purple-100 text-purple-700",
};

function CommentThread({ docName }) {
  const [comments, setComments] = useState([]);
  const [text, setText]         = useState("");
  const [type, setType]         = useState("note");
  const [loading, setLoading]   = useState(true);
  const [posting, setPosting]   = useState(false);

  useEffect(() => {
    base44.entities.DocComment.filter({ doc_name: docName })
      .then(setComments)
      .finally(() => setLoading(false));
  }, [docName]);

  const post = async () => {
    if (!text.trim()) return;
    setPosting(true);
    const user = await base44.auth.me();
    const c = await base44.entities.DocComment.create({
      doc_name: docName,
      version: 1,
      author_email: user.email,
      author_name: user.full_name || user.email,
      text: text.trim(),
      type,
    });
    setComments(p => [...p, c]);
    setText("");
    setPosting(false);
  };

  return (
    <div className="mt-3 space-y-3">
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading comments...</p>
      ) : (
        <div className="space-y-2">
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No comments yet.</p>
          )}
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                {(c.author_name || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 bg-muted/40 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground">{c.author_name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[c.type]}`}>{c.type}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{new Date(c.created_date).toLocaleString()}</span>
                </div>
                <p className="text-xs text-foreground">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 items-end">
        <select value={type} onChange={e => setType(e.target.value)}
          className="h-8 text-xs rounded-lg border border-input bg-background px-2 focus:outline-none">
          <option value="note">Note</option>
          <option value="feedback">Feedback</option>
          <option value="action">Action</option>
        </select>
        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && post()}
          placeholder="Leave a comment..."
          className="flex-1 h-8 rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
        <button onClick={post} disabled={posting || !text.trim()}
          className="w-8 h-8 rounded-lg bg-accent hover:bg-accent/90 flex items-center justify-center shrink-0 disabled:opacity-50">
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
}

function ResumeRow({ resume, onComment }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card ink-border rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{resume.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Template: {resume.template_name || resume.template_id || "—"} · {resume.target_region ? `Region: ${resume.target_region}` : "No region"}
          </p>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
          resume.status === "complete" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
        }`}>{resume.status || "draft"}</span>
        <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
          {new Date(resume.updated_date || resume.created_date).toLocaleDateString()}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border px-5 py-4 space-y-3">
            <div className="flex gap-2">
              <Link to="/dashboard/resume-builder-v2">
                <Button size="sm" variant="outline" className="rounded-full h-8 text-xs gap-1">
                  <Eye className="w-3 h-3" /> Open Editor
                </Button>
              </Link>
            </div>
            <CommentThread docName={resume.title} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CoverLetterRow({ letter }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card ink-border rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
          <PenLine className="w-4 h-4 text-purple-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{letter.job_title} @ {letter.company}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {letter.applicant_name || "—"} · {letter.tone} · {letter.language}
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">Saved</span>
        <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
          {new Date(letter.created_date).toLocaleDateString()}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border px-5 py-4">
            <pre className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-inter max-h-60 overflow-auto bg-muted/30 rounded-xl p-3">
              {letter.content || "No content saved."}
            </pre>
            <CommentThread docName={`${letter.job_title}-${letter.company}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function History() {
  const { user } = useAuth();
  const [resumes,  setResumes]  = useState([]);
  const [letters,  setLetters]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.ResumeProject.list("-updated_date", 20),
      base44.entities.CoverLetter.list("-created_date", 20),
    ]).then(([r, l]) => {
      setResumes(r);
      setLetters(l);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  const isEmpty = !loading && resumes.length === 0 && letters.length === 0;

  return (
    <div className="max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">History</h1>
        <p className="text-muted-foreground text-sm">Your saved resumes and cover letters.</p>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Inbox className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">No history yet</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Build a resume or generate a cover letter — they'll appear here automatically.
          </p>
          <div className="flex gap-2 mt-2">
            <Link to="/dashboard/resume-builder-v2">
              <Button size="sm" variant="outline" className="rounded-full text-xs">Build Resume</Button>
            </Link>
            <Link to="/dashboard/cover-letter">
              <Button size="sm" variant="outline" className="rounded-full text-xs">Cover Letter</Button>
            </Link>
          </div>
        </div>
      )}

      {!loading && resumes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Resumes ({resumes.length})</h2>
          {resumes.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <ResumeRow resume={r} />
            </motion.div>
          ))}
        </div>
      )}

      {!loading && letters.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Cover Letters ({letters.length})</h2>
          {letters.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <CoverLetterRow letter={l} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}