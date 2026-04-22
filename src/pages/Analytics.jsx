import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { API_BASE } from "@/api/config";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { FileText, Zap, Crown, ScanText, Globe, File } from "lucide-react";
import { toast } from "sonner";

const PIE_COLORS = ["#4f8ef7", "#10b981", "#f97316", "#8b5cf6", "#ec4899", "#06b6d4"];

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
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${limit === null ? 100 : pct}%`, background: warn ? "#f97316" : color }} />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {limit === null ? "Unlimited on your plan" : `${Math.max(0, limit - used)} remaining this month`}
      </p>
    </div>
  );
}

const PLAN_LIMITS = {
  free:     { ai_requests: 10, file_conversions: 5,   translations: 3,  ocr_requests: 3,  pdf_processing: 5 },
  pro:      { ai_requests: 200, file_conversions: 100, translations: 50, ocr_requests: 50, pdf_processing: 100 },
  business: { ai_requests: null, file_conversions: null, translations: null, ocr_requests: null, pdf_processing: null },
};

export default function Analytics() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const plan = user?.plan || "free";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    if (!t || !user?.id) { setLoadingDocs(false); return; }
    fetch(`${API_BASE}/api/documents`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.ok ? r.json() : { documents: [] })
      .then(d => setDocuments(d.documents || []))
      .finally(() => setLoadingDocs(false));
  }, [user?.id]);

  // Build chart data: group documents by date (last 14 days)
  const now = new Date();
  const dayMap = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(5, 10); // MM-DD
    dayMap[key] = { date: key, Conversions: 0, OCR: 0, Translations: 0, AI: 0 };
  }
  for (const doc of documents) {
    const key = new Date(doc.createdAt).toISOString().slice(5, 10);
    if (!dayMap[key]) continue;
    if (doc.category === "Conversion") dayMap[key].Conversions++;
    else if (doc.category === "OCR") dayMap[key].OCR++;
    else if (doc.category === "Translation") dayMap[key].Translations++;
    else if (doc.category === "AI") dayMap[key].AI++;
  }
  const chartData = Object.values(dayMap);

  // Category breakdown for pie
  const catCounts = {};
  for (const doc of documents) {
    catCounts[doc.category] = (catCounts[doc.category] || 0) + 1;
  }
  const pieData = Object.entries(catCounts).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }));

  // Totals from real user counters (db)
  const totalAI   = user?.aiRequests || 0;
  const totalConv = user?.fileConversions || 0;
  const totalOCR  = user?.ocrRequests || 0;
  const totalTrans= user?.translations || 0;
  const totalPDF  = user?.pdfProcessing || 0;

  const exportCSV = () => {
    const rows = [["Date", "Conversions", "OCR", "Translations", "AI"],
      ...chartData.map(r => [r.date, r.Conversions, r.OCR, r.Translations, r.AI])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "dugosoft-analytics.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  return (
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
        <p className="text-muted-foreground text-sm">Your usage history and monthly limits.</p>
      </motion.div>

      {/* Monthly usage limit bars */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <LimitBar label="AI Requests"      icon={Zap}       used={totalAI}    limit={limits.ai_requests}    color="#10b981" />
        <LimitBar label="File Conversions" icon={File}      used={totalConv}  limit={limits.file_conversions} color="#4f8ef7" />
        <LimitBar label="Translations"     icon={Globe}     used={totalTrans} limit={limits.translations}   color="#f97316" />
        <LimitBar label="OCR Requests"     icon={ScanText}  used={totalOCR}   limit={limits.ocr_requests}   color="#8b5cf6" />
        <LimitBar label="PDF Processing"   icon={FileText}  used={totalPDF}   limit={limits.pdf_processing} color="#ec4899" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Zap}       label="AI Requests"   value={totalAI}    sub="this month" color="#10b981" />
        <StatCard icon={File}      label="Conversions"   value={totalConv}  sub="this month" color="#4f8ef7" />
        <StatCard icon={ScanText}  label="OCR"           value={totalOCR}   sub="this month" color="#8b5cf6" />
        <StatCard icon={Globe}     label="Translations"  value={totalTrans} sub="this month" color="#f97316" />
      </div>

      {/* Area chart */}
      <div className="bg-card ink-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-foreground">Activity — Last 14 Days</h2>
          {loadingDocs && <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              {[["Conversions","#4f8ef7"],["OCR","#8b5cf6"],["Translations","#f97316"],["AI","#10b981"]].map(([key, color]) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="Conversions" stroke="#4f8ef7" fill="url(#grad-Conversions)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="OCR"         stroke="#8b5cf6" fill="url(#grad-OCR)"         strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="Translations"stroke="#f97316" fill="url(#grad-Translations)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="AI"          stroke="#10b981" fill="url(#grad-AI)"          strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar + Pie row */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card ink-border rounded-2xl p-6">
          <h2 className="text-base font-bold text-foreground mb-6">Daily Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 11 }} />
              <Bar dataKey="Conversions" fill="#4f8ef7" radius={[4,4,0,0]} />
              <Bar dataKey="OCR"         fill="#8b5cf6" radius={[4,4,0,0]} />
              <Bar dataKey="Translations" fill="#f97316" radius={[4,4,0,0]} />
              <Bar dataKey="AI"          fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-card ink-border rounded-2xl p-6">
          <h2 className="text-base font-bold text-foreground mb-4">Document Split</h2>
          {pieData.length > 0 ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              No documents processed yet.
            </div>
          )}
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
  );
}