import React from "react";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Zap className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">softdugo</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered document intelligence for modern workflows.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-foreground hover:text-accent transition-colors">Resume Builder</a></li>
              <li><a href="#" className="text-foreground hover:text-accent transition-colors">ATS Checker</a></li>
              <li><a href="#" className="text-foreground hover:text-accent transition-colors">Translator</a></li>
              <li><a href="#" className="text-foreground hover:text-accent transition-colors">PDF to Excel</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-foreground hover:text-accent transition-colors">About</a></li>
              <li><a href="#" className="text-foreground hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-foreground hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              System
            </h4>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              All Systems Operational
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Softdugo. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground font-mono">v1.0.0-mvp</p>
        </div>
      </div>
    </footer>
  );
}