import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, BarChart3, Languages, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function DashboardHome() {
  const { t } = useLang();

  const quickActions = [
    { icon: FileText,  title: t("dash_create_resume"), description: t("dash_resume_desc"),   path: "/dashboard/resume-builder", color: "bg-accent/10 text-accent" },
    { icon: BarChart3, title: t("dash_analyze"),       description: t("dash_analyze_desc"),  path: "/dashboard/ats-checker",    color: "bg-emerald-500/10 text-emerald-600" },
    { icon: Languages, title: t("dash_translate"),     description: t("dash_translate_desc"),path: "/dashboard/translator",     color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-1">{t("dash_welcome")}</h1>
        <p className="text-muted-foreground mb-8">{t("dash_subtitle")}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }}>
              <Link to={action.path}>
                <div className="group p-6 rounded-xl ink-border bg-card hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{action.description}</p>
                  <div className="flex items-center gap-1 text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Get started <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-10">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t("dash_activity")}</h2>
        <div className="rounded-xl ink-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">{t("dash_no_activity")}</p>
        </div>
      </motion.div>
    </div>
  );
}