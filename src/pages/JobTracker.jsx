import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus, X, FileText, Mail, Sparkles, MoreHorizontal, Briefcase, RefreshCw,
  TrendingUp, Target, CheckCircle2, Clock, Star, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { API_BASE } from "@/api/config";

const COLUMNS = [
  { id: "saved",        label: "Saved",        emoji: "📌", gradient: "from-slate-500 to-slate-600",   light: "bg-slate-50 border-slate-200",  dot: "bg-slate-400",  textCol: "text-slate-600"  },
  { id: "applied",      label: "Applied",       emoji: "📨", gradient: "from-blue-500 to-blue-600",     light: "bg-blue-50 border-blue-200",    dot: "bg-blue-500",   textCol: "text-blue-600"   },
  { id: "interviewing", label: "Interviewing",  emoji: "🎙️", gradient: "from-violet-500 to-violet-600", light: "bg-violet-50 border-violet-200", dot: "bg-violet-500", textCol: "text-violet-600" },
  { id: "offer",        label: "Offer 🎉",      emoji: "🏆", gradient: "from-emerald-500 to-green-600", light: "bg-emerald-50 border-emerald-200",dot:"bg-emerald-500",textCol: "text-emerald-600"},
  { id: "rejected",     label: "Rejected",      emoji: "❌", gradient: "from-rose-400 to-red-500",      light: "bg-rose-50 border-rose-200",     dot: "bg-rose-400",   textCol: "text-rose-600"   },
];

const EMPTY_COLS = { saved: [], applied: [], interviewing: [], offer: [], rejected: [] };

