import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trophy, Zap, Target, Brain, Globe, FileText, Lock, ChevronRight,
  Shield, ArrowRight
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const BADGES = [
  {
    id: "profile_complete",
    label: "Profile Pro",
    desc: "Complete your profile 100%",
    icon: "👤",
    points: 50,
    color: "from-blue-500 to-cyan-400",
    check: (user, resumes, letters, portfolios) => !!(user?.full_name && user?.job_title && user?.skills),
  },
  {
    id: "first_resume",
    label: "Resume Starter",
    desc: "Build your first resume",
    icon: "📄",
    points: 30,
    color: "from-accent to-blue-500",
    check: (user, resumes) => resumes?.length > 0,
  },
  {
    id: "resume_expert",
    label: "Resume Expert",
    desc: "Build 3+ resume versions",
    icon: "📋",
    points: 75,
    color: "from-purple-500 to-accent",
    check: (user, resumes) => resumes?.length >= 3,
  },
  {
    id: "cover_letter",
    label: "Letter Writer",
    desc: "Generate your first cover letter",
    icon: "✉️",
    points: 25,
    color: "from-pink-500 to-rose-400",
    check: (user, resumes, letters) => letters?.length > 0,
  },
  {
    id: "resume_imported",
    label: "AI Parsed",
    desc: "Import resume with AI",
    icon: "🤖",
    points: 40,
    color: "from-cyan-500 to-blue-400",
    check: (user) => !!user?.resume_parsed,
  },
  {
    id: "portfolio_published",
    label: "Portfolio Live",
    desc: "Publish your portfolio page",
    icon: "🌐",
    points: 60,
    color: "from-emerald-500 to-teal-400",
    check: (user, resumes, letters, portfolios) => portfolios?.length > 0,
  },
  {
    id: "skills_added",
    label: "Skill Master",
    desc: "Add 5+ skills to profile",
    icon: "⚡",
    points: 35,
    color: "from-amber-500 to-orange-400",
    check: (user) => (user?.skills || "").split(",").filter(Boolean).length >= 5,
  },
  {
    id: "global_cv",
    label: "Global Ready",
    desc: "Create a multilingual CV",
    icon: "🌍",
    points: 55,
    color: "from-green-500 to-emerald-400",
    check: (user) => !!user?.cv_vault_count,
  },
];

const HEALTH_FACTORS = [
  { key: "profile", label: "Profile Completeness", icon: Shield, path: "/dashboard/settings" },
  { key: "resume", label: "Resume Quality", icon: FileText, path: "/dashboard/resume-builder-v2" },
  { key: "interview", label: "Interview Readiness", icon: Brain, path: "/dashboard/interview-prep" },
  { key: "portfolio", label: "Portfolio Visibility", icon: Globe, path: "/dashboard/portfolio-builder" },
  { key: "applications", label: "Job Activity", icon: Target, path: "/dashboard/job-tracker" },
];

function getHealthScores(user, resumes, letters, portfolios) {
  const profileScore = (() => {
    let s = 0;
    if (user?.full_name) s += 20;
    if (user?.job_title) s += 20;
    if (user?.skills) s += 25;
    if (user?.resume_parsed) s += 20;
    if (user?.email) s += 15;
    return Math.min(s, 100);
  })();

  const resumeScore = (() => {
    if (!resumes?.length) return 0;
    if (resumes.length >= 3) return 100;
    if (resumes.length >= 2) return 70;
    return 40;
  })();

  const interviewScore = (() => {
    // Based on profile data hints
    return user?.interview_sessions ? Math.min(user.interview_sessions * 20, 100) : 10;
  })();

  const portfolioScore = portfolios?.length > 0 ? 100 : 0;
  const applicationsScore = letters?.length > 0 ? Math.min(letters.length * 20, 100) : 0;

  return {
    profile: profileScore,
    resume: resumeScore,
    interview: interviewScore,
    portfolio: portfolioScore,
    applications: applicationsScore,
  };
}

function getTotalHealth(scores) {
  const values = Object.values(scores);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function HealthRing({ score, size = 80 }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : score >= 25 ? "#f97316" : "#ef4444";

  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 40 40)"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="800" fill={color}>{score}</text>
    </svg>
  );
}

