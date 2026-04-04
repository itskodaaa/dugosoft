import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, BarChart3, Languages, Table2, TrendingUp,
  MessageSquare, Clock, Settings, ChevronLeft, Lock, RefreshCw,
  Share2, Activity, PenLine, CreditCard, Merge, Linkedin,
  PieChart, FolderOpen, ScanText, LayoutTemplate, Target, Users, Globe,
  MessageCircle, Bot, Zap, Briefcase, Sparkles, Brain
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { label: "Dashboard",         icon: LayoutDashboard, path: "/dashboard" },
    ]
  },
  {
    label: "Documents",
    items: [
      { label: "File Converter",    icon: RefreshCw,       path: "/dashboard/file-converter" },
      { label: "PDF to Excel",      icon: Table2,          path: "/dashboard/pdf-to-excel" },
      { label: "AI Translator",     icon: Languages,       path: "/dashboard/translator" },
      { label: "OCR & Extract",     icon: ScanText,        path: "/dashboard/ocr-tools" },
      { label: "Document Merger",   icon: Merge,           path: "/dashboard/document-merger" },
      { label: "File Sharing",      icon: Share2,          path: "/dashboard/file-sharing" },
      { label: "My Documents",      icon: FolderOpen,      path: "/dashboard/my-documents" },
    ]
  },
  {
    label: "Resume",
    items: [
      { label: "Resume Builder",    icon: FileText,        path: "/dashboard/resume-builder-v2" },
      { label: "Cover Letter",      icon: PenLine,         path: "/dashboard/cover-letter" },
      { label: "Cover Letter AI",   icon: Sparkles,        path: "/dashboard/cover-letter-architect" },
      { label: "ATS Checker",       icon: BarChart3,       path: "/dashboard/ats-checker" },
      { label: "LinkedIn Import",   icon: Linkedin,        path: "/dashboard/linkedin-import" },
      { label: "CV Vault",          icon: Globe,           path: "/dashboard/cv-vault" },
    ]
  },
  {
    label: "Career AI",
    items: [
      { label: "Career Matcher",    icon: Target,          path: "/dashboard/career-matcher" },
      { label: "Interview Prep",    icon: Brain,           path: "/dashboard/interview-prep" },
      { label: "Career Mentor",     icon: Bot,             path: "/dashboard/career-mentor" },
      { label: "Career Performance",icon: Activity,        path: "/dashboard/career-performance" },
      { label: "LinkedIn Optimizer",icon: TrendingUp,      path: "/dashboard/linkedin-optimizer" },
    ]
  },
  {
    label: "Chat",
    items: [
      { label: "Chat with Document",icon: MessageCircle,   path: "/dashboard/chat-with-document" },
    ]
  },
  {
    label: "Workspace",
    items: [
      { label: "Job Tracker",        icon: Briefcase,       path: "/dashboard/job-tracker" },
      { label: "Workspaces",        icon: Users,           path: "/dashboard/workspaces" },
      { label: "Analytics",         icon: PieChart,        path: "/dashboard/analytics" },
      { label: "History",           icon: Clock,           path: "/dashboard/history" },
    ]
  },
  {
    label: null,
    items: [
      { label: "Settings",          icon: Settings,        path: "/dashboard/settings" },
      { label: "Pricing",           icon: CreditCard,      path: "/dashboard/pricing" },
    ]
  },
];

export default function DashboardSidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside className={`fixed left-0 top-0 h-full bg-card border-r border-border z-40 flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        {!collapsed ? (
          <Link to="/" className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/20bb88239_loogoo.png" alt="Softdugo" className="h-9 w-9 object-contain" />
            <span className="text-base font-bold tracking-tight text-foreground">softdugo</span>
          </Link>
        ) : (
          <img src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/20bb88239_loogoo.png" alt="Softdugo" className="h-8 w-8 object-contain mx-auto" />
        )}
        <button onClick={onToggle} className={`hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted transition-colors ${collapsed ? "mx-auto mt-2" : ""}`}>
          <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-1" : ""}>
            {group.label && !collapsed && (
              <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{group.label}</p>
            )}
            {group.label && collapsed && gi > 0 && <div className="my-2 h-px bg-border mx-2" />}
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
              return (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5 ${
                    isActive ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  } ${collapsed ? "justify-center" : ""}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-accent" : ""}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Upgrade nudge */}
      {!collapsed && (
        <div className="p-3 shrink-0 border-t border-border">
          <Link to="/dashboard/pricing">
            <div className="bg-gradient-to-r from-accent/10 to-green-500/10 rounded-xl p-3 cursor-pointer hover:from-accent/15 hover:to-green-500/15 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-bold text-foreground">Upgrade to Premium</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Unlock all tools & features</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}