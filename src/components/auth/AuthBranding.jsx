import React from "react";
import { Zap, FileText, Languages, BarChart3, Shield } from "lucide-react";

const FEATURES = [
  { icon: FileText, text: "AI-powered Resume & Cover Letter builder" },
  { icon: Languages, text: "Document translation in 5+ languages" },
  { icon: BarChart3, text: "ATS score checker & career analytics" },
  { icon: Shield, text: "Secure file sharing & conversion" },
];

export default function AuthBranding() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(213 56% 14%) 0%, hsl(219 60% 22%) 50%, hsl(213 56% 10%) 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, hsl(219 100% 61%) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, hsl(219 100% 61%) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

      {/* Logo */}
      <div className="flex items-center gap-3 relative z-10">
        <img src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/20bb88239_loogoo.png" alt="Softdugo" className="h-12 w-12 object-contain" />
        <span className="text-white font-bold text-xl tracking-tight">Softdugo</span>
      </div>

      {/* Main copy */}
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
          Turn Documents<br />into Intelligence
        </h1>
        <p className="text-white/60 text-base leading-relaxed mb-10">
          Create resumes, translate documents, and process files with AI — all in one place.
        </p>

        {/* Features list */}
        <div className="space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-accent" />
              </div>
              <span className="text-white/80 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badge */}
      <div className="relative z-10 flex items-center gap-2">
        <div className="flex -space-x-2">
          {["#4f46e5", "#0ea5e9", "#10b981"].map((color, i) => (
            <div key={i} className="w-7 h-7 rounded-full border-2 border-white/20 flex items-center justify-center text-xs font-bold text-white"
              style={{ background: color }}>
              {["J", "M", "S"][i]}
            </div>
          ))}
        </div>
        <p className="text-white/50 text-xs">
          Trusted by <span className="text-white/80 font-semibold">10,000+</span> professionals
        </p>
      </div>
    </div>
  );
}