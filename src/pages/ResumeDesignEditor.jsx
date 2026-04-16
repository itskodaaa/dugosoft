import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download, Eye, Palette, Type, Maximize2, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { toast } from "sonner";

const LAYOUTS = [
  { id: "classic",     label: "Classic",     desc: "Clean ATS-safe single column",       accent: "#2563eb", thumb: "bg-blue-600"   },
  { id: "modern",      label: "Modern",      desc: "Two-column sidebar layout",           accent: "#7c3aed", thumb: "bg-violet-600" },
  { id: "minimal",     label: "Minimal",     desc: "Whitespace-driven, elegant",          accent: "#059669", thumb: "bg-emerald-600"},
  { id: "executive",   label: "Executive",   desc: "Bold dark header, formal",            accent: "#d97706", thumb: "bg-amber-500"  },
  { id: "microsoft",   label: "Microsoft",   desc: "Clean Word-style professional",       accent: "#0078d4", thumb: "bg-[#0078d4]" },
  { id: "creative",    label: "Creative",    desc: "Colourful accent-driven design",      accent: "#e11d48", thumb: "bg-rose-600"   },
  { id: "nordic",      label: "Nordic",      desc: "Scandinavian minimalism",             accent: "#0f172a", thumb: "bg-slate-900"  },
  { id: "timeline",    label: "Timeline",    desc: "Vertical timeline experience",        accent: "#0891b2", thumb: "bg-cyan-600"   },
];

const FONTS = ["Inter", "Georgia", "Times New Roman", "Arial", "Roboto", "Merriweather", "Playfair Display", "Source Sans Pro"];
const MARGINS = [{ label: "Narrow", value: "10px" }, { label: "Normal", value: "20px" }, { label: "Wide", value: "32px" }];

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

function Section({ title, accent, minimal, timeline, microsoft, children }) {
  if (timeline) {
    return (
      <div style={{ marginBottom: "18px", paddingLeft: "16px", borderLeft: `3px solid ${accent}` }}>
        <p style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: accent, marginBottom: "8px" }}>{title}</p>
        {children}
      </div>
    );
  }
  if (minimal) {
    return (
      <div style={{ marginBottom: "22px" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "3px", color: accent, marginBottom: "10px", borderBottom: `1px solid ${accent}20`, paddingBottom: "4px" }}>{title}</p>
        {children}
      </div>
    );
  }
  if (microsoft) {
    return (
      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontSize: "13px", fontWeight: 700, color: accent, marginBottom: "6px", borderBottom: `2px solid ${accent}`, paddingBottom: "2px" }}>{title}</p>
        {children}
      </div>
    );
  }
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <p style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: accent, margin: 0 }}>{title}</p>
        <div style={{ flex: 1, height: "1px", background: `${accent}40` }} />
      </div>
      {children}
    </div>
  );
}

