import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Languages,
  Table2,
  TrendingUp,
  MessageSquare,
  Clock,
  Settings,
  Zap,
  ChevronLeft,
  Lock,
  RefreshCw,
  Share2,
  Activity,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", active: true },
  { label: "Resume Builder", icon: FileText, path: "/dashboard/resume-builder", active: true },
  { label: "ATS Checker", icon: BarChart3, path: "/dashboard/ats-checker", active: true },
  { label: "Translator", icon: Languages, path: "/dashboard/translator", active: true },
  { label: "PDF to Excel", icon: Table2, path: "/dashboard/pdf-to-excel", active: true },
  { label: "File Converter", icon: RefreshCw, path: "/dashboard/file-converter", active: true },
  { label: "File Sharing", icon: Share2, path: "/dashboard/file-sharing", active: true },
  { label: "Career Performance", icon: Activity, path: "/dashboard/career-performance", active: true },
  { divider: true },
  { label: "Financial Analyzer", icon: TrendingUp, path: "#", active: false },
  { label: "Chat with Document", icon: MessageSquare, path: "#", active: false },
  { divider: true },
  { label: "History", icon: Clock, path: "/dashboard/history", active: true },
  { label: "Settings", icon: Settings, path: "/dashboard/settings", active: true },
];

export default function DashboardSidebar({ collapsed, onToggle }) {
  const location = useLocation();

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
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-accent-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">softdugo</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center mx-auto">
            <Zap className="w-3.5 h-3.5 text-accent-foreground" />
          </div>
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
              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-accent" : ""}`} />
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