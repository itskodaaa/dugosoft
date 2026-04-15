import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { FileText, Languages, BarChart3, RefreshCw, TrendingUp, Zap, Crown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

const INSIGHTS = [
  { label: "Most used tool",       value: "AI Translator",   trend: null },
  { label: "Peak usage day",       value: "Tuesday",         trend: null },
  { label: "Translations growth",  value: "+25%",           trend: "up" },
  { label: "Resumes this month",   value: "9 built",         trend: "up" },
];

function exportCSV() {
  const rows = [
    ["Month", "Resumes", "Translations", "Conversions", "ATS Checks"],
    ...MONTHLY_DATA.map(r => [r.month, r.resumes, r.translations, r.conversions, r.ats])
  ];
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "dugosoft-analytics.csv"; a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported!");
}

const MONTHLY_DATA = [
  { month: "Oct", resumes: 2, translations: 5, conversions: 3, ats: 1 },
  { month: "Nov", resumes: 4, translations: 8, conversions: 6, ats: 3 },
  { month: "Dec", resumes: 3, translations: 6, conversions: 4, ats: 2 },
  { month: "Jan", resumes: 7, translations: 12, conversions: 9, ats: 5 },
  { month: "Feb", resumes: 5, translations: 10, conversions: 7, ats: 4 },
  { month: "Mar", resumes: 9, translations: 15, conversions: 11, ats: 6 },
];

const PIE_DATA = [
  { name: "Resumes", value: 30, color: "#4f8ef7" },
  { name: "Translations", value: 56, color: "#10b981" },
  { name: "Conversions", value: 40, color: "#f97316" },
  { name: "ATS Checks", value: 21, color: "#8b5cf6" },
];

const PLAN_LIMITS = [
  { label: "Resumes Generated", icon: FileText, used: 9, limit: 10, color: "#4f8ef7" },
  { label: "Translations", icon: Languages, used: 15, limit: 20, color: "#10b981" },
  { label: "ATS Checks", icon: BarChart3, used: 6, limit: 10, color: "#8b5cf6" },
  { label: "File Conversions", icon: RefreshCw, used: 11, limit: 15, color: "#f97316" },
];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-card ink-border rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "20" }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function LimitBar({ label, icon: Icon, used, limit, color }) {
  const pct = Math.min((used / limit) * 100, 100);
  const warn = pct >= 80;
  return (
    <div className="bg-card ink-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${warn ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"}`}>
          {used}/{limit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: warn ? "#f97316" : color }} />
      </div>
      <p className="text-xs text-muted-foreground mt-2">{limit - used} remaining this month</p>
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const plan = user?.plan || "free";

  const REAL_PLAN_LIMITS = [
    { label: "PDF Conversions", icon: RefreshCw, used: user?.pdf_count || 0, limit: plan === "free" ? 5 : plan === "pro" ? 100 : null, color: "#f97316" },
    { label: "AI Requests", icon: Zap, used: user?.ai_requests || 0, limit: plan === "free" ? 10 : plan === "pro" ? 200 : null, color: "#4f8ef7" },
    { label: "OCR Usage", icon: BarChart3, used: user?.ocr_count || 0, limit: plan === "free" ? 3 : plan === "pro" ? 50 : null, color: "#8b5cf6" },
  ];

  return (
    <FeatureGate requiredPlan="business" message="Full Analytics is available on the Business plan.">
    <div className="max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Analytics</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
              <Crown className="w-3.5 h-3.5" />
              Free Plan
            </div>
            <Button size="sm" onClick={exportCSV} variant="outline" className="rounded-full gap-1.5 text-xs h-8">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Track your monthly usage and plan limits.</p>
      </motion.div>

      {/* Insights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {INSIGHTS.map((ins, i) => (
          <div key={i} className="bg-card ink-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{ins.label}</p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold text-foreground">{ins.value}</p>
              {ins.trend === "up" && <ArrowUp className="w-3.5 h-3.5 text-green-500" />}
              {ins.trend === "down" && <ArrowDown className="w-3.5 h-3.5 text-red-500" />}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Resumes" value="9" sub="this month" color="#4f8ef7" />
        <StatCard icon={Languages} label="Translations" value="15" sub="this month" color="#10b981" />
        <StatCard icon={BarChart3} label="ATS Checks" value="6" sub="this month" color="#8b5cf6" />
        <StatCard icon={RefreshCw} label="Conversions" value="11" sub="this month" color="#f97316" />
      </div>

      {/* Plan Limits */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-4">Today's Usage</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REAL_PLAN_LIMITS.map((item, i) => (
            item.limit === null
              ? <div key={i} className="bg-card ink-border rounded-2xl p-5 flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-green-600 font-bold text-xs">Unlimited</p></div>
                </div>
              : <LimitBar key={i} {...item} />
          ))}
        </div>
        <div className="mt-4 bg-accent/5 border border-accent/20 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">Upgrade to Pro for unlimited usage</p>
              <p className="text-xs text-muted-foreground">Remove all limits and unlock premium features for $12/month</p>
            </div>
          </div>
          <button className="shrink-0 px-4 py-2 rounded-full bg-accent text-accent-foreground text-xs font-bold hover:bg-accent/90 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Area Chart */}
      <div className="bg-card ink-border rounded-2xl p-6">
        <h2 className="text-base font-bold text-foreground mb-6">Monthly Activity</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={MONTHLY_DATA}>
            <defs>
              {[["resumes","#4f8ef7"],["translations","#10b981"],["conversions","#f97316"],["ats","#8b5cf6"]].map(([key, color]) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="resumes" name="Resumes" stroke="#4f8ef7" fill="url(#grad-resumes)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="translations" name="Translations" stroke="#10b981" fill="url(#grad-translations)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="conversions" name="Conversions" stroke="#f97316" fill="url(#grad-conversions)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="ats" name="ATS Checks" stroke="#8b5cf6" fill="url(#grad-ats)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar + Pie */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card ink-border rounded-2xl p-6">
          <h2 className="text-base font-bold text-foreground mb-6">Usage by Feature (Last 6 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_DATA} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 11 }} />
              <Bar dataKey="resumes" name="Resumes" fill="#4f8ef7" radius={[4,4,0,0]} />
              <Bar dataKey="translations" name="Translations" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="conversions" name="Conversions" fill="#f97316" radius={[4,4,0,0]} />
              <Bar dataKey="ats" name="ATS Checks" fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-card ink-border rounded-2xl p-6">
          <h2 className="text-base font-bold text-foreground mb-4">All-time Breakdown</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {PIE_DATA.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-semibold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}