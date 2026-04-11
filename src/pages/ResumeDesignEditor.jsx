import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download, Eye, Palette, Type, Maximize2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const LAYOUTS = [
  { id: "classic",   label: "Classic",    desc: "Clean single-column, ATS-safe",      accent: "#4f8ef7" },
  { id: "modern",    label: "Modern",     desc: "Two-column with sidebar",             accent: "#8b5cf6" },
  { id: "minimal",   label: "Minimal",    desc: "Whitespace-driven, elegant",          accent: "#10b981" },
  { id: "executive", label: "Executive",  desc: "Bold header, formal structure",       accent: "#f97316" },
];

const FONTS = ["Inter", "Georgia", "Times New Roman", "Arial", "Roboto", "Merriweather"];
const MARGINS = [{ label: "Narrow", value: "12px" }, { label: "Normal", value: "20px" }, { label: "Wide", value: "32px" }];

const DEFAULT_RESUME = {
  name: "Alex Johnson",
  title: "Senior Software Engineer",
  contact: "alex@email.com  ·  +1 555-0199  ·  linkedin.com/in/alexjohnson  ·  San Francisco, CA",
  summary: "Results-driven engineer with 6+ years building scalable web applications. Passionate about clean code, great UX, and mentoring junior developers.",
  experience: `TechCorp — Senior Software Engineer (2022–Present)
• Led migration of monolith to microservices, reducing deploy time by 60%
• Mentored team of 4 engineers, improving sprint velocity by 35%

StartupXYZ — Software Engineer (2019–2022)
• Built React dashboard serving 50,000+ daily users
• Reduced API response time by 40% through caching optimizations`,
  skills: "React · TypeScript · Node.js · Python · AWS · Docker · PostgreSQL · GraphQL",
  education: "BSc Computer Science — UC Berkeley (2015–2019)",
};

