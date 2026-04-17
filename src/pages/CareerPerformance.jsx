import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingUp, Target, Zap, Award, ChevronUp, ChevronDown } from "lucide-react";

const atsHistory = [
  { month: "Oct", score: 54 },
  { month: "Nov", score: 61 },
  { month: "Dec", score: 58 },
  { month: "Jan", score: 67 },
  { month: "Feb", score: 73 },
  { month: "Mar", score: 81 },
];

const keywordGaps = [
  { keyword: "TypeScript", missing: 8, color: "#f97316" },
  { keyword: "Agile", missing: 7, color: "#f97316" },
  { keyword: "CI/CD", missing: 6, color: "#22c55e" },
  { keyword: "Kubernetes", missing: 5, color: "#f97316" },
  { keyword: "Leadership", missing: 4, color: "#22c55e" },
  { keyword: "AWS", missing: 3, color: "#f97316" },
  { keyword: "GraphQL", missing: 2, color: "#22c55e" },
];

const skillRadar = [
  { skill: "Technical", score: 72 },
  { skill: "Leadership", score: 45 },
  { skill: "Communication", score: 68 },
  { skill: "Problem Solving", score: 80 },
  { skill: "Teamwork", score: 60 },
  { skill: "Adaptability", score: 55 },
];

const recentApps = [
  { company: "Stripe", role: "Senior Engineer", score: 81, trend: "up", date: "Mar 2026" },
  { company: "Vercel", role: "Frontend Engineer", score: 73, trend: "up", date: "Feb 2026" },
  { company: "Linear", role: "Full Stack Dev", score: 67, trend: "down", date: "Jan 2026" },
  { company: "Notion", role: "Software Engineer", score: 58, trend: "down", date: "Dec 2025" },
];

const StatCard = ({ icon: Icon, label, value, sub, iconColor, bgColor }) => (
  <div className="bg-card ink-border rounded-2xl p-5 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bgColor}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
      <p className="text-2xl font-extrabold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card ink-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CareerPerformance() {
  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Decorative banner */}
        <div className="relative rounded-2xl overflow-hidden mb-8 h-36"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 30%, #16a34a 70%, #15803d 100%)"
          }}>
          {/* Blob decorations */}
          <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-orange-300/20" />
          <div className="absolute bottom-2 left-32 w-10 h-10 rounded-full bg-green-300/20" />
          <div className="relative z-10 p-7 h-full flex flex-col justify-center">
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">Career Performance</h1>
            <p className="text-white/80 text-sm">Track your ATS scores, keyword gaps, and skill-match trends over time.</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Award} label="Best ATS Score" value="81" sub="March 2026" iconColor="text-orange-500" bgColor="bg-orange-500/10" />
          <StatCard icon={TrendingUp} label="Score Growth" value="+27pts" sub="Since Oct 2025" iconColor="text-green-500" bgColor="bg-green-500/10" />
          <StatCard icon={Target} label="Applications" value="4" sub="Jobs analyzed" iconColor="text-accent" bgColor="bg-accent/10" />
          <StatCard icon={Zap} label="Top Gap" value="TypeScript" sub="Missing in 8 apps" iconColor="text-orange-500" bgColor="bg-orange-500/10" />
        </div>
      </motion.div>

      {/* ATS Score Over Time */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card ink-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-6 rounded-full bg-green-500" />
          <h2 className="text-base font-bold text-foreground">ATS Score Over Time</h2>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={atsHistory}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
            <YAxis domain={[40, 100]} tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="score" name="ATS Score" stroke="#22c55e" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: "#22c55e", r: 4 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Two-column: Keyword Gaps + Skill Radar */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Keyword Gaps */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card ink-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6 rounded-full bg-orange-500" />
            <h2 className="text-base font-bold text-foreground">Missing Keywords</h2>
          </div>
          <div className="space-y-3">
            {keywordGaps.map((kw) => (
              <div key={kw.keyword}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{kw.keyword}</span>
                  <span className="text-xs text-muted-foreground">{kw.missing} apps</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(kw.missing / 8) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: kw.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1.5" />High impact gaps
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 ml-4" />Improving
          </p>
        </motion.div>

        {/* Skill Radar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card ink-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6 rounded-full bg-accent" />
            <h2 className="text-base font-bold text-foreground">Skill Match Profile</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={skillRadar} cx="50%" cy="50%" outerRadius={80}>
              <PolarGrid stroke="hsl(214 32% 91%)" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} />
              <Radar name="You" dataKey="score" stroke="#4f8ef7" fill="#4f8ef7" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Applications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card ink-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-2 h-6 rounded-full bg-orange-500" />
          <h2 className="text-base font-bold text-foreground">Recent Applications</h2>
        </div>
        <div className="space-y-3">
          {recentApps.map((app, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                  {app.company[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{app.company}</p>
                  <p className="text-xs text-muted-foreground">{app.role} · {app.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-2xl font-extrabold ${app.score >= 70 ? "text-green-500" : "text-orange-500"}`}>
                  {app.score}
                </div>
                {app.trend === "up"
                  ? <ChevronUp className="w-4 h-4 text-green-500" />
                  : <ChevronDown className="w-4 h-4 text-orange-500" />
                }
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}