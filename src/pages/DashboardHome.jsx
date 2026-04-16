import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, BarChart3, Languages, Target, MessageCircle,
  Linkedin, Globe, ArrowRight, Clock, Zap,
  FolderOpen, RefreshCw, Star, Crown, Share2,
  TrendingUp, CheckCircle2, Sparkles, Bot, Merge,
  ScanText, PenLine, Briefcase, Users, PieChart, X, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { usePlan, PLAN_LIMITS } from "@/lib/usePlan";
import { base44 } from "@/api/base44Client";

const QUICK_TOOLS = [
  { icon: FileText,      title: "Resume Builder",        desc: "Build ATS-optimized resumes",           path: "/dashboard/resume-builder-v2",   color: "text-accent",        bg: "bg-accent/10",        gradient: "from-accent to-blue-500" },
  { icon: Target,        title: "AI Career Matcher",     desc: "Match resume to any job description",   path: "/dashboard/career-matcher",      color: "text-orange-500",    bg: "bg-orange-500/10",    gradient: "from-orange-500 to-red-400" },
  { icon: MessageCircle, title: "Chat with Document",    desc: "Ask questions about any document",      path: "/dashboard/chat-with-document",  color: "text-purple-500",    bg: "bg-purple-500/10",    gradient: "from-purple-500 to-pink-400" },
  { icon: BarChart3,     title: "ATS Checker",           desc: "Score your resume vs job posting",      path: "/dashboard/ats-checker",         color: "text-green-500",     bg: "bg-green-500/10",     gradient: "from-green-500 to-emerald-400" },
  { icon: Languages,     title: "AI Translator",         desc: "Translate documents in 12+ languages",  path: "/dashboard/translator",          color: "text-blue-500",      bg: "bg-blue-500/10",      gradient: "from-blue-500 to-cyan-400" },
  { icon: Globe,         title: "CV Vault",              desc: "Store multilingual CV versions",        path: "/dashboard/cv-vault",            color: "text-emerald-500",   bg: "bg-emerald-500/10",   gradient: "from-emerald-500 to-teal-400" },
  { icon: Sparkles,      title: "Cover Letter AI",       desc: "Generate tailored cover letters",       path: "/dashboard/cover-letter-architect", color: "text-pink-500",   bg: "bg-pink-500/10",      gradient: "from-pink-500 to-rose-400" },
  { icon: RefreshCw,     title: "File Converter",        desc: "Convert between any file formats",      path: "/dashboard/file-converter",      color: "text-amber-500",     bg: "bg-amber-500/10",     gradient: "from-amber-500 to-orange-400" },
  { icon: Bot,           title: "Career Mentor",         desc: "AI-powered career coaching & advice",   path: "/dashboard/career-mentor",       color: "text-indigo-500",    bg: "bg-indigo-500/10",    gradient: "from-indigo-500 to-blue-400" },
  { icon: TrendingUp,    title: "LinkedIn Optimizer",    desc: "Optimize your LinkedIn profile with AI",path: "/dashboard/linkedin-optimizer",  color: "text-sky-500",       bg: "bg-sky-500/10",       gradient: "from-sky-500 to-blue-400" },
  { icon: ScanText,      title: "OCR & Extract",         desc: "Extract text from scanned documents",   path: "/dashboard/ocr-tools",           color: "text-violet-500",    bg: "bg-violet-500/10",    gradient: "from-violet-500 to-purple-400" },
  { icon: Briefcase,     title: "Job Tracker",           desc: "Track your job applications",           path: "/dashboard/job-tracker",         color: "text-teal-500",      bg: "bg-teal-500/10",      gradient: "from-teal-500 to-cyan-400" },
  { icon: BarChart3,     title: "Skill Gap Analysis",    desc: "Find & bridge skill gaps with courses", path: "/dashboard/skill-gap",           color: "text-purple-500",    bg: "bg-purple-500/10",    gradient: "from-purple-500 to-accent" },
  { icon: Brain,         title: "Interview Prep",        desc: "AI-powered interview practice",         path: "/dashboard/interview-prep",      color: "text-rose-500",      bg: "bg-rose-500/10",      gradient: "from-rose-500 to-pink-400" },
];