function ResumePreview({ layout, font, margin, data, accentColor }) {
  const base = { fontFamily: font, padding: margin };

  if (layout === "classic") return (
    <div style={{ ...base, maxWidth: "680px", margin: "0 auto", color: "#1e293b", background: "white" }}>
      <div style={{ borderBottom: `4px solid ${accentColor}`, paddingBottom: "14px", marginBottom: "18px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px", color: "#0f172a" }}>{data.name}</h1>
        <p style={{ fontSize: "14px", color: accentColor, fontWeight: 700, margin: "5px 0 4px", letterSpacing: "0.3px" }}>{data.title}</p>
        <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0" }}>{data.contact}</p>
      </div>
      <Section title="Summary" accent={accentColor}><p style={{ fontSize: "12px", lineHeight: 1.7, color: "#334155" }}>{data.summary}</p></Section>
      <Section title="Experience" accent={accentColor}><pre style={{ fontSize: "12px", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: font, color: "#334155" }}>{data.experience}</pre></Section>
      <Section title="Skills" accent={accentColor}><p style={{ fontSize: "12px", color: "#334155" }}>{data.skills}</p></Section>
      <Section title="Education" accent={accentColor}><p style={{ fontSize: "12px", color: "#334155" }}>{data.education}</p></Section>
    </div>
  );

  if (layout === "modern") return (
    <div style={{ ...base, maxWidth: "680px", margin: "0 auto", display: "grid", gridTemplateColumns: "200px 1fr", color: "#1e293b", background: "white" }}>
      <div style={{ background: accentColor, padding: "24px 18px", color: "white", minHeight: "100%" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, marginBottom: 14, border: "3px solid rgba(255,255,255,0.4)" }}>
          {data.name[0]}
        </div>
        <h1 style={{ fontSize: "16px", fontWeight: 900, margin: "0 0 3px", lineHeight: 1.3 }}>{data.name}</h1>
        <p style={{ fontSize: "11px", opacity: 0.85, marginBottom: 18, lineHeight: 1.5 }}>{data.title}</p>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.25)", paddingTop: 14 }}>
          {data.contact.split("·").map((c, i) => <p key={i} style={{ fontSize: "10px", opacity: 0.8, marginBottom: 5, lineHeight: 1.5 }}>{c.trim()}</p>)}
        </div>
        <div style={{ marginTop: 18, borderTop: "1px solid rgba(255,255,255,0.25)", paddingTop: 14 }}>
          <p style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, opacity: 0.9 }}>Skills</p>
          {data.skills.split("·").map((s, i) => (
            <div key={i} style={{ marginBottom: 4, fontSize: "10px", opacity: 0.85, background: "rgba(255,255,255,0.15)", borderRadius: 4, padding: "2px 6px" }}>• {s.trim()}</div>
          ))}
        </div>
      </div>
      <div style={{ padding: "24px 20px" }}>
        <Section title="Summary" accent={accentColor}><p style={{ fontSize: "12px", lineHeight: 1.7, color: "#334155" }}>{data.summary}</p></Section>
        <Section title="Experience" accent={accentColor}><pre style={{ fontSize: "11px", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: font, color: "#334155" }}>{data.experience}</pre></Section>
        <Section title="Education" accent={accentColor}><p style={{ fontSize: "12px", color: "#334155" }}>{data.education}</p></Section>
      </div>
    </div>
  );

  if (layout === "minimal") return (
    <div style={{ ...base, maxWidth: "680px", margin: "0 auto", color: "#1e293b", background: "white" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 300, letterSpacing: "3px", textTransform: "uppercase", margin: 0, color: "#0f172a" }}>{data.name}</h1>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: "6px 0 4px", letterSpacing: "1.5px", textTransform: "uppercase", fontSize: "11px" }}>{data.title}</p>
        <p style={{ fontSize: "11px", color: "#cbd5e1" }}>{data.contact}</p>
        <div style={{ width: 48, height: 3, background: accentColor, marginTop: 14 }} />
      </div>
      <Section title="About" accent={accentColor} minimal><p style={{ fontSize: "12px", lineHeight: 1.8, color: "#475569" }}>{data.summary}</p></Section>
      <Section title="Experience" accent={accentColor} minimal><pre style={{ fontSize: "11px", lineHeight: 1.9, whiteSpace: "pre-wrap", fontFamily: font, color: "#475569" }}>{data.experience}</pre></Section>
      <Section title="Skills" accent={accentColor} minimal><p style={{ fontSize: "12px", color: "#475569" }}>{data.skills}</p></Section>
      <Section title="Education" accent={accentColor} minimal><p style={{ fontSize: "12px", color: "#475569" }}>{data.education}</p></Section>
    </div>
  );

  if (layout === "executive") return (
    <div style={{ ...base, maxWidth: "680px", margin: "0 auto", color: "#1e293b", background: "white" }}>
      <div style={{ background: "#0f172a", color: "white", padding: "28px 24px", marginBottom: "22px" }}>
        <h1 style={{ fontSize: "30px", fontWeight: 900, margin: 0, letterSpacing: 1 }}>{data.name}</h1>
        <p style={{ fontSize: "15px", color: accentColor, fontWeight: 700, margin: "7px 0 5px", letterSpacing: "0.5px" }}>{data.title}</p>
        <p style={{ fontSize: "11px", color: "#94a3b8", letterSpacing: "0.5px" }}>{data.contact}</p>
      </div>
      <Section title="Executive Summary" accent={accentColor}><p style={{ fontSize: "12px", lineHeight: 1.7, color: "#334155" }}>{data.summary}</p></Section>
      <Section title="Professional Experience" accent={accentColor}><pre style={{ fontSize: "12px", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: font, color: "#334155" }}>{data.experience}</pre></Section>
      <Section title="Core Competencies" accent={accentColor}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {data.skills.split("·").map((s, i) => (
            <span key={i} style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30`, borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 600 }}>{s.trim()}</span>
          ))}
        </div>
      </Section>
      <Section title="Education" accent={accentColor}><p style={{ fontSize: "12px", color: "#334155" }}>{data.education}</p></Section>
    </div>
  );

  if (layout === "microsoft") return (
    <div style={{ ...base, maxWidth: "680px", margin: "0 auto", color: "#1e293b", background: "white" }}>
      {/* MS Word-style header */}
      <div style={{ textAlign: "center", borderBottom: `3px solid ${accentColor}`, paddingBottom: "16px", marginBottom: "18px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, margin: 0, color: "#1e293b", letterSpacing: "0.5px" }}>{data.name}</h1>
        <p style={{ fontSize: "13px", color: accentColor, fontWeight: 600, margin: "5px 0" }}>{data.title}</p>
        <p style={{ fontSize: "11px", color: "#64748b" }}>{data.contact}</p>
      </div>
      <Section title="Professional Summary" accent={accentColor} microsoft><p style={{ fontSize: "12px", lineHeight: 1.7, color: "#374151" }}>{data.summary}</p></Section>
      <Section title="Work Experience" accent={accentColor} microsoft><pre style={{ fontSize: "12px", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: font, color: "#374151" }}>{data.experience}</pre></Section>
      <Section title="Skills" accent={accentColor} microsoft>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {data.skills.split("·").map((s, i) => (
            <span key={i} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", color: "#374151" }}>{s.trim()}</span>
          ))}
        </div>
      </Section>
      <Section title="Education" accent={accentColor} microsoft><p style={{ fontSize: "12px", color: "#374151" }}>{data.education}</p></Section>
    </div>
  );

  if (layout === "creative") return (
    <div style={{ ...base, maxWidth: "680px", margin: "0 auto", color: "#1e293b", background: "white" }}>
      {/* Diagonal accent bar */}
      <div style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`, padding: "28px 24px", marginBottom: "20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", bottom: -30, left: 30, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0, color: "white", letterSpacing: "-0.5px", position: "relative" }}>{data.name}</h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)", fontWeight: 600, margin: "6px 0 4px", position: "relative" }}>{data.title}</p>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", position: "relative" }}>{data.contact}</p>
      </div>
      <div style={{ paddingLeft: margin, paddingRight: margin }}>
        <Section title="About Me" accent={accentColor}><p style={{ fontSize: "12px", lineHeight: 1.75, color: "#374151" }}>{data.summary}</p></Section>
        <Section title="Experience" accent={accentColor}><pre style={{ fontSize: "11px", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: font, color: "#374151" }}>{data.experience}</pre></Section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Section title="Skills" accent={accentColor}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {data.skills.split("·").map((s, i) => (
                <div key={i} style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "6px", color: "#374151" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />{s.trim()}
                </div>
              ))}
            </div>
          </Section>
          <Section title="Education" accent={accentColor}><p style={{ fontSize: "12px", lineHeight: 1.7, color: "#374151" }}>{data.education}</p></Section>
        </div>
      </div>
    </div>
  );

  if (layout === "nordic") return (
    <div style={{ ...base, maxWidth: "680px", margin: "0 auto", color: "#0f172a", background: "white" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: "20px", marginBottom: "24px", borderBottom: "1px solid #e2e8f0" }}>
        <div>
          <h1 style={{ fontSize: "30px", fontWeight: 900, margin: 0, letterSpacing: "-1px", color: "#0f172a" }}>{data.name}</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "5px 0 0", letterSpacing: "0.5px" }}>{data.title}</p>
        </div>
        <div style={{ textAlign: "right", fontSize: "10px", color: "#94a3b8", lineHeight: 1.8 }}>
          {data.contact.split("·").map((c, i) => <p key={i} style={{ margin: 0 }}>{c.trim()}</p>)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "24px" }}>
        <div>
          <Section title="Experience" accent={accentColor} minimal><pre style={{ fontSize: "12px", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: font, color: "#334155" }}>{data.experience}</pre></Section>
          <Section title="Summary" accent={accentColor} minimal><p style={{ fontSize: "12px", lineHeight: 1.75, color: "#334155" }}>{data.summary}</p></Section>
        </div>
        <div>
          <Section title="Skills" accent={accentColor} minimal>
            {data.skills.split("·").map((s, i) => (
              <p key={i} style={{ fontSize: "11px", color: "#475569", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />{s.trim()}
              </p>
            ))}
          </Section>
          <Section title="Education" accent={accentColor} minimal><p style={{ fontSize: "11px", lineHeight: 1.7, color: "#475569" }}>{data.education}</p></Section>
        </div>
      </div>
    </div>
  );

  if (layout === "timeline") return (
    <div style={{ ...base, maxWidth: "680px", margin: "0 auto", color: "#1e293b", background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 22, fontWeight: 900, flexShrink: 0 }}>
          {data.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "24px", fontWeight: 900, margin: 0, color: "#0f172a" }}>{data.name}</h1>
          <p style={{ fontSize: "13px", color: accentColor, fontWeight: 600, margin: "3px 0" }}>{data.title}</p>
          <p style={{ fontSize: "10px", color: "#94a3b8" }}>{data.contact}</p>
        </div>
      </div>
      <Section title="Summary" accent={accentColor} timeline><p style={{ fontSize: "12px", lineHeight: 1.7, color: "#334155" }}>{data.summary}</p></Section>
      <Section title="Experience" accent={accentColor} timeline><pre style={{ fontSize: "12px", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: font, color: "#334155" }}>{data.experience}</pre></Section>
      <Section title="Skills" accent={accentColor} timeline><p style={{ fontSize: "12px", color: "#334155" }}>{data.skills}</p></Section>
      <Section title="Education" accent={accentColor} timeline><p style={{ fontSize: "12px", color: "#334155" }}>{data.education}</p></Section>
    </div>
  );

  return null;
}

