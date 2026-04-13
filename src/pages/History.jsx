import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, RotateCcw, FileText, ChevronDown, ChevronUp, Eye, MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const MOCK_VERSIONS = [
  {
    id: 1,
    docName: "Senior_Dev_Resume_2026.pdf",
    versions: [
      { v: 3, date: "2026-04-10 14:32", label: "Added skills section", size: "245 KB" },
      { v: 2, date: "2026-04-08 09:15", label: "Updated work experience", size: "238 KB" },
      { v: 1, date: "2026-04-05 17:00", label: "Initial version", size: "210 KB" },
    ],
  },
  {
    id: 2,
    docName: "Cover_Letter_Google.pdf",
    versions: [
      { v: 2, date: "2026-04-09 11:20", label: "Personalized for Google role", size: "95 KB" },
      { v: 1, date: "2026-04-07 10:05", label: "Initial version", size: "88 KB" },
    ],
  },
  {
    id: 3,
    docName: "Marketing_Contract_FR.docx",
    versions: [
      { v: 1, date: "2026-03-29 16:45", label: "Translated to French", size: "188 KB" },
    ],
  },
];

const TYPE_COLORS = { note: "bg-blue-100 text-blue-700", feedback: "bg-amber-100 text-amber-700", action: "bg-purple-100 text-purple-700" };

function CommentThread({ docName, version }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [type, setType] = useState("note");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    base44.entities.DocComment.filter({ doc_name: docName, version })
      .then(setComments)
      .finally(() => setLoading(false));
  }, [docName, version]);

  const post = async () => {
    if (!text.trim()) return;
    setPosting(true);
    const user = await base44.auth.me();
    const c = await base44.entities.DocComment.create({
      doc_name: docName,
      version,
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
      {loading ? <p className="text-xs text-muted-foreground">Loading comments...</p> : (
        <div className="space-y-2">
          {comments.length === 0 && <p className="text-xs text-muted-foreground italic">No comments yet. Be the first!</p>}
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

function DocVersionGroup({ doc }) {
  const [open, setOpen] = useState(false);
  const [commentingVer, setCommentingVer] = useState(null);
  const latest = doc.versions[0];

  return (
    <div className="bg-card ink-border rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{doc.docName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {doc.versions.length} version{doc.versions.length !== 1 ? "s" : ""} · Latest: {latest.date}
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent shrink-0">v{latest.v}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border">
            {doc.versions.map((ver, i) => (
              <div key={ver.v} className={`px-5 py-4 ${i !== doc.versions.length - 1 ? "border-b border-border" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">v{ver.v}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{ver.label}</p>
                    <p className="text-xs text-muted-foreground">{ver.date} · {ver.size}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toast.info(`Previewing v${ver.v}…`)}
                      className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors" title="Preview">
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => setCommentingVer(commentingVer === ver.v ? null : ver.v)}
                      className={`w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors ${commentingVer === ver.v ? "bg-accent/10" : ""}`} title="Comments">
                      <MessageSquare className={`w-3.5 h-3.5 ${commentingVer === ver.v ? "text-accent" : "text-muted-foreground"}`} />
                    </button>
                    {i > 0 && (
                      <button onClick={() => toast.success(`Reverted to v${ver.v}`)}
                        className="w-8 h-8 rounded-lg hover:bg-accent/10 flex items-center justify-center transition-colors" title="Revert">
                        <RotateCcw className="w-3.5 h-3.5 text-accent" />
                      </button>
                    )}
                    {i === 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Current</span>}
                  </div>
                </div>
                <AnimatePresence>
                  {commentingVer === ver.v && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <CommentThread docName={doc.docName} version={ver.v} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function History() {
  return (
    <div className="max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">Version History</h1>
        <p className="text-muted-foreground text-sm">Track changes, view timestamps, revert versions, and leave comments for your team.</p>
      </motion.div>
      <div className="space-y-3">
        {MOCK_VERSIONS.map((doc, i) => (
          <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <DocVersionGroup doc={doc} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}