const RECENT_ACTIVITY = [
  { icon: FileText,      color: "text-accent bg-accent/10",            title: "Senior Dev Resume.pdf",          action: "Continue editing",   path: "/dashboard/resume-builder-v2",   time: "2h ago",  status: "In Progress" },
  { icon: Target,        color: "text-orange-500 bg-orange-500/10",    title: "Career match — Google SWE role",  action: "View results",       path: "/dashboard/career-matcher",      time: "5h ago",  status: "Completed" },
  { icon: MessageCircle, color: "text-purple-500 bg-purple-500/10",    title: "Contract_Agreement.pdf",          action: "Reopen chat",        path: "/dashboard/chat-with-document",  time: "1d ago",  status: "Saved" },
  { icon: Globe,         color: "text-emerald-500 bg-emerald-500/10",  title: "CV — French version",             action: "Download PDF",       path: "/dashboard/cv-vault",            time: "2d ago",  status: "Ready" },
  { icon: RefreshCw,     color: "text-amber-500 bg-amber-500/10",      title: "Report.pdf → Excel",              action: "Download again",     path: "/dashboard/file-converter",      time: "3d ago",  status: "Done" },
];

const STATS = [
  { label: "Resumes Built",        value: "3",  icon: FileText,   color: "text-accent",        bg: "bg-accent/10",        trend: "+1 this week" },
  { label: "Files Converted",      value: "12", icon: RefreshCw,  color: "text-orange-500",    bg: "bg-orange-500/10",    trend: "+4 this week" },
  { label: "AI Matches Run",       value: "2",  icon: Target,     color: "text-green-500",     bg: "bg-green-500/10",     trend: "Last: 92%" },
  { label: "Languages Translated", value: "4",  icon: Languages,  color: "text-blue-500",      bg: "bg-blue-500/10",      trend: "5 languages" },
];

