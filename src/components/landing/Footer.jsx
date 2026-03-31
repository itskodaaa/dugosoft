import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/20bb88239_loogoo.png" alt="Softdugo" className="h-10 w-10 object-contain" />
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
              <li><Link to="/dashboard/resume-builder" className="text-foreground hover:text-accent transition-colors">Resume Builder</Link></li>
              <li><Link to="/dashboard/ats-checker" className="text-foreground hover:text-accent transition-colors">ATS Checker</Link></li>
              <li><Link to="/dashboard/translator" className="text-foreground hover:text-accent transition-colors">Translator</Link></li>
              <li><Link to="/dashboard/pdf-to-excel" className="text-foreground hover:text-accent transition-colors">PDF to Excel</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-foreground hover:text-accent transition-colors">About</Link></li>
              <li><Link to="/privacy" className="text-foreground hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="text-foreground hover:text-accent transition-colors">Contact</Link></li>
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