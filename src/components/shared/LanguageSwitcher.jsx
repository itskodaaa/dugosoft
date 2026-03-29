import React, { useState, useRef, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";

export default function LanguageSwitcher({ compact = false }) {
  const { lang, switchLang, LANGUAGES } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-foreground border border-border"
      >
        <span className="text-base leading-none">{current.flag}</span>
        {!compact && <span className="hidden sm:inline">{current.label}</span>}
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { switchLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-muted text-left ${
                lang === l.code ? "bg-accent/10 text-accent font-semibold" : "text-foreground"
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}