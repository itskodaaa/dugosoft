import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function History() {
  return (
    <div className="max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">
          History
        </h1>
        <p className="text-muted-foreground mb-8">
          View your past generations and analyses.
        </p>
      </motion.div>

      <div className="rounded-xl ink-border bg-card p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Clock className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No history yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Your generation history will appear here once you start using the tools. History tracking will be available in a future update.
        </p>
      </div>
    </div>
  );
}