function ResumePreview({ layout, font, margin, data, accentColor }) {
  const base = { fontFamily: font, padding: margin };

  const styles = {
    classic: (
      <div style={{ ...base, maxWidth: "680px", margin: "0 auto", color: "#1a1a2e" }}>
        <div style={{ borderBottom: `3px solid ${accentColor}`, paddingBottom: "12px", marginBottom: "16px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0 }}>{data.name}</h1>
          <p style={{ fontSize: "14px", color: accentColor, fontWeight: 600, margin: "4px 0" }}>{data.title}</p>
          <p style={{ fontSize: "11px", color: "#666", margin: "4px 0" }}>{data.contact}</p>
        </div>
        <Section title="Summary" accent={accentColor}><p style={{ fontSize: "12px", lineHeight: 1.6 }}>{data.summary}</p></Section>
        <Section title="Experience" accent={accentColor}><pre style={{ fontSize: "12px", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: font }}>{data.experience}</pre></Section>
        <Section title="Skills" accent={accentColor}><p style={{ fontSize: "12px" }}>{data.skills}</p></Section>
        <Section title="Education" accent={accentColor}><p style={{ fontSize: "12px" }}>{data.education}</p></Section>
      </div>
    ),
    modern: (
      <div style={{ ...base, maxWidth: "680px", margin: "0 auto", display: "grid", gridTemplateColumns: "200px 1fr", gap: "0", color: "#1a1a2e" }}>
        <div style={{ background: accentColor, padding: "20px", color: "white" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, marginBottom: 12 }}>
            {data.name[0]}
          </div>
          <h1 style={{ fontSize: "16px", fontWeight: 900, margin: "0 0 4px" }}>{data.name}</h1>
          <p style={{ fontSize: "11px", opacity: 0.85, marginBottom: 16 }}>{data.title}</p>
          <p style={{ fontSize: "10px", opacity: 0.75, lineHeight: 1.6 }}>{data.contact.split("·").join("\n")}</p>
          <div style={{ marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: 12 }}>
            <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Skills</p>
            {data.skills.split("·").map((s, i) => <p key={i} style={{ fontSize: "10px", opacity: 0.85, marginBottom: 3 }}>• {s.trim()}</p>)}
          </div>
        </div>
        <div style={{ padding: "20px" }}>
          <Section title="Summary" accent={accentColor}><p style={{ fontSize: "12px", lineHeight: 1.6 }}>{data.summary}</p></Section>
          <Section title="Experience" accent={accentColor}><pre style={{ fontSize: "11px", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: font }}>{data.experience}</pre></Section>
          <Section title="Education" accent={accentColor}><p style={{ fontSize: "12px" }}>{data.education}</p></Section>
        </div>
      </div>
    ),
    minimal: (
      <div style={{ ...base, maxWidth: "680px", margin: "0 auto", color: "#1a1a2e" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 300, letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>{data.name}</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: "6px 0 4px", letterSpacing: 1 }}>{data.title}</p>
          <p style={{ fontSize: "11px", color: "#aaa" }}>{data.contact}</p>
          <div style={{ width: 40, height: 2, background: accentColor, marginTop: 12 }} />
        </div>
        <Section title="About" accent={accentColor} minimal><p style={{ fontSize: "12px", lineHeight: 1.7, color: "#444" }}>{data.summary}</p></Section>
        <Section title="Experience" accent={accentColor} minimal><pre style={{ fontSize: "11px", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: font, color: "#444" }}>{data.experience}</pre></Section>
        <Section title="Skills" accent={accentColor} minimal><p style={{ fontSize: "12px", color: "#444" }}>{data.skills}</p></Section>
        <Section title="Education" accent={accentColor} minimal><p style={{ fontSize: "12px", color: "#444" }}>{data.education}</p></Section>
      </div>
    ),
    executive: (
      <div style={{ ...base, maxWidth: "680px", margin: "0 auto", color: "#1a1a2e" }}>
        <div style={{ background: "#1a1a2e", color: "white", padding: "24px", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0, letterSpacing: 1 }}>{data.name}</h1>
          <p style={{ fontSize: "14px", color: accentColor, fontWeight: 600, margin: "6px 0 4px" }}>{data.title}</p>
          <p style={{ fontSize: "11px", color: "#aaa" }}>{data.contact}</p>
        </div>
        <Section title="Executive Summary" accent={accentColor}><p style={{ fontSize: "12px", lineHeight: 1.6 }}>{data.summary}</p></Section>
        <Section title="Professional Experience" accent={accentColor}><pre style={{ fontSize: "12px", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: font }}>{data.experience}</pre></Section>
        <Section title="Core Competencies" accent={accentColor}><p style={{ fontSize: "12px" }}>{data.skills}</p></Section>
        <Section title="Education" accent={accentColor}><p style={{ fontSize: "12px" }}>{data.education}</p></Section>
      </div>
    ),
  };
  return styles[layout] || styles.classic;
}

function Section({ title, accent, minimal, children }) {
  if (minimal) {
    return (
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: accent, marginBottom: "8px" }}>{title}</p>
        {children}
      </div>
    );
  }
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <p style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: accent, margin: 0 }}>{title}</p>
        <div style={{ flex: 1, height: "1px", background: `${accent}40` }} />
      </div>
      {children}
    </div>
  );
}