function authH() {
  const t = localStorage.getItem("auth_token");
  return t ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

function jobsToColumns(jobs) {
  const cols = { saved: [], applied: [], interviewing: [], offer: [], rejected: [] };
  for (const j of jobs) {
    const stage = cols[j.stage] ? j.stage : "saved";
    cols[stage].push(j);
  }
  return cols;
}

function genId() { return "j" + Date.now(); }

// Company logo placeholder with gradient
function CompanyAvatar({ name, gradient }) {
  return (
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm`}>
      <span className="text-white text-xs font-black">{name?.[0]?.toUpperCase() || "?"}</span>
    </div>
  );
}

function JobCard({ job, colDef, onEdit, onAIEmail, isDragging }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 cursor-grab transition-all duration-200 ${
      isDragging ? "shadow-2xl rotate-1 scale-105 border-accent/50" : "hover:shadow-lg hover:-translate-y-0.5 border-gray-100"
    }`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <CompanyAvatar name={job.company} gradient={colDef.gradient} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{job.company}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{job.role}</p>
          </div>
        </div>
        <button onClick={() => onEdit(job)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0">
          <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {job.location && (
        <div className="flex items-center gap-1 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <p className="text-[11px] text-gray-400">{job.location}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.resume && (
          <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold border border-blue-100">
            <FileText className="w-2.5 h-2.5" />{job.resume.split(" ")[0]}
          </span>
        )}
        {job.coverLetter && (
          <span className="flex items-center gap-1 text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-semibold border border-purple-100">
            <Mail className="w-2.5 h-2.5" />Letter
          </span>
        )}
        {job.reminder && (
          <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-semibold border border-amber-100">
            <Clock className="w-2.5 h-2.5" />{job.reminder}
          </span>
        )}
      </div>

      <button onClick={() => onAIEmail(job)}
        className="w-full py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all bg-gradient-to-r from-accent/8 to-violet-500/8 text-accent border border-accent/15 hover:from-accent/15 hover:to-violet-500/15 hover:border-accent/30">
        <Sparkles className="w-3 h-3" />AI Follow-up Email
      </button>
    </div>
  );
}

function JobModal({ job, onSave, onClose, onDelete }) {
  const [form, setForm] = useState(job || { company: "", role: "", location: "", url: "", resume: "", coverLetter: "", reminder: "", notes: "", stage: "saved" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-lg">{job?.id ? "Edit Application" : "Add Application"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-bold text-gray-500 block mb-1.5">Company *</label>
              <Input value={form.company} onChange={e => set("company", e.target.value)} placeholder="Google" className="rounded-xl" /></div>
            <div><label className="text-xs font-bold text-gray-500 block mb-1.5">Role *</label>
              <Input value={form.role} onChange={e => set("role", e.target.value)} placeholder="Software Engineer" className="rounded-xl" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-bold text-gray-500 block mb-1.5">Location</label>
              <Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Remote" className="rounded-xl" /></div>
            <div><label className="text-xs font-bold text-gray-500 block mb-1.5">Job URL</label>
              <Input value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://..." className="rounded-xl" /></div>
          </div>
          <div><label className="text-xs font-bold text-gray-500 block mb-1.5">Status</label>
            <select value={form.stage} onChange={e => set("stage", e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground">
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select></div>
          <div><label className="text-xs font-bold text-gray-500 block mb-1.5">Linked Resume</label>
            <select value={form.resume} onChange={e => set("resume", e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground">
              <option value="">None</option>
              {RESUME_VERSIONS.map(r => <option key={r}>{r}</option>)}
            </select></div>
          <div><label className="text-xs font-bold text-gray-500 block mb-1.5">Linked Cover Letter</label>
            <select value={form.coverLetter} onChange={e => set("coverLetter", e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground">
              <option value="">None</option>
              {COVER_LETTERS.map(c => <option key={c}>{c}</option>)}
            </select></div>
          <div><label className="text-xs font-bold text-gray-500 block mb-1.5">Interview Reminder</label>
            <Input type="date" value={form.reminder} onChange={e => set("reminder", e.target.value)} className="rounded-xl" /></div>
          <div><label className="text-xs font-bold text-gray-500 block mb-1.5">Notes</label>
            <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Add notes..." className="resize-none min-h-[80px] rounded-xl" /></div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          {job?.id && (
            <Button variant="outline" onClick={() => onDelete(job.id)}
              className="text-rose-500 border-rose-200 hover:bg-rose-50 text-xs h-10 rounded-xl">Delete</Button>
          )}
          <Button onClick={() => onSave(form)}
            className="flex-1 h-10 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-bold">
            Save Application
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function AIEmailModal({ job, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(job?.stage || "applied");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/invoke`, {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({
          action: "invokeLLM",
          prompt: `Write a professional follow-up email for a job application.
Company: ${job.company}, Role: ${job.role}, Stage: ${stage}, Notes: ${job.notes || "None"}
Return only the email (Subject line + body), no extra commentary.`,
        }),
      });
      const data = await res.json();
      setEmail(data.result || "");
    } catch {
      toast.error("Failed to generate email.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => { generate(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-sm">AI Follow-up Email</h2>
              <p className="text-[11px] text-gray-400">{job.company} · {job.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1.5">Stage</label>
            <select value={stage} onChange={e => setStage(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
          {loading ? (
            <div className="min-h-[180px] rounded-2xl bg-gradient-to-br from-accent/5 to-violet-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Drafting your email...</p>
              </div>
            </div>
          ) : (
            <Textarea value={email} onChange={e => setEmail(e.target.value)}
              className="min-h-[220px] text-sm resize-none rounded-2xl bg-gray-50 border-gray-200" />
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <Button onClick={generate} variant="outline" className="h-10 rounded-xl text-xs gap-1.5 border-gray-200">
            <RefreshCw className="w-3 h-3" />Regenerate
          </Button>
          <Button onClick={handleCopy} className="flex-1 h-10 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-bold gap-1.5">
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Email"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function JobTracker() {
  const [columns, setColumns] = useState(EMPTY_COLS);
  const [editJob, setEditJob] = useState(null);
  const [aiJob, setAiJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/jobs`, { headers: authH() })
      .then(r => r.ok ? r.json() : { jobs: [] })
      .then(d => setColumns(jobsToColumns(d.jobs || [])))
      .catch(() => {});
  }, []);

  const allJobs = Object.values(columns).flat();
  const allCount = allJobs.length;
  const offers = columns.offer?.length || 0;
  const interviews = columns.interviewing?.length || 0;
  const applied = columns.applied?.length || 0;

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const srcCol = [...columns[source.droppableId]];
    const dstCol = source.droppableId === destination.droppableId ? srcCol : [...columns[destination.droppableId]];
    const [moved] = srcCol.splice(source.index, 1);
    const updatedMoved = { ...moved, stage: destination.droppableId };
    if (source.droppableId === destination.droppableId) {
      srcCol.splice(destination.index, 0, updatedMoved);
      setColumns(p => ({ ...p, [source.droppableId]: srcCol }));
    } else {
      dstCol.splice(destination.index, 0, updatedMoved);
      setColumns(p => ({ ...p, [source.droppableId]: srcCol, [destination.droppableId]: dstCol }));
    }
  };

  const saveJob = async (form) => {
    if (!form.company || !form.role) { toast.warning("Company and role are required."); return; }
    try {
      let saved;
      if (form.id) {
        const res = await fetch(`${API_BASE}/api/jobs/${form.id}`, {
          method: "PUT", headers: authH(),
          body: JSON.stringify({ ...form, cover_letter: form.coverLetter }),
        });
        const d = await res.json();
        saved = d.job;
      } else {
        const res = await fetch(`${API_BASE}/api/jobs`, {
          method: "POST", headers: authH(),
          body: JSON.stringify({ ...form, cover_letter: form.coverLetter }),
        });
        const d = await res.json();
        saved = d.job;
      }
      setColumns(prev => {
        const next = {};
        for (const col of Object.keys(prev)) next[col] = prev[col].filter(j => j.id !== saved.id);
        next[saved.stage] = [saved, ...next[saved.stage]];
        return next;
      });
      setShowModal(false); setEditJob(null);
      toast.success("Application saved!");
    } catch { toast.error("Failed to save."); }
  };

  const deleteJob = async (id) => {
    await fetch(`${API_BASE}/api/jobs/${id}`, { method: "DELETE", headers: authH() }).catch(() => {});
    setColumns(prev => {
      const next = {};
      for (const col of Object.keys(prev)) next[col] = prev[col].filter(j => j.id !== id);
      return next;
    });
    setShowModal(false); setEditJob(null);
    toast.success("Application removed.");
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Premium Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-primary via-primary/90 to-accent/80">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-8 left-20 w-32 h-32 rounded-full bg-accent/20 blur-xl" />
          <div className="relative flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Job Tracker</h1>
              </div>
              <p className="text-white/70 text-sm">{allCount} applications · drag cards to update status</p>
            </div>
            <Button onClick={() => { setEditJob(null); setShowModal(true); }}
              className="bg-white text-primary hover:bg-white/90 rounded-2xl h-11 font-black text-sm gap-2 shadow-lg">
              <Plus className="w-4 h-4" />Add Application
            </Button>
          </div>

          {/* Mini stats */}
          <div className="relative mt-5 grid grid-cols-3 gap-3">
            {[
              { icon: Target, label: "Applied", value: applied, color: "text-blue-300" },
              { icon: Star, label: "Interviews", value: interviews, color: "text-violet-300" },
              { icon: TrendingUp, label: "Offers", value: offers, color: "text-emerald-300" },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10">
                <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-xs text-white/60 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "480px" }}>
          {COLUMNS.map(col => (
            <div key={col.id} className="flex-1 min-w-[220px] max-w-[280px]">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${col.gradient} flex items-center justify-center text-xs shrink-0`}>
                  <span className="text-white text-[10px]">{col.emoji}</span>
                </div>
                <h3 className={`text-sm font-black ${col.textCol}`}>{col.label}</h3>
                <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {columns[col.id]?.length || 0}
                </span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className={`min-h-[320px] rounded-2xl p-2.5 border-2 transition-all duration-200 ${
                      snapshot.isDraggingOver
                        ? `${col.light} border-current shadow-inner`
                        : "border-gray-100 bg-gray-50/50"
                    }`}>
                    {columns[col.id]?.map((job, idx) => (
                      <Draggable key={job.id} draggableId={job.id} index={idx}>
                        {(prov, snap) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="mb-2.5">
                            <JobCard job={job} colDef={col} isDragging={snap.isDragging}
                              onEdit={(j) => { setEditJob(j); setShowModal(true); }}
                              onAIEmail={(j) => setAiJob(j)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <button onClick={() => { setEditJob({ stage: col.id }); setShowModal(true); }}
                      className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-accent/40 text-xs text-gray-400 hover:text-accent transition-all flex items-center justify-center gap-1.5 mt-1 font-semibold">
                      <Plus className="w-3.5 h-3.5" />Add
                    </button>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <JobModal job={editJob} onSave={saveJob} onClose={() => { setShowModal(false); setEditJob(null); }} onDelete={deleteJob} />
        )}
        {aiJob && (
          <AIEmailModal job={aiJob} onClose={() => setAiJob(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}