export default function CareerHealthModule() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [letters, setLetters] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.ResumeProject.list("-updated_date", 10),
      base44.entities.CoverLetter.list("-created_date", 10),
      base44.entities.Portfolio.filter({ created_by: user.email }),
    ]).then(([r, l, p]) => {
      setResumes(r);
      setLetters(l);
      setPortfolios(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const scores = getHealthScores(user, resumes, letters, portfolios);
  const healthScore = getTotalHealth(scores);

  const earnedBadges = BADGES.filter(b => b.check(user, resumes, letters, portfolios));
  const pendingBadges = BADGES.filter(b => !b.check(user, resumes, letters, portfolios));
  const totalPoints = earnedBadges.reduce((sum, b) => sum + b.points, 0);
  const maxPoints = BADGES.reduce((sum, b) => sum + b.points, 0);

  const healthLabel = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : "Needs Work";
  const healthColor = healthScore >= 80 ? "text-green-600" : healthScore >= 60 ? "text-amber-600" : healthScore >= 40 ? "text-orange-600" : "text-red-500";

  return (
    <div className="bg-card ink-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Career Health</p>
            <p className="text-[10px] text-muted-foreground">Badges, points & profile score</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-700">
            <Zap className="w-3 h-3" />
            <span className="text-xs font-bold">{totalPoints} pts</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Health Score + Factors */}
        <div className="flex items-start gap-5">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <HealthRing score={healthScore} size={80} />
            <span className={`text-xs font-bold ${healthColor}`}>{healthLabel}</span>
          </div>
          <div className="flex-1 space-y-2">
            {HEALTH_FACTORS.map(f => {
              const Icon = f.icon;
              const score = scores[f.key] || 0;
              return (
                <Link key={f.key} to={f.path}>
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground w-32 shrink-0">{f.label}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${score >= 75 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : score >= 25 ? "bg-orange-500" : "bg-red-400"}`}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground w-8 text-right">{score}%</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Points progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{earnedBadges.length}/{BADGES.length} badges earned</span>
            <span className="text-xs font-bold text-foreground">{totalPoints}/{maxPoints} pts</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totalPoints / maxPoints) * 100}%` }}
              transition={{ duration: 1.2 }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
            />
          </div>
        </div>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Earned Badges</p>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map(b => (
                <motion.div key={b.id}
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  title={`${b.label}: ${b.desc} (+${b.points} pts)`}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r ${b.color} text-white text-xs font-bold shadow-sm cursor-default`}>
                  <span>{b.icon}</span>
                  <span className="hidden sm:inline">{b.label}</span>
                  <span className="text-white/70 text-[10px]">+{b.points}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Pending badges toggle */}
        {pendingBadges.length > 0 && (
          <div>
            <button onClick={() => setExpanded(!expanded)}
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
              {expanded ? "Hide" : `Show ${pendingBadges.length} locked badges`}
              <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pendingBadges.map(b => (
                      <div key={b.id} title={`${b.desc} (+${b.points} pts)`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted border border-border text-xs font-medium text-muted-foreground cursor-default">
                        <Lock className="w-3 h-3" />
                        <span className="hidden sm:inline">{b.label}</span>
                        <span className="text-[10px]">+{b.points}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Next action CTA */}
        {pendingBadges.length > 0 && (
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-foreground">Next: {pendingBadges[0].label}</p>
              <p className="text-[11px] text-muted-foreground">{pendingBadges[0].desc} (+{pendingBadges[0].points} pts)</p>
            </div>
            <Link to={
              pendingBadges[0].id === "portfolio_published" ? "/dashboard/portfolio-builder" :
              pendingBadges[0].id === "resume_imported" ? "/dashboard/import-resume" :
              pendingBadges[0].id === "first_resume" || pendingBadges[0].id === "resume_expert" ? "/dashboard/resume-builder-v2" :
              pendingBadges[0].id === "cover_letter" ? "/dashboard/cover-letter-architect" :
              "/dashboard/settings"
            }>
              <button className="shrink-0 flex items-center gap-1 text-xs font-bold text-accent hover:underline">
                Go <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}