export default function ResumeDesignEditor() {
  const [layout, setLayout] = useState("classic");
  const [font, setFont] = useState("Inter");
  const [margin, setMargin] = useState("20px");
  const [accentColor, setAccentColor] = useState("#4f8ef7");
  const [data, setData] = useState(DEFAULT_RESUME);
  const [editOpen, setEditOpen] = useState(false);
  const previewRef = useRef(null);

  const selectedLayout = LAYOUTS.find(l => l.id === layout);

  const exportPDF = async () => {
    toast.info("Preparing PDF export...");
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    const el = previewRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`${data.name.replace(/\s+/g, "_")}_Resume.pdf`);
    toast.success("PDF downloaded!");
  };

  return (
    <div className="max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Resume Design Editor</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Choose a layout, customize styling, and export as a styled PDF.</p>
          </div>
          <Button onClick={exportPDF} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full gap-2 font-semibold px-6">
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Controls */}
        <div className="space-y-5">
          {/* Layout picker */}
          <div className="bg-card ink-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-accent" />
              <p className="text-sm font-semibold text-foreground">Layout</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUTS.map(l => (
                <button key={l.id} onClick={() => { setLayout(l.id); setAccentColor(l.accent); }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${layout === l.id ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}>
                  <div className="w-full h-8 rounded-md mb-2" style={{ background: `linear-gradient(135deg, ${l.accent}22, ${l.accent}44)`, border: `1px solid ${l.accent}33` }}>
                    <div className="h-2 w-3/4 rounded mt-1 mx-1.5" style={{ background: l.accent, opacity: 0.6 }} />
                    <div className="h-1 w-1/2 rounded mt-1 mx-1.5 bg-gray-300" />
                  </div>
                  <p className="text-xs font-bold text-foreground">{l.label}</p>
                  <p className="text-[10px] text-muted-foreground">{l.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="bg-card ink-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-accent" />
              <p className="text-sm font-semibold text-foreground">Font</p>
            </div>
            <div className="space-y-1.5">
              {FONTS.map(f => (
                <button key={f} onClick={() => setFont(f)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${font === f ? "bg-accent/10 text-accent font-semibold" : "hover:bg-muted text-muted-foreground"}`}
                  style={{ fontFamily: f }}>{f}</button>
              ))}
            </div>
          </div>

          {/* Margins */}
          <div className="bg-card ink-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Maximize2 className="w-4 h-4 text-accent" />
              <p className="text-sm font-semibold text-foreground">Margins</p>
            </div>
            <div className="flex gap-2">
              {MARGINS.map(m => (
                <button key={m.value} onClick={() => setMargin(m.value)}
                  className={`flex-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${margin === m.value ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/40"}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div className="bg-card ink-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-accent" />
              <p className="text-sm font-semibold text-foreground">Accent Color</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["#4f8ef7","#8b5cf6","#10b981","#f97316","#ec4899","#ef4444","#f59e0b","#14b8a6"].map(c => (
                <button key={c} onClick={() => setAccentColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all border-2 ${accentColor === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"}`}
                  style={{ background: c }} />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
              <span className="text-xs text-muted-foreground">Custom color</span>
            </div>
          </div>

          {/* Edit content toggle */}
          <div className="bg-card ink-border rounded-2xl overflow-hidden">
            <button onClick={() => setEditOpen(p => !p)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
              <p className="text-sm font-semibold text-foreground">Edit Content</p>
              {editOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {editOpen && (
              <div className="px-4 pb-4 space-y-3">
                {[
                  { key: "name", label: "Full Name" },
                  { key: "title", label: "Title" },
                  { key: "contact", label: "Contact" },
                  { key: "summary", label: "Summary", multi: true },
                  { key: "experience", label: "Experience", multi: true },
                  { key: "skills", label: "Skills" },
                  { key: "education", label: "Education" },
                ].map(f => (
                  <div key={f.key}>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">{f.label}</Label>
                    {f.multi ? (
                      <Textarea value={data[f.key]} onChange={e => setData(p => ({ ...p, [f.key]: e.target.value }))}
                        className="text-xs bg-muted border-0 min-h-[80px] resize-none" />
                    ) : (
                      <input value={data[f.key]} onChange={e => setData(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full text-xs bg-muted rounded-md px-3 py-2 border-0 outline-none focus:ring-1 focus:ring-accent" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-card ink-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-amber-400/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">{selectedLayout?.label} · {font} · {MARGINS.find(m => m.value === margin)?.label} margins</span>
            </div>
            <Button size="sm" variant="outline" onClick={exportPDF} className="rounded-full text-xs gap-1.5 h-7">
              <Download className="w-3 h-3" /> Export PDF
            </Button>
          </div>
          <div className="overflow-auto p-6 bg-gray-50 dark:bg-muted/20 min-h-[600px]">
            <div ref={previewRef} className="bg-white shadow-xl rounded-lg overflow-hidden">
              <ResumePreview layout={layout} font={font} margin={margin} data={data} accentColor={accentColor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}