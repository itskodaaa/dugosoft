import React, { useState } from "react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  GripVertical, Plus, Trash2, Download, Eye, Crown, Lock, Check, ChevronDown, ChevronUp,
  Type, Palette, Globe2, Save, CheckCircle2, Loader2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/AuthContext";

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: "clean", name: "Clean Pro", industry: "Tech", level: "Mid-level", premium: false, accent: "#4f8ef7", font: "Inter" },
  { id: "minimal", name: "Minimal", industry: "Creative", level: "Entry-level", premium: false, accent: "#10b981", font: "Inter" },
  { id: "executive", name: "Executive", industry: "Finance", level: "Executive", premium: true, accent: "#1e293b", font: "Inter" },
  { id: "modern", name: "Modern Bold", industry: "Marketing", level: "Mid-level", premium: false, accent: "#f97316", font: "Inter" },
  { id: "healthcare", name: "Healthcare", industry: "Healthcare", level: "Mid-level", premium: true, accent: "#0ea5e9", font: "Inter" },
  { id: "creative", name: "Creative Studio", industry: "Creative", level: "Mid-level", premium: true, accent: "#8b5cf6", font: "Inter" },
  { id: "senior_tech", name: "Senior Tech", industry: "Tech", level: "Senior", premium: false, accent: "#4f46e5", font: "Inter" },
  { id: "entry", name: "Fresh Start", industry: "Any", level: "Entry-level", premium: false, accent: "#059669", font: "Inter" },
];

const INDUSTRIES = ["All", "Tech", "Creative", "Finance", "Marketing", "Healthcare", "Any"];
const LEVELS = ["All", "Entry-level", "Mid-level", "Senior", "Executive"];

const TARGET_REGIONS = [
  { id: "none",   flag: "🌐", label: "No Region",    desc: "Standard format" },
  { id: "us",     flag: "🇺🇸", label: "USA / Global",  desc: "Achievement-focused" },
  { id: "uk",     flag: "🇬🇧", label: "United Kingdom", desc: "UK ATS standards" },
  { id: "eu",     flag: "🇪🇺", label: "EU Standard",    desc: "Europass-compatible" },
  { id: "it",     flag: "🇮🇹", label: "Italy",          desc: "Italian CV norms" },
  { id: "de",     flag: "🇩🇪", label: "Germany",        desc: "Lebenslauf format" },
];

function RegionBadge({ region }) {
  if (!region || region.id === "none") return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold border border-blue-200">
      {region.flag} {region.label}
    </span>
  );
}

