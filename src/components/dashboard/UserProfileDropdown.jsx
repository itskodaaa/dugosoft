import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, Settings, CreditCard, ChevronDown, Crown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n";

const PLAN_STYLES = {
  free:     { label: "Free",     cls: "bg-muted text-muted-foreground" },
  pro:      { label: "Pro",      cls: "bg-accent/15 text-accent" },
  business: { label: "Business", cls: "bg-amber-100 text-amber-700" },
};

export default function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const plan = user.plan || "free";
  const planStyle = PLAN_STYLES[plan] || PLAN_STYLES.free;
  const initials = (user.full_name || user.email || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors">
        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[100px]">
            {user.full_name || user.email}
          </p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${planStyle.cls}`}>
            {t(`plan_${plan}`)}
          </span>
        </div>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card ink-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-border">
            <p className="text-sm font-bold text-foreground truncate">{user.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className="mt-2 flex items-center gap-1.5">
              {plan === "business" && <Crown className="w-3.5 h-3.5 text-amber-500" />}
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${planStyle.cls}`}>
                {t(`plan_${plan}`)} {t("plan_label")}
              </span>
            </div>
          </div>

          {/* Usage summary */}
          <div className="p-3 border-b border-border space-y-1.5">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{t("usage_today")}</p>
            <UsageBar label="PDF" used={user.pdf_count || 0} limit={plan === "free" ? 5 : plan === "pro" ? 100 : null} />
            <UsageBar label="AI"  used={user.ai_requests || 0} limit={plan === "free" ? 10 : plan === "pro" ? 200 : null} />
            <UsageBar label="OCR" used={user.ocr_count || 0} limit={plan === "free" ? 3 : plan === "pro" ? 50 : null} />
          </div>

          {/* Links */}
          <div className="p-1">
            <Link to="/dashboard/settings" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-sm text-foreground transition-colors">
              <Settings className="w-3.5 h-3.5 text-muted-foreground" /> {t("side_settings")}
            </Link>
            <Link to="/dashboard/pricing" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-sm text-foreground transition-colors">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" /> {t("nav_upgrade_plan")}
            </Link>
            <button onClick={() => logout(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-destructive/10 text-sm text-destructive transition-colors">
              <LogOut className="w-3.5 h-3.5" /> {t("nav_sign_out")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UsageBar({ label, used, limit }) {
  const { t } = useLang();
  if (limit === null) return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-green-600">{t("usage_unlimited")}</span>
    </div>
  );
  const pct = Math.min((used / limit) * 100, 100);
  const color = pct >= 90 ? "bg-destructive" : pct >= 60 ? "bg-amber-500" : "bg-accent";
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-0.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{used}/{limit}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}