import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, BarChart3, Languages, Target, MessageCircle,
  Linkedin, Globe, ArrowRight, Clock, Zap, TrendingUp,
  FolderOpen, RefreshCw, Star, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_TOOLS = [
  { icon: FileText,      title: "Resume Builder",       desc: "Build ATS-optimized resumes",          path: "/dashboard/resume-builder-v2",  color: "text-accent",       bg: "bg-accent/10" },
  { icon: Target,        title: "AI Career Matcher",    desc: "Match resume to any job description",  path: "/dashboard/career-matcher",     color: "text-orange-500",   bg: "bg-orange-500/10" },
  { icon: MessageCircle, title: "Chat with Document",   desc: "Ask questions about any document",     path: "/dashboard/chat-with-document", color: "text-purple-500",   bg: "bg-purple-500/10" },
  { icon: BarChart3,     title: "ATS Checker",          desc: "Score your resume vs job posting",     path: "/dashboard/ats-checker",        color: "text-green-500",    bg: "bg-green-500/10" },
  { icon: Languages,     title: "AI Translator",        desc: "Translate documents in 12+ languages", path: "/dashboard/translator",         color: "text-blue-500",     bg: "bg-blue-500/10" },
  { icon: Globe,         title: "CV Vault",             desc: "Store multilingual CV versions",       path: "/dashboard/cv-vault",           color: "text-emerald-500",  bg: "bg-emerald-500/10" },
  { icon: Linkedin,      title: "LinkedIn Import",      desc: "Extract your LinkedIn profile",        path: "/dashboard/linkedin-import",    color: "text-blue-700",     bg: "bg-blue-700/10" },
  { icon: RefreshCw,     title: "File Converter",       desc: "Convert between any file formats",     path: "/dashboard/file-converter",     color: "text-amber-500",    bg: "bg-amber-500/10" },
];

const RECENT_ACTIVITY = [
  { type: "resume", icon: FileText,      color: "text-accent bg-accent/10",         title: "Senior Dev Resume.pdf",         action: "Continue editing",        path: "/dashboard/resume-builder-v2",  time: "2h ago" },
  { type: "match",  icon: Target,        color: "text-orange-500 bg-orange-500/10", title: "Career match — Google SWE role", action: "View results",            path: "/dashboard/career-matcher",     time: "5h ago" },
  { type: "chat",   icon: MessageCircle, color: "text-purple-500 bg-purple-500/10", title: "Contract_Agreement.pdf",         action: "Reopen chat",             path: "/dashboard/chat-with-document", time: "1d ago" },
  { type: "vault",  icon: Globe,         color: "text-emerald-500 bg-emerald-500/10", title: "CV — French version",          action: "Download PDF",            path: "/dashboard/cv-vault",           time: "2d ago" },
  { type: "file",   icon: RefreshCw,     color: "text-amber-500 bg-amber-500/10",   title: "Report.pdf → Excel",             action: "Download again",          path: "/dashboard/file-converter",     time: "3d ago" },
];

const STATS = [
  { label: "Resumes Built",        value: "3", icon: FileText,   color: "text-accent" },
  { label: "Documents Converted",  value: "12", icon: RefreshCw, color: "text-orange-500" },
  { label: "AI Matches Run",       value: "2", icon: Target,     color: "text-green-500" },
  { label: "Languages Translated", value: "4", icon: Languages,  color: "text-blue-500" },
];

export default function DashboardHome() {
  return (
    <div className="max-w-7xl space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Welcome back 👋</h1>
            <p className="text-muted-foreground text-sm mt-1">Pick up where you left off or start something new.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-700">Free Plan</span>
            <Link to="/dashboard/pricing">
              <Button size="sm" className="h-6 text-xs rounded-full px-3 bg-amber-500 hover:bg-amber-600 text-white ml-2">Upgrade</Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-card ink-border rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color.replace("text-", "bg-").replace("500","500/10").replace("accent","accent/10")}`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Continue where you left off */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />Recent Activity
          </h2>
          <Link to="/dashboard/history" className="text-xs text-accent font-semibold hover:underline">View all</Link>
        </div>
        <div className="space-y-2.5">
          {RECENT_ACTIVITY.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                className="flex items-center gap-4 p-4 bg-card ink-border rounded-xl hover:shadow-sm transition-all group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <Link to={item.path}>
                  <Button size="sm" variant="ghost"
                    className="h-8 rounded-lg text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    {item.action} <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Tools Grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-muted-foreground" />All Tools
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
                <Link to={tool.path}>
                  <div className="group p-5 rounded-2xl ink-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tool.bg}`}>
                      <Icon className={`w-5 h-5 ${tool.color}`} />
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{tool.desc}</p>
                    <div className="flex items-center gap-1 text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Upgrade banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-green-600 rounded-2xl p-6 text-white">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-extrabold text-lg mb-1">Unlock Premium Features</p>
              <p className="text-sm text-white/80">CV Vault, AI Career Matcher, Document Chat, LinkedIn Import, and more.</p>
            </div>
            <Link to="/dashboard/pricing">
              <Button className="bg-white text-primary hover:bg-white/90 font-bold rounded-full px-6 shrink-0">
                <Star className="w-4 h-4 mr-2" />Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}