function ShareToolModal({ tool, onClose }) {
  const url = `${window.location.origin}${tool.path}`;
  const text = encodeURIComponent(`Check out ${tool.title} on Dugosoft! dugosoft.com`);
  const encodedUrl = encodeURIComponent(url);

  const actions = [
    { label: "LinkedIn",  color: "bg-[#0A66C2] hover:bg-[#0A66C2]/90", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "WhatsApp",  color: "bg-[#25D366] hover:bg-[#25D366]/90",  href: `https://wa.me/?text=${text.replace(/Softdugo/g,'Dugosoft')}%20${encodedUrl}` },
    { label: "Telegram",  color: "bg-[#26A5E4] hover:bg-[#26A5E4]/90",  href: `https://t.me/share/url?url=${encodedUrl}&text=${text}` },
    { label: "Email",     color: "bg-muted hover:bg-muted/80 text-foreground border", href: `mailto:?subject=Check this out&body=${text}%20${encodedUrl}` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
        className="bg-card rounded-2xl shadow-2xl border border-border p-6 w-80 mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Share {tool.title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {actions.map(a => (
            <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-center h-10 rounded-xl text-xs font-bold text-white transition-all ${a.color}`}>
              {a.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
          <span className="text-xs text-muted-foreground truncate flex-1">{url}</span>
          <button onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied!"); }}
            className="text-xs font-bold text-accent shrink-0 hover:underline">Copy</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const { plan, limits } = usePlan();
  const [shareTarget, setShareTarget] = useState(null);
  const [recentResumes, setRecentResumes] = useState([]);
  const [recentLetters, setRecentLetters] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.ResumeProject.list("-updated_date", 3).then(setRecentResumes).catch(() => {});
    base44.entities.CoverLetter.list("-created_date", 2).then(setRecentLetters).catch(() => {});
  }, [user?.id]);

  const planLabel = { free: "Free Plan", pro: "Pro Plan", business: "Business" }[plan] || "Free Plan";
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const initial = (user?.full_name || user?.email || "U")[0].toUpperCase();

  // Real stats from user entity
  const realStats = [
    { label: "AI Requests Today", value: user?.ai_requests || 0, icon: Zap, color: "text-accent", bg: "bg-accent/10",
      trend: `${limits?.ai_requests === Infinity ? "∞" : limits?.ai_requests || 10} limit` },
    { label: "PDFs Processed", value: user?.pdf_count || 0, icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10",
      trend: `${limits?.pdf_count === Infinity ? "∞" : limits?.pdf_count || 5} limit` },
    { label: "OCR Requests", value: user?.ocr_count || 0, icon: ScanText, color: "text-purple-500", bg: "bg-purple-500/10",
      trend: `${limits?.ocr_count === Infinity ? "∞" : limits?.ocr_count || 3} limit` },
    { label: "Resumes Saved", value: recentResumes.length, icon: FileText, color: "text-green-500", bg: "bg-green-500/10",
      trend: "in your library" },
  ];

  // Build recent activity from real DB records
  const recentActivity = [
    ...recentResumes.map(r => ({
      icon: FileText, color: "text-accent bg-accent/10",
      title: r.title || "Untitled Resume",
      action: "Continue editing", path: "/dashboard/resume-builder-v2",
      time: new Date(r.updated_date || r.created_date).toLocaleDateString(),
      status: r.status === "complete" ? "Complete" : "Draft",
    })),
    ...recentLetters.map(r => ({
      icon: PenLine, color: "text-purple-500 bg-purple-500/10",
      title: `${r.job_title} @ ${r.company}`,
      action: "View letter", path: "/dashboard/cover-letter",
      time: new Date(r.created_date).toLocaleDateString(),
      status: "Saved",
    })),
  ].slice(0, 5);

  return (
    <div className="max-w-7xl space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/95 via-accent to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 30%, white 0%, transparent 60%)" }} />
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5 border border-white/10" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">{initial}</div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold">
                  <Crown className="w-3 h-3 text-amber-300" /> {planLabel}
                </div>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">Welcome back, {firstName} 👋</h1>
              <p className="text-white/75 text-sm mt-1">Pick up where you left off or start something new.</p>
            </div>
            {plan === "free" && (
              <Link to="/dashboard/pricing">
                <Button className="bg-white text-primary hover:bg-white/90 font-bold rounded-full px-5 h-9 text-sm gap-2 shadow-lg">
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Upgrade to Pro
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Real Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {realStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}
              className="bg-card ink-border rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{s.trend}</span>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Activity — real records */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" /> Recent Activity
          </h2>
          <Link to="/dashboard/history" className="text-xs text-accent font-semibold hover:underline">View all</Link>
        </div>
        <div className="bg-card ink-border rounded-2xl overflow-hidden divide-y divide-border">
          {recentActivity.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No activity yet. Start by building a resume or generating a cover letter!
            </div>
          ) : recentActivity.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-all group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                  <CheckCircle2 className="w-3 h-3" /> {item.status}
                </span>
                <Link to={item.path}>
                  <Button size="sm" variant="ghost"
                    className="h-8 rounded-lg text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity gap-1 shrink-0">
                    {item.action} <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* All Tools Grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" /> All Tools
          </h2>
          <span className="text-xs text-muted-foreground">{QUICK_TOOLS.length} tools available</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {QUICK_TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.03 }}
                className="group relative bg-card ink-border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                {/* Share button */}
                <button
                  onClick={(e) => { e.preventDefault(); setShareTarget(tool); }}
                  className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-muted/0 hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                  title={`Share ${tool.title}`}
                >
                  <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                <Link to={tool.path} className="block h-full">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1 pr-6">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{tool.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Open tool <ArrowRight className="w-3 h-3" />
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
                <Star className="w-4 h-4 mr-2" /> Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Share modal */}
      {shareTarget && <ShareToolModal tool={shareTarget} onClose={() => setShareTarget(null)} />}
    </div>
  );
}