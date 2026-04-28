import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Linkedin, Upload, Link2, CheckCircle2, Sparkles,
  User, Briefcase, GraduationCap, Award, Languages, Code,
  ChevronRight, FileText, Camera, RefreshCw, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/api/config";
import { useAuth } from "@/lib/AuthContext";

const TABS = [
  { key: "url", label: "LinkedIn URL", icon: Link2 },
  { key: "pdf", label: "Upload PDF", icon: Upload },
];

const FIELD_SECTIONS = [
  { key: "name", label: "Full Name", icon: User },
  { key: "headline", label: "Headline / Title", icon: Briefcase },
  { key: "summary", label: "About / Summary", icon: FileText, multiline: true },
  { key: "experience", label: "Work Experience", icon: Briefcase, multiline: true },
  { key: "education", label: "Education", icon: GraduationCap, multiline: true },
  { key: "skills", label: "Skills", icon: Code },
  { key: "certifications", label: "Certifications", icon: Award },
  { key: "languages", label: "Languages", icon: Languages },
];

export default function LinkedInImport() {
  const { user } = useAuth();
  const [tab, setTab] = useState("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const fileRef = useRef(null);
  const photoRef = useRef(null);
  const navigate = useNavigate();

  const authHeader = () => {
    const t = localStorage.getItem("auth_token");
    const h = { "Content-Type": "application/json" };
    if (t) h["Authorization"] = `Bearer ${t}`;
    return h;
  };

  const callAI = async (prompt) => {
    const res = await fetch(`${API_BASE}/api/ai/invoke`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({
        action: "invokeLLM",
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name:           { type: "string" },
            headline:       { type: "string" },
            summary:        { type: "string" },
            experience:     { type: "string" },
            education:      { type: "string" },
            skills:         { type: "string" },
            certifications: { type: "string" },
            languages:      { type: "string" },
            location:       { type: "string" },
            email:          { type: "string" },
            contact:        { type: "string" },
          },
          required: ["name","headline","summary","experience","education","skills","certifications","languages","location","email","contact"]
        }
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "AI failed");
    return data.result;
  };

  const extract = async () => {
    if (tab === "url") {
      toast.error("LinkedIn blocks automated URL access. Please export your LinkedIn profile as a PDF (LinkedIn → Me → Settings & Privacy → Data privacy → Get a copy of your data) and use the Upload PDF tab.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const t = localStorage.getItem("auth_token");
      const headers = t ? { Authorization: `Bearer ${t}` } : {};
      const extractRes = await fetch(`${API_BASE}/api/ai/extract-text`, {
        method: "POST",
        headers,
        body: formData,
      });
      const extractData = await extractRes.json();
      const profileText = extractData.text || "";
      if (!profileText) throw new Error("Could not read text from the file.");

      const prompt = `You are a resume/LinkedIn profile parser. Extract ALL available information from this resume or LinkedIn PDF export text and return it as structured JSON.

Document text:
${profileText}

Return a JSON object with ALL of these fields:
- name: full name of the person
- headline: professional headline or current job title
- summary: the About/Summary section verbatim or paraphrased
- experience: all work experience as formatted text with company, title, dates, and bullet points
- education: all education entries with school, degree, field, dates
- skills: comma-separated list of all skills mentioned
- certifications: any certifications or awards
- languages: languages listed
- location: city/country
- email: email address if present
- contact: phone or other contact info if present

If a field truly cannot be found in the document, return an empty string "". Do NOT make up data.`;

      const parsed = await callAI(prompt);
      if (!parsed || typeof parsed !== "object") throw new Error("Invalid response from AI");
      setResult(parsed);
    } catch (err) {
      if (err.message.includes("upgrade")) {
        toast.error("Limit Reached: Please upgrade to Premium or Business to continue using LinkedIn Import.", {
          action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/pricing" }
        });
      } else {
        toast.error(err?.message || "Extraction failed. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const sendToResume = () => {
    toast.success("Profile imported to Resume Builder!");
    navigate("/dashboard/resume-builder-v2");
  };

  const sendToMatcher = () => {
    toast.success("Profile sent to AI Career Matcher!");
    navigate("/dashboard/career-matcher");
  };

  const sendToVault = async () => {
    if (!result) return;
    try {
      const res = await fetch(`${API_BASE}/api/vault`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
          title: `LinkedIn: ${result.name}`,
          industry: "Imported",
          content: `NAME: ${result.name}\nHEADLINE: ${result.headline}\nSUMMARY: ${result.summary}\nEXPERIENCE: ${result.experience}\nEDUCATION: ${result.education}\nSKILLS: ${result.skills}`,
          lang: "en",
          flag: "🇬🇧"
        })
      });
      if (!res.ok) throw new Error("Failed to save to vault");
      toast.success("Profile saved to CV Vault!");
      navigate("/dashboard/cv-vault");
    } catch (err) {
      toast.error("Failed to save to vault.");
    }
  };

  const syncToVault = async () => {
    if (!result) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/api/vault`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
          title: `Sync: ${result.name} (${new Date().toLocaleDateString()})`,
          industry: "Sync",
          content: `NAME: ${result.name}\nHEADLINE: ${result.headline}\nSUMMARY: ${result.summary}\nEXPERIENCE: ${result.experience}\nEDUCATION: ${result.education}\nSKILLS: ${result.skills}`,
          lang: "en",
          flag: "🇬🇧"
        })
      });
      if (!res.ok) throw new Error("Sync failed");
      toast.success("Profile synced to CV Vault!");
      navigate("/dashboard/cv-vault");
    } catch (err) {
      toast.error("Sync failed.");
    }
    setSyncing(false);
  };

  const handlePhotoUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setProfilePhoto(e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <Linkedin className="w-6 h-6 text-blue-600" /> LinkedIn Import
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Extract your LinkedIn profile into a structured resume in seconds.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/5 border border-accent/20 text-[10px] text-accent font-black uppercase tracking-widest">
             Plan: {user?.plan || "Free"}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 max-w-xs">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => { setTab(t.key); setResult(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${tab === t.key ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
              <Icon className="w-3.5 h-3.5" />{t.label}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile Photo Upload */}
          <div className="bg-card ink-border rounded-2xl p-4 flex items-center gap-4">
            <div className="relative shrink-0">
              {profilePhoto ? (
                <img src={profilePhoto} alt="profile" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                  <User className="w-7 h-7" />
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center cursor-pointer hover:bg-accent/80 transition-colors">
                <Camera className="w-3 h-3 text-white" />
                <input ref={photoRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files[0] && handlePhotoUpload(e.target.files[0])} />
              </label>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Profile Photo</p>
              <p className="text-xs text-muted-foreground mt-0.5">Upload your LinkedIn profile photo</p>
              <button onClick={() => photoRef.current?.click()}
                className="text-xs text-accent font-semibold hover:underline mt-1">
                {profilePhoto ? "Change photo" : "Upload photo"}
              </button>
            </div>
          </div>

          {tab === "url" ? (
            <div className="bg-card ink-border rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
                <Linkedin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">LinkedIn blocks all automated access. URL extraction is not supported. Please use the <strong>Upload PDF</strong> tab instead.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">How to export your LinkedIn PDF:</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to your LinkedIn profile</li>
                  <li>Click <strong>More</strong> → <strong>Save to PDF</strong></li>
                  <li>Upload the downloaded PDF in the Upload PDF tab</li>
                </ol>
              </div>
              <Button onClick={() => { setTab("pdf"); setResult(null); }}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold gap-2 text-sm">
                <Upload className="w-4 h-4" />Switch to Upload PDF
              </Button>
            </div>
          ) : (
            <div className="bg-card ink-border rounded-2xl p-6 space-y-4">
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all ${isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"}`}
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-xs text-destructive mt-1">Remove</button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground mb-1">Drop LinkedIn PDF export</p>
                    <p className="text-xs text-muted-foreground">or any CV/resume PDF</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={e => setFile(e.target.files[0])} />
              </div>
              <Button onClick={extract} disabled={!file || loading}
                className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold gap-2 text-sm">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Extracting...</>
                  : <><Sparkles className="w-4 h-4" />Parse & Extract</>}
              </Button>
            </div>
          )}
        </div>

        {/* Result */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">Profile extracted! Review and save below.</span>
                  </div>
                </div>

                <div className="bg-card ink-border rounded-2xl p-5 space-y-4 max-h-[55vh] overflow-y-auto">
                  {FIELD_SECTIONS.map(field => {
                    const Icon = field.icon;
                    const val = result[field.key] || "";
                    return (
                      <div key={field.key}>
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          <Icon className="w-3.5 h-3.5" />{field.label}
                          {!val && <span className="text-amber-500 font-normal normal-case tracking-normal">(not found)</span>}
                        </label>
                        {field.multiline ? (
                          <Textarea defaultValue={val} className="text-sm resize-none min-h-[80px] bg-background"
                            placeholder={`${field.label} not found in profile`} />
                        ) : (
                          <Input defaultValue={val} className="text-sm bg-background" placeholder={`${field.label} not found`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Send to destinations */}
                <div className="bg-muted/40 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Send to</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Resume Builder", onClick: sendToResume, color: "bg-accent text-accent-foreground" },
                      { label: "Career Matcher", onClick: sendToMatcher, color: "bg-green-600 text-white" },
                      { label: "CV Vault", onClick: sendToVault, color: "bg-primary text-primary-foreground" },
                    ].map(btn => (
                      <Button key={btn.label} onClick={btn.onClick} size="sm"
                        className={`rounded-xl h-10 text-xs font-semibold ${btn.color}`}>
                        {btn.label} <ChevronRight className="w-3 h-3" />
                      </Button>
                    ))}
                  </div>

                  {/* Sync to Vault */}
                  <div className="pt-1 border-t border-border">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-xs font-bold text-foreground">Sync with CV Vault</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Keep work history, skills & endorsements in sync</p>
                      </div>
                      <Button onClick={syncToVault} disabled={syncing} size="sm"
                        className="rounded-xl h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                        {syncing
                          ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Syncing...</>
                          : <><RefreshCw className="w-3 h-3" /> Sync Now</>}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : !loading ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 bg-card ink-border rounded-2xl text-center p-10">
                <Linkedin className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm font-semibold text-foreground mb-2">Your extracted profile will appear here</p>
                <p className="text-xs text-muted-foreground max-w-xs">Paste a LinkedIn URL or upload your PDF export, then review and send your profile to Resume Builder, Career Matcher, or CV Vault.</p>
              </motion.div>
            ) : (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 bg-card ink-border rounded-2xl text-center gap-4">
                <div className="w-10 h-10 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Extracting your profile with AI...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}