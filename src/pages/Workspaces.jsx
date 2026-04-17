import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen, Plus, Users, Shield, Edit3, Eye, MessageSquare,
  Crown, Trash2, FileText, ChevronRight, X,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const USER_PLAN = "business";
const canUse = USER_PLAN === "business";

const PERMISSIONS = [
  { key: "view", label: "View", icon: Eye, color: "text-blue-500", bg: "bg-blue-100" },
  { key: "comment", label: "Comment", icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-100" },
  { key: "edit", label: "Edit", icon: Edit3, color: "text-green-500", bg: "bg-green-100" },
  { key: "admin", label: "Admin", icon: Shield, color: "text-red-500", bg: "bg-red-100" },
];

const INITIAL_WORKSPACES = [
  {
    id: 1, name: "Q2 Job Applications", color: "#4f8ef7", icon: "🎯",
    members: [
      { email: "alex@company.com", role: "admin", name: "Alex Johnson" },
      { email: "sofia@team.com", role: "edit", name: "Sofia Melo" },
      { email: "james@work.com", role: "view", name: "James K." },
    ],
    documents: [
      { name: "Senior_Dev_Resume.pdf", type: "Resume", updated: "2h ago" },
      { name: "Cover_Letter_Google.pdf", type: "Cover Letter", updated: "1d ago" },
      { name: "Portfolio.pdf", type: "Document", updated: "3d ago" },
    ]
  },
  {
    id: 2, name: "Marketing Team Docs", color: "#10b981", icon: "📊",
    members: [
      { email: "nina@agency.com", role: "admin", name: "Nina Patel" },
      { email: "tom@agency.com", role: "comment", name: "Tom R." },
    ],
    documents: [
      { name: "Campaign_Brief.docx", type: "Document", updated: "5h ago" },
      { name: "Q1_Report.xlsx", type: "Spreadsheet", updated: "2d ago" },
    ]
  },
];

function PermissionBadge({ role }) {
  const p = PERMISSIONS.find(p => p.key === role) || PERMISSIONS[0];
  const Icon = p.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${p.bg} ${p.color}`}>
      <Icon className="w-3 h-3" />{p.label}
    </span>
  );
}

function InviteModal({ workspace, onClose, onInvite }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("view");
  const submit = () => {
    if (!email.trim()) { toast.warning("Enter an email address."); return; }
    onInvite(email, role);
    setEmail("");
    toast.success(`Invited ${email} as ${role}`);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card ink-border rounded-2xl p-6 w-full max-w-md z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-foreground">Invite to "{workspace.name}"</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email Address</label>
            <Input type="email" placeholder="colleague@company.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-background" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Permission Level</label>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSIONS.map(p => {
                const Icon = p.icon;
                return (
                  <button key={p.key} onClick={() => setRole(p.key)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${role === p.key ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}>
                    <div className={`w-7 h-7 rounded-lg ${p.bg} flex items-center justify-center`}>
                      <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{p.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.key === "view" ? "Read only" : p.key === "comment" ? "View + comment" : p.key === "edit" ? "Full editing" : "Full control"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <Button onClick={submit} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-10 gap-2">
            <UserPlus className="w-4 h-4" />Send Invite
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function CreateWorkspaceModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4f8ef7");
  const [icon, setIcon] = useState("🎯");
  const ICONS = ["🎯","📊","💼","🚀","📁","🔬","💡","🌍","📝","⚡"];
  const COLORS = ["#4f8ef7","#10b981","#f97316","#8b5cf6","#0ea5e9","#ef4444","#059669","#f59e0b"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card ink-border rounded-2xl p-6 w-full max-w-sm z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-foreground">New Workspace</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Name</label>
            <Input placeholder="e.g. Q3 Job Hunt" value={name} onChange={e => setName(e.target.value)} className="bg-background" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Icon</label>
            <div className="flex gap-2 flex-wrap">{ICONS.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all ${icon === ic ? "border-accent bg-accent/5" : "border-border"}`}>{ic}</button>
            ))}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Color</label>
            <div className="flex gap-2">{COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-foreground" : ""}`} style={{ background: c }} />
            ))}</div>
          </div>
          <Button onClick={() => { if(!name.trim()){ toast.warning("Enter a name."); return; } onCreate({ name, color, icon }); onClose(); }}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-10 gap-2">
            <Plus className="w-4 h-4" />Create Workspace
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState(INITIAL_WORKSPACES);
  const [selected, setSelected] = useState(workspaces[0]);
  const [showInvite, setShowInvite] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const handleInvite = (email, role) => {
    const member = { email, role, name: email.split("@")[0] };
    const updated = workspaces.map(w => w.id === selected.id ? { ...w, members: [...w.members, member] } : w);
    setWorkspaces(updated);
    setSelected(updated.find(w => w.id === selected.id));
  };

  const handleCreate = ({ name, color, icon }) => {
    const ws = { id: Date.now(), name, color, icon, members: [], documents: [] };
    setWorkspaces(p => [...p, ws]);
    setSelected(ws);
    toast.success(`Workspace "${name}" created!`);
  };

  const removeMember = (email) => {
    const updated = workspaces.map(w => w.id === selected.id ? { ...w, members: w.members.filter(m => m.email !== email) } : w);
    setWorkspaces(updated);
    setSelected(updated.find(w => w.id === selected.id));
    toast.success("Member removed.");
  };

  if (!canUse) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card ink-border rounded-2xl p-14 text-center mt-8">
          <Crown className="w-14 h-14 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-foreground mb-3">Business Plan Feature</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">Workspaces with team collaboration, shared folders, and granular permissions are available on the Business plan ($29/month).</p>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-10 font-bold">Upgrade to Business</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-accent" />Workspaces
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Collaborate with your team on documents, resumes, and projects.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-9 text-sm gap-2">
          <Plus className="w-4 h-4" />New Workspace
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar list */}
        <div className="lg:col-span-1 space-y-2">
          {workspaces.map(ws => (
            <button key={ws.id} onClick={() => setSelected(ws)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selected?.id === ws.id ? "border-accent bg-accent/5" : "border-border bg-card hover:border-accent/30"}`}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: ws.color + "20" }}>
                {ws.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{ws.name}</p>
                <p className="text-xs text-muted-foreground">{ws.members.length} members · {ws.documents.length} files</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>

        {/* Main content */}
        {selected && (
          <div className="lg:col-span-3 space-y-5">
            {/* Header */}
            <div className="bg-card ink-border rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: selected.color + "20" }}>
                  {selected.icon}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">{selected.name}</h2>
                  <p className="text-xs text-muted-foreground">{selected.members.length} members · {selected.documents.length} documents</p>
                </div>
              </div>
              <Button onClick={() => setShowInvite(true)} variant="outline" className="rounded-full h-9 text-xs gap-2">
                <UserPlus className="w-3.5 h-3.5" />Invite Member
              </Button>
            </div>

            {/* Members */}
            <div className="bg-card ink-border rounded-2xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Users className="w-4 h-4" />Team Members</h3>
              <div className="space-y-3">
                {selected.members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 group">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                      {m.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <PermissionBadge role={m.role} />
                    {m.role !== "admin" && (
                      <button onClick={() => removeMember(m.email)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10 ml-1">
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    )}
                  </div>
                ))}
                {selected.members.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No members yet. Invite someone!</p>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-card ink-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><FileText className="w-4 h-4" />Shared Documents</h3>
                <button onClick={() => toast.info("Upload functionality connects to My Documents")}
                  className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Add</button>
              </div>
              <div className="space-y-2">
                {selected.documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type} · updated {doc.updated}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      <button className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center"><Edit3 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    </div>
                  </div>
                ))}
                {selected.documents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No documents yet.</p>
                )}
              </div>
            </div>

            {/* Permission legend */}
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Permission Levels</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PERMISSIONS.map(p => {
                  const Icon = p.icon;
                  return (
                    <div key={p.key} className={`flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 ${p.bg} ${p.color} font-medium`}>
                      <Icon className="w-3.5 h-3.5" />{p.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {showInvite && selected && <InviteModal workspace={selected} onClose={() => setShowInvite(false)} onInvite={handleInvite} />}
      {showCreate && <CreateWorkspaceModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}