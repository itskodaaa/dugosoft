import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Bell, Shield, Palette, Monitor, Sun, Moon, Check, Globe, Download } from "lucide-react";
import { toast } from "sonner";

const ACCENT_COLORS = [
  { label: "Blue",    value: "219 100% 61%",  hex: "#4f8ef7" },
  { label: "Purple",  value: "262 80% 60%",   hex: "#8b5cf6" },
  { label: "Green",   value: "160 84% 39%",   hex: "#10b981" },
  { label: "Orange",  value: "24 95% 53%",    hex: "#f97316" },
  { label: "Pink",    value: "336 80% 58%",   hex: "#ec4899" },
  { label: "Teal",    value: "174 72% 40%",   hex: "#14b8a6" },
  { label: "Red",     value: "0 72% 51%",     hex: "#ef4444" },
  { label: "Amber",   value: "38 92% 50%",    hex: "#f59e0b" },
];

const THEMES = [
  { value: "light",  label: "Light",   icon: Sun },
  { value: "dark",   label: "Dark",    icon: Moon },
  { value: "system", label: "System",  icon: Monitor },
];

const NOTIF_OPTIONS = [
  { key: "plan_limit",   label: "Plan limit warnings",         desc: "Alert when approaching monthly usage limits" },
  { key: "task_done",    label: "Task completion alerts",      desc: "Notify when AI analysis or conversion finishes" },
  { key: "new_features", label: "New features & updates",      desc: "Be the first to know about new tools" },
  { key: "deadline",     label: "Deadline reminders",         desc: "Remind me of upcoming job application deadlines" },
];

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl ink-border bg-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-accent" />
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem("ds-theme") || "system");
  const [accent, setAccent] = useState(() => localStorage.getItem("ds-accent") || "219 100% 61%");
  const [notifs, setNotifs] = useState({ plan_limit: true, task_done: true, new_features: false, deadline: true });
  const [profile, setProfile] = useState({ name: "", email: "", website: "dugosoft.com" });

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.remove("dark");
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      prefersDark ? root.classList.add("dark") : root.classList.remove("dark");
    }
    localStorage.setItem("ds-theme", theme);
  }, [theme]);

  // Apply accent color
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--ring", accent);
    document.documentElement.style.setProperty("--sidebar-primary", accent);
    localStorage.setItem("ds-accent", accent);
  }, [accent]);

  const saveProfile = () => toast.success("Profile saved!");
  const saveNotifs = () => toast.success("Notification preferences saved!");

  const exportData = () => {
    const rows = [
      ["Setting", "Value"],
      ["Theme", theme],
      ["Accent", accent],
      ["Notifications - Plan Limit", notifs.plan_limit],
      ["Notifications - Task Done", notifs.task_done],
      ["Notifications - New Features", notifs.new_features],
      ["Notifications - Deadline", notifs.deadline],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "dugosoft-settings.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Settings exported as CSV!");
  };

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Settings</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Customize your Dugosoft workspace.</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportData} className="rounded-full gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export Settings
          </Button>
        </div>
      </motion.div>

      <div className="space-y-5 mt-6">
        {/* Profile */}
        <Section icon={User} title="Profile">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Full Name</Label>
              <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" className="bg-muted border-0" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Email</Label>
              <Input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" className="bg-muted border-0" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Website
              </Label>
              <Input value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} className="bg-muted border-0" />
            </div>
          </div>
          <Button onClick={saveProfile} size="sm" className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6">Save Profile</Button>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance">
          {/* Theme */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-foreground mb-3">Theme</p>
            <div className="flex gap-3 flex-wrap">
              {THEMES.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.value} onClick={() => setTheme(t.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${theme === t.value ? "border-accent bg-accent/10 text-accent" : "border-border bg-muted/40 text-muted-foreground hover:border-accent/40"}`}>
                    <Icon className="w-4 h-4" />
                    {t.label}
                    {theme === t.value && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Accent Color</p>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map(c => (
                <button key={c.value} onClick={() => setAccent(c.value)} title={c.label}
                  className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center ${accent === c.value ? "border-foreground scale-110 shadow-md" : "border-transparent hover:scale-105"}`}
                  style={{ background: c.hex }}>
                  {accent === c.value && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Changes apply instantly across the workspace.</p>
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications">
          <div className="space-y-4">
            {NOTIF_OPTIONS.map(opt => (
              <div key={opt.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                <button
                  onClick={() => setNotifs(p => ({ ...p, [opt.key]: !p[opt.key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifs[opt.key] ? "bg-accent" : "bg-muted"}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifs[opt.key] ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
          <Button onClick={saveNotifs} size="sm" className="mt-5 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6">Save Preferences</Button>
        </Section>

        {/* Security */}
        <Section icon={Shield} title="Security">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Current Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-muted border-0 max-w-xs" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">New Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-muted border-0 max-w-xs" />
            </div>
            <Button size="sm" onClick={() => toast.success("Password updated!")} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6">Update Password</Button>
          </div>
        </Section>
      </div>
    </div>
  );
}