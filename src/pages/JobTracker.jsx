import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus, X, Building2, Calendar, Link2, FileText, Mail, Sparkles,
  Bell, MoreHorizontal, ExternalLink, ChevronDown, Briefcase, Clock, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const COLUMNS = [
  { id: "saved",       label: "Saved",        color: "bg-slate-500",  light: "bg-slate-50 border-slate-200",  dot: "bg-slate-400" },
  { id: "applied",     label: "Applied",       color: "bg-blue-500",   light: "bg-blue-50 border-blue-200",    dot: "bg-blue-500" },
  { id: "interviewing",label: "Interviewing",  color: "bg-amber-500",  light: "bg-amber-50 border-amber-200",  dot: "bg-amber-500" },
  { id: "offer",       label: "Offer 🎉",      color: "bg-green-500",  light: "bg-green-50 border-green-200",  dot: "bg-green-500" },
  { id: "rejected",    label: "Rejected",      color: "bg-red-400",    light: "bg-red-50 border-red-200",      dot: "bg-red-400" },
];

const RESUME_VERSIONS = ["Senior Dev Resume", "Product Manager Resume", "General Resume"];
const COVER_LETTERS   = ["Cover Letter – Google", "Cover Letter – Startup", "Default Cover Letter"];

const INITIAL_JOBS = {
  saved:        [{ id: "j1", company: "Stripe", role: "Sr. Frontend Engineer", location: "Remote", url: "", resume: "", coverLetter: "", reminder: "", notes: "", stage: "saved" }],
  applied:      [{ id: "j2", company: "Notion", role: "Product Manager", location: "SF, CA", url: "", resume: "Senior Dev Resume", coverLetter: "Cover Letter – Google", reminder: "2026-04-10", notes: "Applied via LinkedIn.", stage: "applied" }],
  interviewing: [{ id: "j3", company: "Figma", role: "UX Engineer", location: "London, UK", url: "", resume: "General Resume", coverLetter: "", reminder: "2026-04-07", notes: "Technical round scheduled.", stage: "interviewing" }],
  offer:        [],
  rejected:     [{ id: "j4", company: "Airbnb", role: "Design Lead", location: "NY", url: "", resume: "", coverLetter: "", reminder: "", notes: "", stage: "rejected" }],
};

function genId() { return "j" + Date.now(); }

