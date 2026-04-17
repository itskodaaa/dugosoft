import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Mail, Linkedin, Github, Globe, ExternalLink,
  Star, Briefcase, Code, Eye, Loader2, Link2
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const THEME_STYLES = {
  minimal: {
    bg: "bg-gray-50",
    card: "bg-white border border-gray-200",
    header: "bg-white border-b border-gray-200",
    text: "text-gray-900",
    sub: "text-gray-500",
    badge: "bg-gray-100 text-gray-700",
    accent: "text-blue-600",
    accentBg: "bg-blue-50",
  },
  gradient: {
    bg: "bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 min-h-screen",
    card: "bg-white/10 backdrop-blur border border-white/20",
    header: "bg-transparent",
    text: "text-white",
    sub: "text-white/70",
    badge: "bg-white/20 text-white",
    accent: "text-yellow-300",
    accentBg: "bg-white/10",
  },
  dark: {
    bg: "bg-gray-900",
    card: "bg-gray-800 border border-gray-700",
    header: "bg-gray-900 border-b border-gray-700",
    text: "text-gray-100",
    sub: "text-gray-400",
    badge: "bg-gray-700 text-gray-300",
    accent: "text-blue-400",
    accentBg: "bg-gray-800",
  },
  professional: {
    bg: "bg-slate-50",
    card: "bg-white border border-slate-200 shadow-sm",
    header: "bg-slate-800",
    text: "text-slate-900",
    sub: "text-slate-500",
    badge: "bg-slate-100 text-slate-700",
    accent: "text-slate-700",
    accentBg: "bg-slate-50",
  },
};

const LEVEL_COLORS = {
  Beginner: "bg-gray-100 text-gray-600",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-purple-100 text-purple-700",
  Expert: "bg-green-100 text-green-700",
};

export default function PublicPortfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const slug = pathParts[pathParts.length - 1];
    loadPortfolio(slug);
  }, []);

  const loadPortfolio = async (slug) => {
    try {
      const list = await base44.entities.Portfolio.filter({ slug });
      if (list.length === 0 || !list[0].is_public) {
        setNotFound(true);
      } else {
        setPortfolio(list[0]);
        // increment view count
        base44.entities.Portfolio.update(list[0].id, { view_count: (list[0].view_count || 0) + 1 }).catch(() => {});
      }
    } catch {
      setNotFound(true);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-6 text-center">
        <Globe className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Portfolio Not Found</h1>
        <p className="text-muted-foreground">This portfolio may be private or the link is incorrect.</p>
        <a href="/" className="text-accent hover:underline text-sm font-semibold">Go to Dugosoft →</a>
      </div>
    );
  }

  const theme = THEME_STYLES[portfolio.theme] || THEME_STYLES.minimal;

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Branding bar */}
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-2 bg-black/10 backdrop-blur-sm">
        <a href="/" className="text-xs font-bold text-white/80 hover:text-white flex items-center gap-1.5">
          <Link2 className="w-3 h-3" /> Made with Dugosoft
        </a>
        <div className="flex items-center gap-1 text-[10px] text-white/60">
          <Eye className="w-3 h-3" /> {portfolio.view_count || 1} views
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-16 pb-20 space-y-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`${theme.card} rounded-3xl overflow-hidden`}>
          <div className={`${portfolio.theme === "professional" ? "bg-slate-800 text-white" : ""} p-8`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-3xl font-black text-white shrink-0">
                {portfolio.name?.[0] || "?"}
              </div>
              <div className="flex-1">
                <h1 className={`text-3xl font-black ${portfolio.theme === "professional" ? "text-white" : theme.text}`}>{portfolio.name}</h1>
                <p className={`text-lg mt-1 font-semibold ${portfolio.theme === "professional" ? "text-slate-300" : theme.accent}`}>{portfolio.headline}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  {portfolio.location && (
                    <span className={`flex items-center gap-1 text-xs ${portfolio.theme === "professional" ? "text-slate-400" : theme.sub}`}>
                      <MapPin className="w-3 h-3" /> {portfolio.location}
                    </span>
                  )}
                  {portfolio.email && (
                    <a href={`mailto:${portfolio.email}`} className={`flex items-center gap-1 text-xs hover:underline ${portfolio.theme === "professional" ? "text-blue-300" : theme.accent}`}>
                      <Mail className="w-3 h-3" /> {portfolio.email}
                    </a>
                  )}
                  {portfolio.linkedin_url && (
                    <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-1 text-xs hover:underline ${portfolio.theme === "professional" ? "text-blue-300" : theme.accent}`}>
                      <Linkedin className="w-3 h-3" /> LinkedIn
                    </a>
                  )}
                  {portfolio.github_url && (
                    <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-1 text-xs hover:underline ${portfolio.theme === "professional" ? "text-blue-300" : theme.accent}`}>
                      <Github className="w-3 h-3" /> GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
            {portfolio.bio && (
              <p className={`mt-6 text-sm leading-relaxed ${portfolio.theme === "professional" ? "text-slate-300" : theme.sub}`}>{portfolio.bio}</p>
            )}
          </div>
        </motion.div>

        {/* Skills */}
        {(portfolio.skill_endorsements || []).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={`${theme.card} rounded-2xl p-6`}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
              <Star className="w-5 h-5" /> Skills & Expertise
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {portfolio.skill_endorsements.map((se, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${theme.accentBg}`}>
                  <span className={`text-sm font-semibold ${theme.text}`}>{se.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[se.level] || "bg-muted text-muted-foreground"}`}>
                      {se.level}
                    </span>
                    {se.endorsers > 0 && (
                      <span className={`text-[10px] ${theme.sub}`}>+{se.endorsers}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Projects */}
        {(portfolio.projects || []).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
              <Code className="w-5 h-5" /> Projects
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {portfolio.projects.map((p, i) => (
                <div key={i} className={`${theme.card} rounded-2xl p-5 flex flex-col gap-3`}>
                  <div className="flex items-start justify-between">
                    <h3 className={`font-bold text-sm ${theme.text}`}>{p.title}</h3>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-1 text-[10px] font-semibold ${theme.accent} hover:underline`}>
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed ${theme.sub}`}>{p.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {(p.tech_stack || []).map((t, ti) => (
                      <span key={ti} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${theme.badge}`}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Experience */}
        {(portfolio.experience || []).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={`${theme.card} rounded-2xl p-6`}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
              <Briefcase className="w-5 h-5" /> Experience
            </h2>
            <div className="space-y-4">
              {portfolio.experience.map((e, i) => (
                <div key={i} className={`border-l-2 pl-4 ${portfolio.theme === "dark" ? "border-gray-600" : "border-accent/30"}`}>
                  <p className={`text-sm font-bold ${theme.text}`}>{e.title}</p>
                  <p className={`text-xs ${theme.accent} font-semibold`}>{e.company}</p>
                  <p className={`text-xs ${theme.sub} mb-1`}>{e.period}</p>
                  {e.description && <p className={`text-xs ${theme.sub} leading-relaxed`}>{e.description}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer CTA */}
        <div className="text-center">
          <p className={`text-xs ${theme.sub}`}>
            Create your own portfolio at{" "}
            <a href="/" className={`${theme.accent} hover:underline font-semibold`}>dugosoft.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}