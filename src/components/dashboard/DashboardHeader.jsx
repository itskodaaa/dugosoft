import React from "react";
import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useLang } from "@/lib/i18n";

export default function DashboardHeader({ onMenuToggle }) {
  const { t } = useLang();

  return (
    <header className="sticky top-0 z-20 h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("search_tools")}
            className="pl-9 w-64 h-9 bg-muted border-0 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          {t("nav_operational")}
        </div>
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-semibold text-accent">
          S
        </div>
      </div>
    </header>
  );
}