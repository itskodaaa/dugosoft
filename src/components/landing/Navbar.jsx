import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, Sparkles, FileText, Languages, Target, Globe2, MessageCircle, BarChart3, Users, Zap } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";

const FEATURES_MENU = [
  { icon: FileText,      label: "Resume Builder",     desc: "ATS-optimized resumes",   path: "/dashboard/resume-builder-v2",  color: "text-accent" },
  { icon: Target,        label: "Career Matcher",      desc: "Match jobs worldwide",     path: "/dashboard/career-matcher",     color: "text-orange-500" },
  { icon: Languages,     label: "AI Translator",       desc: "50+ languages",            path: "/dashboard/translator",         color: "text-blue-500" },
  { icon: BarChart3,     label: "ATS Checker",         desc: "Score your resume",        path: "/dashboard/ats-checker",        color: "text-green-500" },
  { icon: Globe2,        label: "CV Vault",            desc: "Multilingual CV storage",  path: "/dashboard/cv-vault",           color: "text-emerald-500" },
  { icon: MessageCircle, label: "Chat with Document",  desc: "Ask your docs anything",   path: "/dashboard/chat-with-document", color: "text-purple-500" },
  { icon: Users,         label: "Team Workspaces",     desc: "Collaborate on docs",      path: "/dashboard/workspaces",         color: "text-indigo-500" },
  { icon: Zap,           label: "All Tools →",         desc: "View full dashboard",      path: "/dashboard",                    color: "text-foreground" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLang();
  const { isAuthenticated: isLoggedIn } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm" : "glass"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/3cd00a9ca_Gemini_Generated_Image_6abwj06abwj06abw-removebg-preview.png"
            alt="Dugosoft"
            className="h-9 w-9 object-contain"
          />
          <span className="font-extrabold text-base tracking-tight text-foreground hidden sm:block">DUGOSOFT</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {/* Features dropdown */}
          <div className="relative"
            onMouseEnter={() => setFeaturesOpen(true)}
            onMouseLeave={() => setFeaturesOpen(false)}
          >
            <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              {t("nav_features")} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${featuresOpen ? "rotate-180" : ""}`} />
            </button>
            {featuresOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[520px] bg-card border border-border rounded-2xl shadow-2xl p-3 grid grid-cols-2 gap-1.5 z-50">
                {FEATURES_MENU.map((f, idx) => {
                  const Icon = f.icon;
                  // Map labels/descs to i18n keys
                  const keys = [
                    { label: "nav_features_resume", desc: "nav_features_resume_desc" },
                    { label: "nav_features_matcher", desc: "nav_features_matcher_desc" },
                    { label: "nav_features_translator", desc: "nav_features_translator_desc" },
                    { label: "nav_features_ats", desc: "nav_features_ats_desc" },
                    { label: "nav_features_vault", desc: "nav_features_vault_desc" },
                    { label: "nav_features_chat", desc: "nav_features_chat_desc" },
                    { label: "nav_features_workspaces", desc: "nav_features_workspaces_desc" },
                    { label: "nav_features_all", desc: "nav_features_all_desc" }
                  ];
                  const key = keys[idx] || { label: "", desc: "" };
                  
                  return (
                    <Link key={f.path} to={f.path}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
                      onClick={() => setFeaturesOpen(false)}>
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className={`w-4 h-4 ${f.color}`} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">{t(key.label)}</p>
                        <p className="text-[10px] text-muted-foreground">{t(key.desc)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <a href="#pricing" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            {t("nav_pricing")}
          </a>
          <Link to="/about" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            {t("nav_about")}
          </Link>
          <Link to="/contact" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            {t("nav_contact")}
          </Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/auth">
            <Button size="sm" variant="outline" className="rounded-full px-5 font-semibold text-sm">
              {isLoggedIn ? t("nav_my_account") : t("nav_sign_in")}
            </Button>
          </Link>
          <Link to={isLoggedIn ? "/dashboard" : "/auth"}>
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 font-semibold text-sm gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> {isLoggedIn ? t("nav_dashboard") : t("nav_get_started")}
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur border-t border-border px-5 py-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 pb-1 pt-1">Features</p>
          {FEATURES_MENU.slice(0, 6).map((f, idx) => {
            const Icon = f.icon;
            const keys = ["nav_features_resume", "nav_features_matcher", "nav_features_translator", "nav_features_ats", "nav_features_vault", "nav_features_chat"];
            return (
              <Link key={f.path} to={f.path} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors">
                <Icon className={`w-4 h-4 ${f.color}`} />
                <span className="text-sm font-medium text-foreground">{t(keys[idx])}</span>
              </Link>
            );
          })}
          <div className="border-t border-border my-2" />
          <a href="#pricing" className="block px-3 py-2.5 text-sm font-medium text-foreground rounded-xl hover:bg-muted" onClick={() => setMobileOpen(false)}>{t("nav_pricing")}</a>
          <Link to="/about" className="block px-3 py-2.5 text-sm font-medium text-foreground rounded-xl hover:bg-muted" onClick={() => setMobileOpen(false)}>{t("nav_about")}</Link>
          <Link to="/contact" className="block px-3 py-2.5 text-sm font-medium text-foreground rounded-xl hover:bg-muted" onClick={() => setMobileOpen(false)}>{t("nav_contact")}</Link>
          <div className="pt-2 space-y-2">
            <div className="py-1"><LanguageSwitcher /></div>
            <Link to="/auth" onClick={() => setMobileOpen(false)}>
              <Button size="sm" variant="outline" className="w-full rounded-full font-semibold">
                {isLoggedIn ? t("nav_my_account") : t("nav_sign_in")}
              </Button>
            </Link>
            <Link to={isLoggedIn ? "/dashboard" : "/auth"} onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-semibold">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> {isLoggedIn ? t("nav_dashboard") : t("nav_get_started")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}