// ─── Default resume data ──────────────────────────────────────────────────────
const DEFAULT_RESUME = {
  name: "Alex Johnson",
  title: "Senior Software Engineer",
  email: "alex@example.com",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexjohnson",
  summary: "Passionate software engineer with 6+ years building scalable web applications. Experienced in React, Node.js, and cloud infrastructure.",
  sections: [
    {
      id: "experience", label: "Experience", visible: true, items: [
        { id: "e1", title: "Senior Engineer", company: "TechCorp Inc.", period: "2022–Present", desc: "Led a team of 5 engineers to build a microservices platform serving 2M users." },
        { id: "e2", title: "Software Engineer", company: "StartupXYZ", period: "2019–2022", desc: "Built full-stack features for a SaaS product from 0 to $5M ARR." },
      ]
    },
    {
      id: "education", label: "Education", visible: true, items: [
        { id: "ed1", title: "B.Sc. Computer Science", company: "UC Berkeley", period: "2015–2019", desc: "GPA 3.8/4.0 · Dean's List" },
      ]
    },
    {
      id: "skills", label: "Skills", visible: true, items: [
        { id: "s1", title: "React, Node.js, TypeScript, Python, PostgreSQL, AWS, Docker, Kubernetes", company: "", period: "", desc: "" },
      ]
    },
  ]
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function TemplateCard({ tpl, selected, onSelect, isPremiumUser }) {
  const locked = tpl.premium && !isPremiumUser;
  return (
    <div onClick={() => onSelect(tpl)}
      className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${selected?.id === tpl.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"} ${locked ? "opacity-70" : ""}`}>
      <div className="h-20 rounded-lg mb-3 flex items-center justify-center" style={{ background: tpl.accent + "15", borderLeft: `4px solid ${tpl.accent}` }}>
        <div className="space-y-1 w-3/4">
          <div className="h-2 rounded bg-current opacity-30 w-full" style={{ color: tpl.accent }} />
          <div className="h-1.5 rounded bg-current opacity-20 w-4/5" style={{ color: tpl.accent }} />
          <div className="h-1.5 rounded bg-current opacity-20 w-3/5" style={{ color: tpl.accent }} />
        </div>
      </div>
      <p className="text-xs font-bold text-foreground">{tpl.name}</p>
      <p className="text-[10px] text-muted-foreground">{tpl.industry} · {tpl.level}</p>
      <div className="absolute top-2 right-2 flex gap-1">
        {tpl.premium ? (
          <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
            <Crown className="w-2.5 h-2.5" /> PRO
          </span>
        ) : (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">FREE</span>
        )}
      </div>
      {locked && <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-background/60"><Lock className="w-5 h-5 text-muted-foreground" /></div>}
      {selected?.id === tpl.id && <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
    </div>
  );
}

function SectionEditor({ section, onUpdate, onDelete }) {
  const [open, setOpen] = useState(true);
  const addItem = () => {
    onUpdate({ ...section, items: [...section.items, { id: Date.now().toString(), title: "", company: "", period: "", desc: "" }] });
  };
  const updateItem = (id, field, val) => {
    onUpdate({ ...section, items: section.items.map(it => it.id === id ? { ...it, [field]: val } : it) });
  };
  const deleteItem = (id) => {
    onUpdate({ ...section, items: section.items.filter(it => it.id !== id) });
  };

  return (
    <div className="bg-card ink-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b border-border">
        <div className="cursor-grab text-muted-foreground"><GripVertical className="w-4 h-4" /></div>
        <button onClick={() => setOpen(p => !p)} className="flex-1 flex items-center gap-2 text-left">
          <span className="text-sm font-bold text-foreground">{section.label}</span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto" />}
        </button>
        <button onClick={onDelete} className="w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/10">
          <Trash2 className="w-3 h-3 text-destructive" />
        </button>
      </div>
      {open && (
        <div className="p-4 space-y-4">
          {section.items.map((item, idx) => (
            <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <Input placeholder="Title / Role" value={item.title} onChange={e => updateItem(item.id, "title", e.target.value)} className="text-xs h-8 bg-background" />
                <button onClick={() => deleteItem(item.id)} className="w-8 h-8 shrink-0 rounded flex items-center justify-center hover:bg-destructive/10">
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
              {section.id !== "skills" && (
                <>
                  <div className="flex gap-2">
                    <Input placeholder="Company / Institution" value={item.company} onChange={e => updateItem(item.id, "company", e.target.value)} className="text-xs h-8 bg-background" />
                    <Input placeholder="2022–Present" value={item.period} onChange={e => updateItem(item.id, "period", e.target.value)} className="text-xs h-8 bg-background w-32" />
                  </div>
                  <Textarea placeholder="Description..." value={item.desc} onChange={e => updateItem(item.id, "desc", e.target.value)} className="text-xs min-h-[60px] resize-none bg-background" />
                </>
              )}
            </div>
          ))}
          <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-accent font-medium hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add item
          </button>
        </div>
      )}
    </div>
  );
}

function ResumePreview({ data, template }) {
  const accent = template?.accent || "#4f8ef7";
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden text-[11px] font-sans" style={{ minHeight: 600 }}>
      {/* Header */}
      <div className="px-8 pt-8 pb-5" style={{ borderBottom: `3px solid ${accent}` }}>
        <h1 className="text-2xl font-black text-gray-900">{data.name}</h1>
        <p className="text-sm font-semibold mt-0.5" style={{ color: accent }}>{data.title}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-gray-500">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
        </div>
      </div>
      {/* Summary */}
      {data.summary && (
        <div className="px-8 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}
      {/* Sections */}
      {data.sections.filter(s => s.visible).map(sec => (
        <div key={sec.id} className="px-8 py-4 border-b border-gray-100 last:border-0">
          <h2 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: accent }}>{sec.label}</h2>
          {sec.items.map(item => (
            <div key={item.id} className="mb-3 last:mb-0">
              <div className="flex justify-between items-start">
                <p className="font-bold text-gray-900">{item.title}</p>
                {item.period && <p className="text-gray-400 shrink-0 ml-4">{item.period}</p>}
              </div>
              {item.company && <p className="text-gray-500 font-medium">{item.company}</p>}
              {item.desc && <p className="text-gray-600 mt-0.5 leading-relaxed">{item.desc}</p>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ResumeBuilderV2() {
  const { user } = useAuth();
  const [step, setStep] = useState("template"); // template | editor
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [industryFilter, setIndustryFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [resume, setResume] = useState({ ...DEFAULT_RESUME, name: user?.full_name || DEFAULT_RESUME.name, email: user?.email || DEFAULT_RESUME.email });
  const [activeTab, setActiveTab] = useState("content"); // content | style
  const [targetRegion, setTargetRegion] = useState(TARGET_REGIONS[0]);
  const [adapting, setAdapting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const isPremiumUser = user?.plan === "pro" || user?.plan === "business";

  const adaptToRegion = async (region) => {
    setTargetRegion(region);
    if (region.id === "none") return;
    setAdapting(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert resume coach specializing in international CV standards.

Adapt this resume to match the professional norms for: ${region.label} (${region.desc})

Current Resume Summary: ${resume.summary}
Current Experience Bullets:
${resume.sections.find(s => s.id === "experience")?.items.map(i => `- ${i.desc}`).join("\n") || ""}

Rules for ${region.label}:
${region.id === "uk" ? "- UK ATS: avoid personal pronouns, use 'competency-based' language, include key achievements, no photos" : ""}
${region.id === "eu" ? "- Europass: structured format, include language skills, focus on competencies and qualifications" : ""}
${region.id === "it" ? "- Italian CV: formal third-person references acceptable, include date of birth optionally, academic focus, Euro terminology" : ""}
${region.id === "de" ? "- German Lebenslauf: chronological, formal, precise dates, include nationality, structured headings" : ""}
${region.id === "us" ? "- US format: achievement-focused, quantified results, ATS-optimized keywords, no photos" : ""}

Return JSON:
{
  "summary": "adapted professional summary",
  "experience_items": [{ "id": "e1", "desc": "adapted bullet" }, { "id": "e2", "desc": "adapted bullet" }]
}`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          experience_items: { type: "array", items: { type: "object", properties: { id: { type: "string" }, desc: { type: "string" } } } }
        }
      }
    });

    setResume(p => ({
      ...p,
      summary: result.summary || p.summary,
      sections: p.sections.map(sec => {
        if (sec.id !== "experience") return sec;
        return {
          ...sec,
          items: sec.items.map(item => {
            const adapted = result.experience_items?.find(e => e.id === item.id);
            return adapted ? { ...item, desc: adapted.desc } : item;
          })
        };
      })
    }));
    setAdapting(false);
    toast.success(`Resume adapted for ${region.label}!`);
  };

  const handleSelectTemplate = (tpl) => {
    if (tpl.premium && !isPremiumUser) {
      toast.warning("This is a Premium template. Upgrade to Pro to unlock it.");
      return;
    }
    setSelectedTemplate(tpl);
  };

  const updateSection = (id, updated) => {
    setResume(p => ({ ...p, sections: p.sections.map(s => s.id === id ? updated : s) }));
  };
  const deleteSection = (id) => {
    setResume(p => ({ ...p, sections: p.sections.filter(s => s.id !== id) }));
  };
  const addSection = () => {
    const id = "custom_" + Date.now();
    setResume(p => ({ ...p, sections: [...p.sections, { id, label: "New Section", visible: true, items: [] }] }));
  };
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(resume.sections);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setResume(p => ({ ...p, sections: items }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    const title = `${resume.name || "Resume"} — ${selectedTemplate.name}`;
    const data = {
      title,
      template_id: selectedTemplate.id,
      template_name: selectedTemplate.name,
      target_region: targetRegion.id !== "none" ? targetRegion.label : null,
      resume_data: JSON.stringify(resume),
      status: "draft",
    };
    if (savedId) {
      await base44.entities.ResumeProject.update(savedId, data);
    } else {
      const record = await base44.entities.ResumeProject.create(data);
      setSavedId(record.id);
    }
    setSaving(false);
    toast.success("Resume draft saved!");
  };

  const handleExport = () => {
    // Generate printable text version
    const lines = [
      resume.name,
      resume.title,
      [resume.email, resume.phone, resume.location, resume.linkedin].filter(Boolean).join(" | "),
      "",
      resume.summary,
      "",
      ...resume.sections.filter(s => s.visible).flatMap(sec => [
        sec.label.toUpperCase(),
        ...sec.items.map(item => `${item.title}${item.company ? ` — ${item.company}` : ""}${item.period ? ` (${item.period})` : ""}${item.desc ? `\n${item.desc}` : ""}`),
        "",
      ]),
    ];
    const text = lines.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${resume.name?.replace(/\s+/g, "-") || "download"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Resume exported as text file. For PDF, use browser Print → Save as PDF.");
  };

  const filteredTemplates = TEMPLATES.filter(t =>
    (industryFilter === "All" || t.industry === industryFilter) &&
    (levelFilter === "All" || t.level === levelFilter)
  );

  if (step === "template") {
    return (
      <div className="max-w-6xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-extrabold text-foreground mb-1">Resume Builder</h1>
          <p className="text-muted-foreground text-sm">Choose a template to get started.</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            {INDUSTRIES.map(i => (
              <button key={i} onClick={() => setIndustryFilter(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${industryFilter === i ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border text-muted-foreground hover:border-accent/40"}`}>
                {i}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevelFilter(l)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${levelFilter === l ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/30"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTemplates.map(tpl => (
            <TemplateCard key={tpl.id} tpl={tpl} selected={selectedTemplate} onSelect={handleSelectTemplate} isPremiumUser={isPremiumUser} />
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setStep("editor")} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 h-11 font-semibold">
            Use This Template →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            Resume Editor
            <RegionBadge region={targetRegion} />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Template: <span className="font-semibold">{selectedTemplate.name}</span></p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep("template")} className="rounded-full h-9 text-xs">← Templates</Button>
          <Button onClick={handleSaveDraft} disabled={saving} variant="outline" className="rounded-full h-9 text-xs gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedId ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Save className="w-3.5 h-3.5" />}
            {savedId ? "Saved" : "Save Draft"}
          </Button>
          <Button onClick={handleExport}
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-9 text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Editor panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {[
              { key: "content", label: "Content", icon: Type },
              { key: "style", label: "Style", icon: Palette },
              { key: "region", label: "Region", icon: Globe2 }
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${activeTab === key ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>

          {activeTab === "content" && (
            <div className="space-y-4">
              {/* Personal info */}
              <div className="bg-card ink-border rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Personal Info</p>
                {[["name","Full Name"],["title","Job Title"],["email","Email"],["phone","Phone"],["location","Location"],["linkedin","LinkedIn"]].map(([k,ph]) => (
                  <Input key={k} placeholder={ph} value={resume[k]} onChange={e => setResume(p => ({...p, [k]: e.target.value}))} className="text-xs h-8 bg-background" />
                ))}
                <Textarea placeholder="Professional Summary" value={resume.summary} onChange={e => setResume(p => ({...p, summary: e.target.value}))} className="text-xs min-h-[70px] resize-none bg-background" />
              </div>

              {/* Sections */}
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {resume.sections.map((sec, idx) => (
                        <Draggable key={sec.id} draggableId={sec.id} index={idx}>
                          {(prov) => (
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                              <SectionEditor section={sec} onUpdate={(u) => updateSection(sec.id, u)} onDelete={() => deleteSection(sec.id)} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <button onClick={addSection} className="w-full py-3 rounded-xl border-2 border-dashed border-border hover:border-accent/50 text-xs text-muted-foreground hover:text-accent transition-colors flex items-center justify-center gap-1.5 font-medium">
                <Plus className="w-3.5 h-3.5" /> Add Section
              </button>
            </div>
          )}

          {activeTab === "region" && (
            <div className="bg-card ink-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe2 className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-bold text-foreground">Target Region</p>
              </div>
              <p className="text-xs text-muted-foreground">AI will automatically reformat your resume to match local ATS standards and professional expectations.</p>
              <div className="space-y-2">
                {TARGET_REGIONS.map(region => (
                  <button key={region.id} onClick={() => adaptToRegion(region)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      targetRegion.id === region.id ? "border-blue-400 bg-blue-50" : "border-border hover:border-blue-300"
                    }`}>
                    <span className="text-xl">{region.flag}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{region.label}</p>
                      <p className="text-xs text-muted-foreground">{region.desc}</p>
                    </div>
                    {targetRegion.id === region.id && <Check className="w-4 h-4 text-blue-500 ml-auto" />}
                  </button>
                ))}
              </div>
              {adapting && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-blue-700">AI is adapting your resume for {targetRegion.label}...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "style" && (
            <div className="bg-card ink-border rounded-xl p-5 space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Accent Color</p>
                <div className="flex gap-2 flex-wrap">
                  {["#4f8ef7","#10b981","#f97316","#8b5cf6","#ef4444","#1e293b","#0ea5e9","#059669"].map(c => (
                    <button key={c} onClick={() => setSelectedTemplate(p => ({...p, accent: c}))}
                      className={`w-8 h-8 rounded-lg transition-all ${selectedTemplate?.accent === c ? "ring-2 ring-offset-2 ring-foreground" : ""}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Section Visibility</p>
                <div className="space-y-2">
                  {resume.sections.map(sec => (
                    <label key={sec.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={sec.visible} onChange={e => updateSection(sec.id, {...sec, visible: e.target.checked})} className="rounded" />
                      <span className="text-sm text-foreground">{sec.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Preview</p>
          </div>
          <div className="sticky top-4 overflow-auto max-h-[85vh] rounded-2xl shadow-xl">
            <ResumePreview data={resume} template={selectedTemplate} />
          </div>
        </div>
      </div>
    </div>
  );
}