export default function ResumeDesignEditor() {
  const [layout, setLayout] = useState("classic");
  const [font, setFont] = useState("Inter");
  const [margin, setMargin] = useState("20px");
  const [accentColor, setAccentColor] = useState("#2563eb");
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
            <p className="text-sm text-muted-foreground mt-0.5">8 professional templates · customize styling · export PDF</p>
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
              <p className="text-sm font-semibold text-foreground">Template</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUTS.map(l => (
                <button key={l.id} onClick={() => { setLayout(l.id); setAccentColor(l.accent); }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${layout === l.id ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}>
                  {/* Mini template preview */}
                  <div className="w-full h-10 rounded-md mb-2 overflow-hidden bg-gray-50 border border-gray-100 flex flex-col">
                    <div className={`h-3 w-full ${l.thumb}`} />
                    <div className="flex-1 p-1 space-y-0.5">
                      <div className="h-1 w-3/4 rounded bg-gray-300" />
                      <div className="h-0.5 w-1/2 rounded bg-gray-200" />
                      <div className="h-0.5 w-5/6 rounded bg-gray-200" />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-foreground">{l.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{l.desc}</p>
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
              {["#2563eb","#7c3aed","#059669","#d97706","#e11d48","#0891b2","#0f172a","#0078d4","#f97316","#8b5cf6"].map(c => (
                <button key={c} onClick={() => setAccentColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all border-2 ${accentColor === c ? "border-foreground scale-110 shadow-md" : "border-transparent hover:scale-105"}`}
                  style={{ background: c }} />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
              <span className="text-xs text-muted-foreground">Custom color</span>
            </div>
          </div>

          {/* Edit content */}
          <div className="bg-card ink-border rounded-2xl overflow-hidden">
            <button onClick={() => setEditOpen(p => !p)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <p className="text-sm font-semibold text-foreground">Edit Content</p>
              </div>
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
              <span className="ml-2 text-xs text-muted-foreground font-mono">{selectedLayout?.label} · {font}</span>
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