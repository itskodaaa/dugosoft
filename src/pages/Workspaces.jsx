import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen, Plus, Users, Shield, Edit3, Eye, MessageSquare,
  Crown, Trash2, FileText, ChevronRight, X,
  UserPlus, Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { API_BASE } from "@/api/config";

const PERMISSIONS = [
  { key: "view", label: "View", icon: Eye, color: "text-blue-500", bg: "bg-blue-100" },
  { key: "comment", label: "Comment", icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-100" },
  { key: "edit", label: "Edit", icon: Edit3, color: "text-green-500", bg: "bg-green-100" },
  { key: "admin", label: "Admin", icon: Shield, color: "text-red-500", bg: "bg-red-100" },
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
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim()) { toast.warning("Enter an email address."); return; }
    setSubmitting(true);
    try {
      await onInvite(email, role);
      onClose();
    } finally {
      setSubmitting(false);
    }
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
          <Button onClick={submit} disabled={submitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-10 gap-2">
            <UserPlus className="w-4 h-4" />{submitting ? "Sending..." : "Send Invite"}
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
  const [submitting, setSubmitting] = useState(false);
  const ICONS = ["🎯","📊","💼","🚀","📁","🔬","💡","🌍","📝","⚡"];
  const COLORS = ["#4f8ef7","#10b981","#f97316","#8b5cf6","#0ea5e9","#ef4444","#059669","#f59e0b"];

  const submit = async () => {
    if(!name.trim()){ toast.warning("Enter a name."); return; }
    setSubmitting(true);
    try {
      await onCreate({ name, color, icon });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

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
          <Button onClick={submit} disabled={submitting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-10 gap-2">
            <Plus className="w-4 h-4" />{submitting ? "Creating..." : "Create Workspace"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function AddDocumentModal({ onClose, onAdd }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    fetch(`${API_BASE}/api/documents`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setDocs(d.documents || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card ink-border rounded-2xl p-6 w-full max-w-md z-10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h3 className="font-bold text-foreground">Add Document to Workspace</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? <p className="text-center py-8 text-muted-foreground animate-pulse">Loading documents...</p> : docs.map(d => (
            <button key={d.id} onClick={() => onAdd(d.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-left">
              <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{d.type}</p>
              </div>
              <Plus className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          ))}
          {!loading && docs.length === 0 && <p className="text-center py-8 text-muted-foreground">No documents found.</p>}
        </div>
      </motion.div>
    </div>
  );
}

export default function Workspaces() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);

  const canUse = user?.plan === "business" || user?.plan === "admin";

  const fetchWorkspaces = async () => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${API_BASE}/api/workspaces`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setWorkspaces(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (id) => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${API_BASE}/api/workspaces/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setDetails(data);
    } catch (err) {
      toast.error("Failed to load workspace details.");
    }
  };

  useEffect(() => {
    if (canUse) fetchWorkspaces();
  }, [canUse]);

  useEffect(() => {
    if (selected) fetchDetails(selected.id);
  }, [selected]);

  const handleCreate = async ({ name, color, icon }) => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${API_BASE}/api/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, color, icon }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    toast.success(`Workspace "${name}" created!`);
    fetchWorkspaces();
    setSelected(data);
  };

  const handleInvite = async (email, role) => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${API_BASE}/api/workspaces/${selected.id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email, role }),
    });
    if (!res.ok) throw new Error("Failed to invite.");
    toast.success(`Invited ${email}`);
    fetchDetails(selected.id);
  };

  const removeMember = async (memberId) => {
    const token = localStorage.getItem("auth_token");
    await fetch(`${API_BASE}/api/workspaces/${selected.id}/members/${memberId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Member removed.");
    fetchDetails(selected.id);
  };

  const addDocument = async (docId) => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${API_BASE}/api/workspaces/${selected.id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ documentId: docId }),
    });
    if (res.ok) {
      toast.success("Document added to workspace.");
      setShowAddDoc(false);
      fetchDetails(selected.id);
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to add document.");
    }
  };

  if (!canUse) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card ink-border rounded-2xl p-14 text-center mt-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
          <Crown className="w-16 h-16 text-amber-400 mx-auto mb-6 drop-shadow-sm" />
          <h2 className="text-3xl font-black text-foreground mb-3 tracking-tight">Business Plan Required</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-sm leading-relaxed">Workspaces enable team collaboration, shared folders, and granular permissions. Upgrade to start collaborating.</p>
          <Button onClick={() => window.location.href = "/dashboard/pricing"} className="bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-full px-12 h-12 font-black transition-all hover:scale-105 shadow-lg shadow-amber-400/20">Upgrade Now</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-accent" />Workspaces
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5 font-medium">Manage team collaboration and shared assets.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-10 px-6 font-bold shadow-lg shadow-accent/20 gap-2">
          <Plus className="w-4 h-4" />New Workspace
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar list */}
        <div className="lg:col-span-1 space-y-2.5">
          {loading ? [1,2,3].map(i => <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-2xl" />) : workspaces.map(ws => (
            <button key={ws.id} onClick={() => setSelected(ws)}
              className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border transition-all duration-200 text-left ${selected?.id === ws.id ? "border-accent bg-accent/5 ring-1 ring-accent/20" : "border-border bg-card hover:border-accent/30 shadow-sm"}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm" style={{ background: ws.color + "15" }}>
                {ws.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate leading-tight">{ws.name}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{ws.members} members · {ws.documents} files</p>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${selected?.id === ws.id ? "text-accent translate-x-1" : "text-muted-foreground"}`} />
            </button>
          ))}
          {!loading && workspaces.length === 0 && (
            <div className="p-8 text-center bg-muted/20 rounded-3xl border-2 border-dashed">
              <Plus className="w-6 h-6 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-muted-foreground">No workspaces</p>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {selected && details ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Header Card */}
              <div className="bg-card ink-border rounded-[32px] p-8 flex items-center justify-between flex-wrap gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: details.color }} />
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner" style={{ background: details.color + "15" }}>
                    {details.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">{details.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                        <Users className="w-3 h-3" /> {details.members?.length || 0} Members
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                        <FileText className="w-3 h-3" /> {details.documents?.length || 0} Documents
                      </span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setShowInvite(true)} className="bg-foreground text-background hover:bg-foreground/90 rounded-full h-10 px-6 font-bold text-xs gap-2 shadow-xl shadow-foreground/10 transition-transform hover:scale-105 active:scale-95">
                  <UserPlus className="w-4 h-4" />Invite Member
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Members Section */}
                <div className="bg-card ink-border rounded-[32px] p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2 uppercase tracking-widest"><Users className="w-4 h-4 text-accent" />Team Members</h3>
                  </div>
                  <div className="space-y-4 flex-1">
                    {details.members?.map((m, i) => (
                      <div key={m.id} className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-muted/30 transition-all group border border-transparent hover:border-border">
                        <div className="w-10 h-10 rounded-full bg-accent/10 border-2 border-background flex items-center justify-center text-xs font-black text-accent shrink-0 shadow-sm">
                          {m.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{m.email}</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{m.status}</p>
                        </div>
                        <PermissionBadge role={m.role} />
                        {m.role !== "admin" && (
                          <button onClick={() => removeMember(m.id)}
                            className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-destructive/10 transition-all text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {details.members?.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground">No members invited yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-card ink-border rounded-[32px] p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2 uppercase tracking-widest"><FileText className="w-4 h-4 text-accent" />Shared Documents</h3>
                    <button onClick={() => setShowAddDoc(true)}
                      className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent hover:bg-accent transition-all hover:text-white shadow-sm">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3 flex-1">
                    {details.documents?.map((doc, i) => (
                      <div key={doc.id} className="flex items-center gap-3.5 p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border group">
                        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{doc.name}</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{doc.type}</p>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted shadow-sm"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <button className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted shadow-sm text-destructive"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                    {details.documents?.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FileText className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground">Add files to share with the team.</p>
                        <Button onClick={() => setShowAddDoc(true)} variant="link" className="text-xs font-black text-accent mt-1">Link a Document</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : !loading ? (
            <div className="h-[500px] bg-card ink-border rounded-[32px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed">
              <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mb-6">
                <FolderOpen className="w-10 h-10 text-accent/40" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">No workspace selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-8 font-medium">Select a workspace from the sidebar or create a new one to start collaborating.</p>
              <Button onClick={() => setShowCreate(true)} className="bg-accent text-accent-foreground rounded-full px-8 h-11 font-bold">Get Started</Button>
            </div>
          ) : (
            <div className="h-[500px] bg-card ink-border rounded-[32px] animate-pulse" />
          )}
        </div>
      </div>

      {showInvite && selected && <InviteModal workspace={selected} onClose={() => setShowInvite(false)} onInvite={handleInvite} />}
      {showCreate && <CreateWorkspaceModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {showAddDoc && <AddDocumentModal onClose={() => setShowAddDoc(false)} onAdd={addDocument} />}
    </div>
  );
}