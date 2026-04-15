import React from "react";
import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import NotificationPanel from "@/components/shared/NotificationPanel";
import { useLang } from "@/lib/i18n";
import UserProfileDropdown from "@/components/dashboard/UserProfileDropdown";

export default function DashboardHeader({ onMenuToggle }) {
  const { t } = useLang();

  return (
    <header className="sticky top-0 z-20 h-16 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-5 gap-4">
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors shrink-0"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div className="relative hidden sm:block max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("search_tools")}
            className="pl-9 h-9 bg-muted/60 border-0 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-accent/40"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-xs font-semibold text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          {t("nav_operational")}
        </div>
        <LanguageSwitcher />
        <NotificationPanel />
        <UserProfileDropdown />
      </div>
    </header>
  );
}