import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  User, Globe, Briefcase, Code, Star, Link2, Plus, Trash2, Eye,
  Sparkles, Save, CheckCircle2, Copy, ExternalLink, Palette,
  Loader2
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { API_BASE } from "@/api/config";

const THEMES = [
  { id: "minimal",      label: "Minimal",      bg: "bg-white", preview: "from-gray-50 to-white" },
  { id: "gradient",     label: "Gradient",     bg: "bg-gradient-to-br from-accent to-blue-600", preview: "from-blue-500 to-purple-600" },
  { id: "dark",         label: "Dark",         bg: "bg-gray-900", preview: "from-gray-800 to-gray-900" },
  { id: "professional", label: "Professional", bg: "bg-slate-800", preview: "from-slate-700 to-slate-900" },
];

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function PortfolioBuilder() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [newSkill, setNewSkill] = useState("");
  const [newProject, setNewProject] = useState({ title: "", description: "", tech_stack: [], url: "" });
  const [newExp, setNewExp] = useState({ title: "", company: "", period: "", description: "" });
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const authHeader = () => {
    const t = localStorage.getItem("auth_token");
    return t ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  };
  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/portfolios/me`, { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        if (data.portfolio) {
          setPortfolio(data.portfolio);
          setPortfolioUrl(`${window.location.origin}/portfolio/${data.portfolio.slug}`);
        } else {
          // No portfolio yet — initialize defaults
          const slug = `user-${Math.random().toString(36).slice(2, 8)}`;
          setPortfolio({
            name: (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : ""),
            headline: "",
            bio: "",
            location: "",
            email: user?.email || "",
            linkedin_url: "",
            github_url: "",
            website_url: "",
            skills: [],
            skill_endorsements: [],
            projects: [],
            experience: [],
            theme: "minimal",
            is_public: true,
            slug,
          });
          setPortfolioUrl(`${window.location.origin}/portfolio/${slug}`);
        }
      }
    } catch {
      toast.error("Failed to load portfolio.");
    }
    setLoading(false);
  };

  const savePortfolio = async () => {
    setSaving(true);
    try {
      let res;
      if (portfolio.id) {
        res = await fetch(`${API_BASE}/api/portfolios/${portfolio.id}`, {
          method: "PUT",
          headers: authHeader(),
          body: JSON.stringify(portfolio),
        });
      } else {
        res = await fetch(`${API_BASE}/api/portfolios`, {
          method: "POST",
          headers: authHeader(),
          body: JSON.stringify(portfolio),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPortfolio(data.portfolio);
      setPortfolioUrl(`${window.location.origin}/portfolio/${data.portfolio.slug}`);
      toast.success("Portfolio saved!");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save portfolio.");
    }
    setSaving(false);
  };

  const generateBio = async () => {
    if (!portfolio.headline) { toast.warning("Add a headline first."); return; }
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/invoke`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
          action: "generateText",
          prompt: `Write a compelling 3-sentence professional bio for a portfolio page.
Name: ${portfolio.name}
Headline: ${portfolio.headline}
Skills: ${(portfolio.skills || []).join(", ") || "various"}
Keep it energetic, professional, and in first person. Under 80 words. Return only the bio text.`,
        }),
      });
      const data = await res.json();
      if (data.success) setPortfolio(p => ({ ...p, bio: data.result }));
    } catch {
      toast.error("Failed to generate bio.");
    }
    setGenerating(false);
  };

  const update = (key, value) => setPortfolio(p => ({ ...p, [key]: value }));

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const endorsement = { skill: newSkill.trim(), level: "Intermediate", endorsers: 0 };
    setPortfolio(p => ({
      ...p,
      skills: [...(p.skills || []), newSkill.trim()],
      skill_endorsements: [...(p.skill_endorsements || []), endorsement],
    }));
    setNewSkill("");
  };

  const removeSkill = (i) => {
    setPortfolio(p => ({
      ...p,
      skills: p.skills.filter((_, idx) => idx !== i),
      skill_endorsements: p.skill_endorsements.filter((_, idx) => idx !== i),
    }));
  };

  const updateEndorsement = (i, field, value) => {
    setPortfolio(p => {
      const updated = [...(p.skill_endorsements || [])];
      updated[i] = { ...updated[i], [field]: value };
      return { ...p, skill_endorsements: updated };
    });
  };

  const addProject = () => {
    if (!newProject.title.trim()) return;
    setPortfolio(p => ({ ...p, projects: [...(p.projects || []), { ...newProject }] }));
    setNewProject({ title: "", description: "", tech_stack: [], url: "" });
  };

  const removeProject = (i) => setPortfolio(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }));

  const addExp = () => {
    if (!newExp.title.trim()) return;
    setPortfolio(p => ({ ...p, experience: [...(p.experience || []), { ...newExp }] }));
    setNewExp({ title: "", company: "", period: "", description: "" });
  };

  const removeExp = (i) => setPortfolio(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));

  const copyLink = () => {
    navigator.clipboard.writeText(portfolioUrl);
    toast.success("Portfolio link copied!");
  };

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "skills", label: "Skills", icon: Star },
    { id: "projects", label: "Projects", icon: Code },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "theme", label: "Theme", icon: Palette },
  ];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Globe className="w-7 h-7 text-accent" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground">Sign in to build your portfolio</p>
          <p className="text-sm text-muted-foreground mt-1">Create a shareable public page for recruiters.</p>
        </div>
        <a href="/auth" className="px-5 py-2 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors">
          Sign In
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Globe className="w-6 h-6 text-accent" /> Portfolio Builder
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Create a shareable professional portfolio page for recruiters.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {portfolio?.id && (
            <>
              <Button variant="outline" size="sm" onClick={copyLink} className="rounded-full gap-2 text-xs">
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(portfolioUrl, "_blank")} className="rounded-full gap-2 text-xs">
                <Eye className="w-3.5 h-3.5" /> Preview
              </Button>
            </>
          )}
          <Button onClick={savePortfolio} disabled={saving} className="rounded-full gap-2 bg-accent hover:bg-accent/90 text-white text-xs">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {portfolio?.id ? "Save Changes" : "Publish Portfolio"}
          </Button>
        </div>
      </motion.div>

      {/* Portfolio URL */}
      <div className="bg-muted/40 rounded-xl px-4 py-3 flex items-center gap-3">
        <Link2 className="w-4 h-4 text-accent shrink-0" />
        <span className="text-sm text-foreground font-mono flex-1 truncate">{portfolioUrl}</span>
        <button onClick={copyLink} className="text-xs text-accent hover:underline font-semibold shrink-0">Copy</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-xl p-1 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-card ink-border rounded-2xl p-6 space-y-4">
            <SectionHeader icon={User} title="Basic Information" subtitle="How you appear to recruiters" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Full Name</label>
                <Input value={portfolio.name || ""} onChange={e => update("name", e.target.value)} placeholder="Jane Smith" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Professional Headline</label>
                <Input value={portfolio.headline || ""} onChange={e => update("headline", e.target.value)} placeholder="Senior Product Designer" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Location</label>
                <Input value={portfolio.location || ""} onChange={e => update("location", e.target.value)} placeholder="San Francisco, CA" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email</label>
                <Input value={portfolio.email || ""} onChange={e => update("email", e.target.value)} placeholder="jane@example.com" type="email" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">LinkedIn URL</label>
                <Input value={portfolio.linkedin_url || ""} onChange={e => update("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">GitHub URL</label>
                <Input value={portfolio.github_url || ""} onChange={e => update("github_url", e.target.value)} placeholder="https://github.com/..." />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Professional Bio</label>
                <Button variant="ghost" size="sm" onClick={generateBio} disabled={generating}
                  className="h-7 text-xs gap-1 text-accent hover:text-accent">
                  {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate with AI
                </Button>
              </div>
              <Textarea
                value={portfolio.bio || ""}
                onChange={e => update("bio", e.target.value)}
                placeholder="Tell recruiters what makes you unique..."
                className="min-h-[100px] resize-none bg-background text-sm"
              />
            </div>
          </motion.div>
        )}

        {/* SKILLS TAB */}
        {activeTab === "skills" && (
          <motion.div key="skills" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-card ink-border rounded-2xl p-6 space-y-4">
            <SectionHeader icon={Star} title="Skills & Endorsements" subtitle="Showcase your expertise levels" />
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSkill()}
                placeholder="Add a skill (e.g. React, Python, Leadership)"
                className="flex-1"
              />
              <Button onClick={addSkill} variant="outline" size="sm" className="gap-1.5 rounded-xl shrink-0">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {(portfolio.skill_endorsements || []).map((se, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold text-foreground flex-1">{se.skill}</span>
                  <select
                    value={se.level}
                    onChange={e => updateEndorsement(i, "level", e.target.value)}
                    className="text-xs border border-border bg-background rounded-lg px-2 py-1 text-foreground"
                  >
                    {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={se.endorsers}
                      onChange={e => updateEndorsement(i, "endorsers", parseInt(e.target.value) || 0)}
                      className="w-14 text-xs border border-border bg-background rounded-lg px-2 py-1 text-center text-foreground"
                    />
                    <span className="text-[10px] text-muted-foreground">endorsers</span>
                  </div>
                  <button onClick={() => removeSkill(i)} className="w-6 h-6 rounded-md hover:bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
              {(portfolio.skill_endorsements || []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No skills added yet. Add your first skill above.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === "projects" && (
          <motion.div key="projects" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="bg-card ink-border rounded-2xl p-6">
              <SectionHeader icon={Code} title="Add Project" subtitle="Showcase your best work" />
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} placeholder="Project title" />
                  <Input value={newProject.url} onChange={e => setNewProject(p => ({ ...p, url: e.target.value }))} placeholder="https://... (optional)" />
                </div>
                <Input
                  value={newProject.tech_stack.join(", ")}
                  onChange={e => setNewProject(p => ({ ...p, tech_stack: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                  placeholder="Tech stack (React, Node.js, PostgreSQL)"
                />
                <Textarea
                  value={newProject.description}
                  onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe what you built and your impact..."
                  className="min-h-[80px] resize-none bg-background text-sm"
                />
                <Button onClick={addProject} variant="outline" className="rounded-xl gap-2 text-xs w-full">
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </Button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {(portfolio.projects || []).map((p, i) => (
                <div key={i} className="bg-card ink-border rounded-2xl p-5 relative group">
                  <button onClick={() => removeProject(i)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-md hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                  <h3 className="font-bold text-sm text-foreground mb-1">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{p.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {(p.tech_stack || []).map((t, ti) => (
                      <span key={ti} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{t}</span>
                    ))}
                  </div>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1 text-[10px] text-accent hover:underline">
                      <ExternalLink className="w-3 h-3" /> View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === "experience" && (
          <motion.div key="experience" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="bg-card ink-border rounded-2xl p-6">
              <SectionHeader icon={Briefcase} title="Add Experience" />
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input value={newExp.title} onChange={e => setNewExp(p => ({ ...p, title: e.target.value }))} placeholder="Job Title" />
                  <Input value={newExp.company} onChange={e => setNewExp(p => ({ ...p, company: e.target.value }))} placeholder="Company Name" />
                </div>
                <Input value={newExp.period} onChange={e => setNewExp(p => ({ ...p, period: e.target.value }))} placeholder="e.g. Jan 2022 – Present" />
                <Textarea
                  value={newExp.description}
                  onChange={e => setNewExp(p => ({ ...p, description: e.target.value }))}
                  placeholder="Key responsibilities and achievements..."
                  className="min-h-[80px] resize-none bg-background text-sm"
                />
                <Button onClick={addExp} variant="outline" className="rounded-xl gap-2 text-xs w-full">
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {(portfolio.experience || []).map((e, i) => (
                <div key={i} className="bg-card ink-border rounded-2xl p-5 flex items-start gap-4 group relative">
                  <button onClick={() => removeExp(i)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-md hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <p className="font-bold text-sm text-foreground">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.company} · {e.period}</p>
                    {e.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* THEME TAB */}
        {activeTab === "theme" && (
          <motion.div key="theme" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-card ink-border rounded-2xl p-6 space-y-4">
            <SectionHeader icon={Palette} title="Portfolio Theme" subtitle="Choose how your page looks to recruiters" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {THEMES.map(t => (
                <button key={t.id} onClick={() => update("theme", t.id)}
                  className={`rounded-2xl overflow-hidden border-2 transition-all ${
                    portfolio.theme === t.id ? "border-accent shadow-lg" : "border-border hover:border-accent/40"
                  }`}>
                  <div className={`h-24 bg-gradient-to-br ${t.preview} flex items-end p-2`}>
                    {portfolio.theme === t.id && (
                      <CheckCircle2 className="w-5 h-5 text-white drop-shadow" />
                    )}
                  </div>
                  <div className="p-2 text-xs font-semibold text-center text-foreground bg-card">{t.label}</div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Public Portfolio</p>
                <p className="text-xs text-muted-foreground">Make your portfolio visible to anyone with the link</p>
              </div>
              <button
                onClick={() => update("is_public", !portfolio.is_public)}
                className={`relative w-10 h-5 rounded-full transition-colors ${portfolio.is_public ? "bg-accent" : "bg-muted"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${portfolio.is_public ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePortfolio} disabled={saving} className="rounded-full px-8 gap-2 bg-accent hover:bg-accent/90 text-white font-semibold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {portfolio?.id ? "Save Changes" : "Publish Portfolio"}
        </Button>
      </div>
    </div>
  );
}