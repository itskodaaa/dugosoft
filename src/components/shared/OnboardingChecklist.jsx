import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { authApi } from "@/api/auth";

const STEPS = [
  { id: "profile",   label: "Complete your profile",     path: "/dashboard/settings",          desc: "Add your name and preferences" },
  { id: "resume",    label: "Build your first resume",    path: "/dashboard/resume-builder-v2",  desc: "Use our AI resume builder" },
  { id: "ats",       label: "Check your ATS score",       path: "/dashboard/ats-checker",        desc: "See how your resume performs" },
  { id: "translate", label: "Translate a document",       path: "/dashboard/translator",         desc: "Try 50+ languages" },
  { id: "cover",     label: "Generate a cover letter",    path: "/dashboard/cover-letter",       desc: "AI-powered cover letters" },
  { id: "pricing",   label: "Explore pricing plans",      path: "/dashboard/pricing",            desc: "Find the right plan for you" },
];

export default function OnboardingChecklist() {
  const { user, updateUser } = useAuth();
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [completed, setCompleted] = useState({});

  // Load completed steps from user data
  useEffect(() => {
    if (user?.onboardingSteps) {
      setCompleted(user.onboardingSteps);
    }
    // Auto-dismiss if all done
    if (user?.onboardingDismissed) setDismissed(true);
  }, [user]);

  // Only show for relatively new users (created in last 30 days)
  const isNewUser = !user?.createdAt || (Date.now() - new Date(user.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;
  if (dismissed || !isNewUser) return null;

  const completedCount = Object.values(completed).filter(Boolean).length;
  const allDone = completedCount === STEPS.length;

  const markStep = async (id) => {
    // Optimistic update
    const nextSteps = { ...completed, [id]: true };
    setCompleted(nextSteps);
    
    try {
      const data = await authApi.updateProfile({ onboardingSteps: nextSteps });
      updateUser(data.user);
    } catch (error) {
      console.error('Failed to update onboarding progress:', error);
    }
  };

  const dismiss = async () => {
    setDismissed(true);
    try {
      const data = await authApi.updateProfile({ onboardingDismissed: true });
      updateUser(data.user);
    } catch (error) {
      console.error('Failed to dismiss onboarding:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-card ink-border rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setOpen(p => !p)}
      >
        <div className="flex items-center gap-3">
          {allDone
            ? <Trophy className="w-5 h-5 text-amber-500" />
            : <Sparkles className="w-5 h-5 text-accent" />
          }
          <div>
            <p className="font-bold text-foreground text-sm">
              {allDone ? "🎉 Onboarding Complete!" : "Get started with Dugosoft"}
            </p>
            <p className="text-xs text-muted-foreground">
              {allDone
                ? "You're all set! Explore all features."
                : `${completedCount} of ${STEPS.length} steps completed`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress pill */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / STEPS.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-accent">{Math.round((completedCount / STEPS.length) * 100)}%</span>
          </div>
          <button onClick={e => { e.stopPropagation(); dismiss(); }} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Steps */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {STEPS.map((step, i) => {
                const done = completed[step.id];
                return (
                  <Link
                    key={step.id}
                    to={step.path}
                    onClick={() => markStep(step.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-sm group ${
                      done
                        ? "border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800"
                        : "border-border hover:border-accent/40 hover:bg-muted/30"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {done
                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                        : <Circle className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      }
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${done ? "text-green-700 dark:text-green-400 line-through" : "text-foreground"}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-muted-foreground/40 group-hover:text-accent transition-colors shrink-0">
                      {i + 1}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}