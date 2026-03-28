import React from "react";
import { Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";

const STATES = {
  idle: null,
  processing: { icon: Loader2, label: "Processing...", color: "text-accent", spin: true, bg: "bg-accent/10" },
  complete: { icon: CheckCircle2, label: "Complete", color: "text-success", spin: false, bg: "bg-success/10" },
  error: { icon: AlertCircle, label: "Error", color: "text-destructive", spin: false, bg: "bg-destructive/10" },
  waiting: { icon: Clock, label: "Waiting", color: "text-muted-foreground", spin: false, bg: "bg-muted" },
};

export default function StatusBadge({ status = "idle", label }) {
  const config = STATES[status];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
      <Icon className={`w-3.5 h-3.5 ${config.spin ? "animate-spin" : ""}`} />
      {label || config.label}
    </div>
  );
}