import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Zap, Menu, X } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useLang } from "@/lib/i18n";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLang();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">softdugo</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("nav_features")}</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("nav_pricing")}</a>
          <LanguageSwitcher />
          <Link to="/dashboard">
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 font-semibold">
              {t("nav_dashboard")}
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border px-6 py-4 space-y-3">
          <a href="#features" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>{t("nav_features")}</a>
          <a href="#pricing" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>{t("nav_pricing")}</a>
          <div className="py-1"><LanguageSwitcher /></div>
          <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
            <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-semibold">
              {t("nav_dashboard")}
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}