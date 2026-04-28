import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "@/lib/i18n";
import {
  LayoutDashboard, FileText, BarChart3, Languages, TrendingUp, Clock, Settings, ChevronLeft, RefreshCw,
  Share2, Activity, PenLine, CreditCard, Merge, Linkedin,
  FolderOpen, ScanText, LayoutTemplate, Target, Users, Globe,
  MessageCircle, Zap, Briefcase, Sparkles, Brain, X, Wand2, FileSignature, Gift, Upload, ChevronDown
} from "lucide-react";

const PRO_PATHS = new Set([
  "/dashboard/career-matcher",
  "/dashboard/skill-gap",
  "/dashboard/interview-prep",
  "/dashboard/career-mentor",
  "/dashboard/career-performance",
  "/dashboard/linkedin-optimizer",
  "/dashboard/linkedin-import",
  "/dashboard/cover-letter-architect",
  "/dashboard/cv-vault",
  "/dashboard/chat-with-document",
  "/dashboard/ai-assistant",
]);

const BUSINESS_PATHS = new Set([
  "/dashboard/workspaces",
  "/dashboard/analytics",
  "/dashboard/vibe-prospecting",
]);

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { key: "side_dashboard", icon: LayoutDashboard, path: "/dashboard" },
    ]
  },
  {
    label: "side_group_docs",
    items: [
      { key: "side_converter",    icon: RefreshCw,      path: "/dashboard/file-converter" },
      { key: "side_translator",     icon: Languages,      path: "/dashboard/translator" },
      { key: "side_language_tools", icon: Languages,      path: "/dashboard/ai-language" },
      { key: "side_ocr",     icon: ScanText,       path: "/dashboard/ocr-tools" },
      { key: "side_merger",   icon: Merge,          path: "/dashboard/document-merger" },
      { key: "side_sharing",      icon: Share2,         path: "/dashboard/file-sharing" },
      { key: "side_pdf",         icon: FileText,       path: "/dashboard/pdf-tools" },
      { key: "side_documents",      icon: FolderOpen,     path: "/dashboard/my-documents" },
    ]
  },
  {
    label: "side_group_career",
    items: [
      { key: "side_resume",    icon: FileText,       path: "/dashboard/resume-builder-v2" },
      { key: "side_import",     icon: Upload,         path: "/dashboard/import-resume" },
      { key: "side_design",     icon: LayoutTemplate, path: "/dashboard/resume-design" },
      { key: "side_vault",          icon: Globe,          path: "/dashboard/cv-vault" },
      { key: "side_linkedin",   icon: Linkedin,       path: "/dashboard/linkedin-import" },
      { key: "side_resume_translator", icon: Languages,      path: "/dashboard/resume-translator" },
      { key: "side_linkedin_optimizer",icon: TrendingUp,     path: "/dashboard/linkedin-optimizer" },
      { key: "side_ats",       icon: BarChart3,      path: "/dashboard/ats-checker" },
      { key: "side_cover",      icon: PenLine,        path: "/dashboard/cover-letter" },
      { key: "side_cover_ai",   icon: Sparkles,       path: "/dashboard/cover-letter-architect" },
      { key: "side_matcher",    icon: Target,         path: "/dashboard/career-matcher" },
      { key: "side_skill_gap",         icon: BarChart3,      path: "/dashboard/skill-gap" },
      { key: "side_interview",    icon: Brain,          path: "/dashboard/interview-prep" },
      { key: "side_mentor",     icon: Wand2,          path: "/dashboard/career-mentor" },
      { key: "side_career",icon: Activity,       path: "/dashboard/career-performance" },
      { key: "side_portfolio",         icon: Globe,          path: "/dashboard/portfolio-builder" },
    ]
  },
  {
    label: "side_group_sales",
    items: [
      { key: "side_vibe",  icon: Sparkles,       path: "/dashboard/vibe-prospecting" },
    ]
  },
  {
    label: "side_group_collab",
    items: [
      { key: "side_chat",icon: MessageCircle,  path: "/dashboard/chat-with-document" },
      { key: "side_assistant",      icon: Wand2,          path: "/dashboard/ai-assistant" },
      { key: "side_job_tracker",       icon: Briefcase,      path: "/dashboard/job-tracker" },
      { key: "side_workspaces",        icon: Users,          path: "/dashboard/workspaces" },
      { key: "side_esign",       icon: FileSignature,  path: "/dashboard/esign" },
    ]
  },
  {
    label: null,
    items: [
      { key: "side_history",   icon: Clock,      path: "/dashboard/history" },
      { key: "side_analytics", icon: Activity,   path: "/dashboard/analytics" },
      { key: "side_referral",  icon: Gift,       path: "/dashboard/referral" },
      { key: "side_settings",  icon: Settings,   path: "/dashboard/settings" },
      { key: "side_pricing",   icon: CreditCard, path: "/dashboard/pricing" },
    ]
  },
];

