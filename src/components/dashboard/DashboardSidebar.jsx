import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, BarChart3, Languages, Table2, TrendingUp,
  MessageSquare, Clock, Settings, Zap, ChevronLeft, Lock, RefreshCw,
  Share2, Activity, PenLine, CreditCard, Bot, Merge, Linkedin,
  PieChart, FolderOpen, ScanText, LayoutTemplate,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function DashboardSidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { t } = useLang();

  const navItems = [
    { label: t("side_dashboard"),  icon: LayoutDashboard, path: "/dashboard",                   active: true },
    { label: t("side_resume"),     icon: FileText,         path: "/dashboard/resume-builder",    active: true },
    { label: t("side_ats"),        icon: BarChart3,        path: "/dashboard/ats-checker",       active: true },
    { label: t("side_translator"), icon: Languages,        path: "/dashboard/translator",        active: true },
    { label: t("side_pdf"),        icon: Table2,           path: "/dashboard/pdf-to-excel",      active: true },
    { label: t("side_converter"),  icon: RefreshCw,        path: "/dashboard/file-converter",   active: true },
    { label: t("side_sharing"),    icon: Share2,           path: "/dashboard/file-sharing",      active: true },
    { label: t("side_career"),     icon: Activity,         path: "/dashboard/career-performance",active: true },
    { label: t("side_cover"),      icon: PenLine,          path: "/dashboard/cover-letter",      active: true },
    { label: t("side_merger"),     icon: Merge,            path: "/dashboard/document-merger",   active: true },
    { label: t("side_mentor"),     icon: Bot,              path: "/dashboard/career-mentor",     active: true },
    { label: "LinkedIn Optimizer", icon: Linkedin,         path: "/dashboard/linkedin-optimizer", active: true },
    { label: "Resume Builder Pro",  icon: LayoutTemplate,   path: "/dashboard/resume-builder-v2",  active: true },
    { label: "OCR & Converter",     icon: ScanText,         path: "/dashboard/ocr-tools",           active: true },
    { label: "My Documents",        icon: FolderOpen,       path: "/dashboard/my-documents",        active: true },
    { label: "Analytics",           icon: PieChart,         path: "/dashboard/analytics",           active: true },
    { divider: true },
    { label: t("side_financial"),  icon: TrendingUp,       path: "#",                            active: false },
    { label: t("side_chat"),       icon: MessageSquare,    path: "#",                            active: false },
    { divider: true },
    { label: t("side_history"),    icon: Clock,            path: "/dashboard/history",           active: true },
    { label: t("side_settings"),   icon: Settings,         path: "/dashboard/settings",          active: true },
    { label: t("side_pricing"),    icon: CreditCard,       path: "/dashboard/pricing",           active: true },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-card border-r border-border z-40 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/20bb88239_loogoo.png" alt="Softdugo" className="h-9 w-9 object-contain" />
            <span className="text-base font-bold tracking-tight text-foreground">softdugo</span>
          </Link>
        )}
        {collapsed && (
          <img src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/20bb88239_loogoo.png" alt="Softdugo" className="h-8 w-8 object-contain mx-auto" />
        )}
        <button
          onClick={onToggle}
          className={`hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted transition-colors ${
            collapsed ? "mx-auto mt-2" : ""
          }`}
        >
          <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.divider) {
            return <div key={i} className="my-3 h-px bg-border mx-2" />;
          }

          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isDisabled = !item.active;

          return (
            <Link
              key={item.label}
              to={isDisabled ? "#" : item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : isDisabled
                  ? "text-muted-foreground/50 cursor-default"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              } ${collapsed ? "justify-center" : ""}`}
              onClick={isDisabled ? (e) => e.preventDefault() : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-accent" : ""}`} />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {isDisabled && (
                    <Lock className="w-3 h-3 ml-auto text-muted-foreground/40" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}