import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, FileText, Languages, ScanText, TrendingUp, Crown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { PLAN_LIMITS } from "@/lib/planConfig";

const METERS = [
  { key: "ai_requests",      label: "AI Requests",    icon: Zap,      color: "from-accent to-blue-500",        bg: "bg-accent/10",  text: "text-accent" },
  { key: "pdf_processing",   label: "PDF Operations", icon: FileText, color: "from-orange-500 to-amber-400",   bg: "bg-orange-100", text: "text-orange-600" },
  { key: "ocr_requests",     label: "OCR Scans",      icon: ScanText, color: "from-purple-500 to-violet-400", bg: "bg-purple-100", text: "text-purple-600" },
  { key: "translations",     label: "Translations",   icon: Languages,color: "from-green-500 to-emerald-400", bg: "bg-green-100",  text: "text-green-600" },
];

function Bar({ pct, color, animate }) {
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: animate * 0.1 }}
        className={`h-full bg-gradient-to-r ${color} rounded-full`}
      />
    </div>
  );
}

export default function UsageMeter() {
  const { user } = useAuth();
  if (!user) return null;

  const plan = user.plan || "free";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const isUnlimited = plan === "business";

  return (
    <div className="bg-card ink-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          <p className="text-sm font-bold text-foreground">Monthly Usage</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
          plan === "business" ? "bg-amber-500/10 text-amber-600" :
          plan === "pro"      ? "bg-accent/10 text-accent" :
                                "bg-muted text-muted-foreground"
        }`}>
          {plan === "business" ? "🏆 " : plan === "pro" ? "⚡ " : ""}
          {plan.charAt(0).toUpperCase() + plan.slice(1)}
        </span>
      </div>

      <div className="space-y-3">
        {METERS.map((m, i) => {
          const Icon = m.icon;
          const used = user[m.key] || 0;
          const limit = isUnlimited ? Infinity : (limits[m.key] ?? 0);
          const pct = isUnlimited ? 5 : limit > 0 ? (used / limit) * 100 : 0;
          const nearLimit = !isUnlimited && pct >= 80;

          return (
            <div key={m.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${m.text}`} />
                  <span className="text-xs font-medium text-foreground">{m.label}</span>
                </div>
                <span className={`text-[10px] font-bold ${nearLimit ? "text-destructive" : "text-muted-foreground"}`}>
                  {isUnlimited ? `${used} / ∞` : `${used} / ${limit}`}
                </span>
              </div>
              <Bar pct={pct} color={nearLimit ? "from-destructive to-orange-500" : m.color} animate={i} />
            </div>
          );
        })}
      </div>

      {plan === "free" && (
        <Link to="/dashboard/pricing">
          <div className="mt-4 flex items-center gap-2 p-3 bg-gradient-to-r from-accent/10 to-green-500/10 rounded-xl cursor-pointer hover:from-accent/15 transition-colors border border-accent/20">
            <Crown className="w-4 h-4 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">Upgrade for more</p>
              <p className="text-[10px] text-muted-foreground">Pro: 200 AI · 100 PDF · 50 OCR · 50 translations</p>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
