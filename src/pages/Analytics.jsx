import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import FeatureGate from "@/components/shared/FeatureGate";
import { base44 } from "@/api/base44Client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  FileText, Languages, BarChart3, RefreshCw as ConvIcon, Zap,
  Crown, ArrowUp, ArrowDown, ScanText
} from "lucide-react";
import { toast } from "sonner";

const PIE_COLORS = ["#4f8ef7", "#10b981", "#f97316", "#8b5cf6"];

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
  const pct = Math.min((used / (limit || 1)) * 100, 100);
  const warn = pct >= 80;
  return (
    <div className="bg-card ink-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${warn ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"}`}>
          {limit === null ? `${used} / ∞` : `${used}/${limit}`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: warn ? "#f97316" : color }} />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {limit === null ? "Unlimited on your plan" : `${limit - used} remaining today`}
      </p>
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const plan = user?.plan || "free";

  useEffect(() => {
    if (user?.id) {
      base44.entities.UsageLog.filter({ user_id: user.id })
        .then(data => {
          // Sort by date, take last 30 days
          const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
          setLogs(sorted);
        })
        .finally(() => setLoadingLogs(false));
    }
  }, [user?.id]);

  // Build chart data from logs (group by week for clarity)
  const chartData = logs.length > 0 ? logs.map(l => ({
    date: l.date.slice(5), // MM-DD
    PDFs: l.pdf_count || 0,
    "AI Requests": l.ai_requests || 0,
    OCR: l.ocr_count || 0,
    Conversions: l.conversions || 0,
  })) : [
    { date: "Today", PDFs: user?.pdf_count || 0, "AI Requests": user?.ai_requests || 0, OCR: user?.ocr_count || 0, Conversions: 0 }
  ];

  const totalPDF = logs.reduce((s, l) => s + (l.pdf_count || 0), user?.pdf_count || 0);
  const totalAI  = logs.reduce((s, l) => s + (l.ai_requests || 0), user?.ai_requests || 0);
  const totalOCR = logs.reduce((s, l) => s + (l.ocr_count || 0), user?.ocr_count || 0);

  const pieData = [
    { name: "PDFs", value: totalPDF || 1, color: "#4f8ef7" },
    { name: "AI Requests", value: totalAI || 1, color: "#10b981" },
    { name: "OCR", value: totalOCR || 1, color: "#8b5cf6" },
  ];

  const PLAN_LIMITS = {
    free:     { pdf: 5,   ai: 10,  ocr: 3 },
    pro:      { pdf: 100, ai: 200, ocr: 50 },
    business: { pdf: null, ai: null, ocr: null },
  };
  const limits = PLAN_LIMITS[plan];

  const exportCSV = () => {
    const rows = [["Date", "PDF Count", "AI Requests", "OCR Count"], ...chartData.map(r => [r.date, r.PDFs, r["AI Requests"], r.OCR])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "dugosoft-analytics.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  return (
    <FeatureGate requiredPlan="business" message="Full Analytics is available on the Business plan.">
    <div className="max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Analytics</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
              <Crown className="w-3.5 h-3.5" />
              {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
            </div>
            <Button size="sm" onClick={exportCSV} variant="outline" className="rounded-full gap-1.5 text-xs h-8">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Your usage history and daily limits.</p>
      </motion.div>

      {/* Today's usage stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <LimitBar label="PDF Conversions"  icon={FileText}  used={user?.pdf_count || 0} limit={limits.pdf}  color="#4f8ef7" />
        <LimitBar label="AI Requests"      icon={Zap}       used={user?.ai_requests || 0} limit={limits.ai} color="#10b981" />
        <LimitBar label="OCR Usage"        icon={ScanText}  used={user?.ocr_count || 0} limit={limits.ocr}  color="#8b5cf6" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard icon={FileText}  label="Total PDFs (30d)"       value={totalPDF}  sub="all time tracked" color="#4f8ef7" />
        <StatCard icon={Zap}       label="Total AI Requests (30d)"value={totalAI}   sub="all time tracked" color="#10b981" />
        <StatCard icon={ScanText}  label="Total OCR (30d)"        value={totalOCR}  sub="all time tracked" color="#8b5cf6" />
      </div>

      {/* Area chart */}
      <div className="bg-card ink-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-foreground">Usage Over Time</h2>
          {loadingLogs && <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />}
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              {[["PDFs","#4f8ef7"],["AI Requests","#10b981"],["OCR","#8b5cf6"]].map(([key, color]) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="PDFs" stroke="#4f8ef7" fill="url(#grad-PDFs)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="AI Requests" stroke="#10b981" fill="url(#grad-AI Requests)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="OCR" stroke="#8b5cf6" fill="url(#grad-OCR)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar + Pie */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card ink-border rounded-2xl p-6">
          <h2 className="text-base font-bold text-foreground mb-6">Daily Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData.slice(-14)} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 11 }} />
              <Bar dataKey="PDFs" fill="#4f8ef7" radius={[4,4,0,0]} />
              <Bar dataKey="AI Requests" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="OCR" fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-card ink-border rounded-2xl p-6">
          <h2 className="text-base font-bold text-foreground mb-4">Usage Split</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
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

      {/* Upgrade CTA */}
      {plan !== "business" && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {plan === "free" ? "Upgrade to Pro for more usage & history" : "Upgrade to Business for unlimited analytics"}
              </p>
              <p className="text-xs text-muted-foreground">Remove limits and unlock full usage history</p>
            </div>
          </div>
          <a href="/dashboard/pricing" className="shrink-0 px-4 py-2 rounded-full bg-accent text-accent-foreground text-xs font-bold hover:bg-accent/90 transition-colors">
            Upgrade Now
          </a>
        </div>
      )}
    </div>
    </FeatureGate>
  );
}