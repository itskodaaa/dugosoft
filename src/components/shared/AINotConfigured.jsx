import React from "react";
import { AlertTriangle, Settings } from "lucide-react";

/**
 * Shown when the AI service is not configured (missing API key).
 * Transparent, honest state — never fake results.
 */
export default function AINotConfigured({ feature = "This feature" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-amber-600" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-2">AI Service Not Configured</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-3">
        {feature} requires the AI service to be set up. The <code className="bg-muted px-1 rounded text-xs">GEMINI_API_KEY</code> environment secret is missing.
      </p>
      <p className="text-xs text-muted-foreground">
        Dashboard → Settings → Environment Variables → Add <code className="bg-muted px-1 rounded">GEMINI_API_KEY</code>
      </p>
    </div>
  );
}