function JobCard({ job, colColor, onEdit, onAIEmail, isDragging }) {
  const col = COLUMNS.find(c => c.id === job.stage);
  return (
    <div className={`bg-card rounded-xl border border-border shadow-sm p-4 cursor-grab transition-all ${isDragging ? "shadow-xl rotate-1 scale-105" : "hover:shadow-md"}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{job.company}</p>
            <p className="text-xs text-muted-foreground truncate">{job.role}</p>
          </div>
        </div>
        <button onClick={() => onEdit(job)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted transition-colors shrink-0">
          <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {job.location && (
        <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
          <Briefcase className="w-3 h-3" />{job.location}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.resume && (
          <span className="flex items-center gap-1 text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
            <FileText className="w-2.5 h-2.5" />{job.resume.split(" ")[0]}
          </span>
        )}
        {job.coverLetter && (
          <span className="flex items-center gap-1 text-[10px] bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full font-medium">
            <Mail className="w-2.5 h-2.5" />Cover Letter
          </span>
        )}
        {job.reminder && (
          <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-medium">
            <Bell className="w-2.5 h-2.5" />{job.reminder}
          </span>
        )}
      </div>

      <Button onClick={() => onAIEmail(job)} size="sm"
        className="w-full h-7 text-[11px] rounded-lg bg-gradient-to-r from-accent/10 to-green-500/10 text-accent hover:from-accent/20 hover:to-green-500/20 border border-accent/20 font-semibold gap-1">
        <Sparkles className="w-3 h-3" />AI Follow-up Email
      </Button>
    </div>
  );
}

function JobModal({ job, onSave, onClose, onDelete }) {
  const [form, setForm] = useState(job || { company: "", role: "", location: "", url: "", resume: "", coverLetter: "", reminder: "", notes: "", stage: "saved" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-foreground">{job?.id ? "Edit Application" : "Add Application"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Company *</label>
              <Input value={form.company} onChange={e => set("company", e.target.value)} placeholder="Google" className="text-sm bg-background" /></div>
            <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Role *</label>
              <Input value={form.role} onChange={e => set("role", e.target.value)} placeholder="Software Engineer" className="text-sm bg-background" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Location</label>
              <Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Remote" className="text-sm bg-background" /></div>
            <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Job URL</label>
              <Input value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://..." className="text-sm bg-background" /></div>
          </div>

          <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Status</label>
            <select value={form.stage} onChange={e => set("stage", e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground">
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Linked Resume</label>
            <select value={form.resume} onChange={e => set("resume", e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground">
              <option value="">None</option>
              {RESUME_VERSIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Linked Cover Letter</label>
            <select value={form.coverLetter} onChange={e => set("coverLetter", e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground">
              <option value="">None</option>
              {COVER_LETTERS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Interview Reminder</label>
            <Input type="date" value={form.reminder} onChange={e => set("reminder", e.target.value)} className="text-sm bg-background" /></div>

          <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Notes</label>
            <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Add notes..." className="text-sm resize-none min-h-[80px] bg-background" /></div>
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          {job?.id && <Button variant="outline" onClick={() => onDelete(job.id)} className="text-destructive border-destructive/30 hover:bg-destructive/5 text-xs h-9 rounded-xl">Delete</Button>}
          <Button onClick={() => onSave(form)} className="flex-1 h-9 rounded-xl bg-accent hover:bg-accent/90 text-white text-xs font-bold">Save</Button>
        </div>
      </motion.div>
    </div>
  );
}

function AIEmailModal({ job, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(job?.stage || "applied");

  const generate = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a professional follow-up email for a job application.

Company: ${job.company}
Role: ${job.role}
Current Stage: ${stage}
Notes: ${job.notes || "None"}

Write a concise, professional follow-up email appropriate for the "${stage}" stage.
- If "applied": check on application status, express continued interest
- If "interviewing": thank for interview, reaffirm fit, ask about timeline
- If "offer": negotiate or express excitement

Return only the email text (Subject + body), no extra commentary.`,
    });
    setEmail(result || "");
    setLoading(false);
  };

  React.useEffect(() => { generate(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="font-bold text-foreground">AI Follow-up Email</h2>
            <span className="text-xs text-muted-foreground">— {job.company} · {job.role}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Interview Stage</label>
            <select value={stage} onChange={e => setStage(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground">
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          {loading
            ? <div className="min-h-[200px] rounded-xl bg-muted/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Drafting your email...</p>
                </div>
              </div>
            : <Textarea value={email} onChange={e => setEmail(e.target.value)}
                className="min-h-[220px] text-sm resize-none bg-background" />
          }
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <Button onClick={generate} variant="outline" className="h-9 rounded-xl text-xs gap-1">
            <RefreshCw className="w-3 h-3" />Regenerate
          </Button>
          <Button onClick={() => { navigator.clipboard.writeText(email); toast.success("Copied to clipboard!"); }}
            className="flex-1 h-9 rounded-xl bg-accent hover:bg-accent/90 text-white text-xs font-bold gap-1">
            Copy Email
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Need RefreshCw import inside AIEmailModal – it's imported at top. 

export default function JobTracker() {
  const [columns, setColumns] = useState(INITIAL_JOBS);
  const [editJob, setEditJob] = useState(null);
  const [aiJob, setAiJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const allCount = Object.values(columns).flat().length;

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

  const saveJob = (form) => {
    if (!form.company || !form.role) { toast.warning("Company and role are required."); return; }
    if (form.id) {
      // update
      setColumns(p => {
        const next = { ...p };
        // remove from all cols
        Object.keys(next).forEach(col => { next[col] = next[col].filter(j => j.id !== form.id); });
        // add to correct col
        next[form.stage] = [form, ...next[form.stage]];
        return next;
      });
    } else {
      const newJob = { ...form, id: genId() };
      setColumns(p => ({ ...p, [form.stage]: [newJob, ...p[form.stage]] }));
    }
    setShowModal(false);
    setEditJob(null);
    toast.success("Application saved!");
  };

  const deleteJob = (id) => {
    setColumns(p => {
      const next = { ...p };
      Object.keys(next).forEach(col => { next[col] = next[col].filter(j => j.id !== id); });
      return next;
    });
    setShowModal(false);
    setEditJob(null);
    toast.success("Application removed.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-accent" />Job Application Tracker
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{allCount} applications tracked · Drag cards between columns to update status.</p>
          </div>
          <Button onClick={() => { setEditJob(null); setShowModal(true); }}
            className="bg-accent hover:bg-accent/90 text-white rounded-xl h-10 font-semibold text-sm gap-2">
            <Plus className="w-4 h-4" />Add Application
          </Button>
        </div>
      </motion.div>

      {/* Kanban board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <div key={col.id} className="min-w-[240px]">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h3 className="text-sm font-bold text-foreground">{col.label}</h3>
                <span className="ml-auto text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {columns[col.id]?.length || 0}
                </span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className={`min-h-[300px] rounded-2xl p-2 border-2 transition-colors ${
                      snapshot.isDraggingOver ? `${col.light} border-current` : "border-transparent bg-muted/30"
                    }`}>
                    {columns[col.id]?.map((job, idx) => (
                      <Draggable key={job.id} draggableId={job.id} index={idx}>
                        {(prov, snap) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="mb-2.5">
                            <JobCard job={job} colColor={col.color} isDragging={snap.isDragging}
                              onEdit={(j) => { setEditJob(j); setShowModal(true); }}
                              onAIEmail={(j) => setAiJob(j)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <button onClick={() => { setEditJob({ stage: col.id }); setShowModal(true); }}
                      className="w-full py-2 rounded-xl border-2 border-dashed border-border hover:border-accent/50 text-xs text-muted-foreground hover:text-accent transition-colors flex items-center justify-center gap-1 mt-1">
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