export default function DashboardSidebar({ collapsed, onToggle, onMobileClose }) {
  const location = useLocation();
  const { t } = useLang();

  // Track which labeled groups are expanded (default all open)
  const [openGroups, setOpenGroups] = useState(() => {
    const m = {};
    NAV_GROUPS.forEach(g => { if (g.label) m[g.label] = true; });
    return m;
  });

  const toggleGroup = (label) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className={`h-full bg-card border-r border-border flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"} overflow-hidden`}>
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-border shrink-0">
        {!collapsed ? (
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img
              src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/3cd00a9ca_Gemini_Generated_Image_6abwj06abwj06abw-removebg-preview.png"
              alt="Dugosoft" className="h-8 w-8 object-contain shrink-0"
            />
            <span className="text-base font-extrabold tracking-tight text-foreground truncate">DUGOSOFT</span>
          </Link>
        ) : (
          <img
            src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/3cd00a9ca_Gemini_Generated_Image_6abwj06abwj06abw-removebg-preview.png"
            alt="Dugosoft" className="h-7 w-7 object-contain mx-auto"
          />
        )}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onMobileClose}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto overscroll-contain">
        {NAV_GROUPS.map((group, gi) => {
          const isOpen = group.label ? openGroups[group.label] !== false : true;

          return (
            <div key={gi} className={gi > 0 ? "mt-0.5" : ""}>
              {/* Group header — collapsible when not collapsed sidebar */}
              {group.label && !collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 pt-3 pb-1 group"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                    {t(group.label)}
                  </p>
                  <ChevronDown className={`w-3 h-3 text-muted-foreground/40 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`} />
                </button>
              )}
              {group.label && collapsed && gi > 0 && <div className="my-1.5 h-px bg-border mx-2" />}

              {/* Items — hidden when group is collapsed */}
              {(isOpen || collapsed) && group.items.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                const isPro = PRO_PATHS.has(item.path);
                const isBusiness = BUSINESS_PATHS.has(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onMobileClose}
                    title={collapsed ? t(item.key) : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5 ${
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-accent" : ""}`} />
                    {!collapsed && (
                      <span className="truncate flex-1 text-[13px]">{t(item.key)}</span>
                    )}
                    {!collapsed && isPro && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent shrink-0">PRO</span>
                    )}
                    {!collapsed && isBusiness && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 shrink-0">BIZ</span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Upgrade nudge */}
      {!collapsed && (
        <div className="p-2.5 shrink-0 border-t border-border">
          <Link to="/dashboard/pricing">
            <div className="bg-gradient-to-r from-accent/10 to-green-500/10 rounded-xl p-3 cursor-pointer hover:from-accent/15 hover:to-green-500/15 transition-colors">
              <div className="flex items-center gap-2 mb-0.5">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-bold text-foreground">{t("side_upgrade")}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{t("side_unlock")}</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}