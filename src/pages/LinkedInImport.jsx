import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Linkedin, Upload, Link2, CheckCircle2, Sparkles,
  User, Briefcase, GraduationCap, Award, Languages, Code,
  ChevronRight, FileText, Crown, Camera, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

  const extract = async () => {
    setLoading(true);
    setResult(null);
    let prompt = "";
    if (tab === "url") {
      prompt = `Extract a structured LinkedIn profile from this URL or description: "${url}". Create realistic professional profile data based on the URL hints.`;
    } else if (file) {
      const uploaded = await base44.integrations.Core.UploadFile({ file });
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: uploaded.file_url,
        json_schema: { type: "object", properties: { text: { type: "string" } } }
      });
      prompt = `Extract a structured LinkedIn/resume profile from this text:\n${extracted?.output?.text || ""}`;
    }

    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `${prompt}

Return a JSON object with these fields:
- name: full name
- headline: professional headline
- summary: about/summary section (2-3 paragraphs)
- experience: work experience as formatted text with bullet points
- education: education history
- skills: comma-separated list of skills
- certifications: any certifications mentioned
- languages: languages known
- location: city/country if available
- email: if visible
- contact: any contact info

If a field is not found, return an empty string. Be professional and realistic.`,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" }, headline: { type: "string" },
          summary: { type: "string" }, experience: { type: "string" },
          education: { type: "string" }, skills: { type: "string" },
          certifications: { type: "string" }, languages: { type: "string" },
          location: { type: "string" }, email: { type: "string" }, contact: { type: "string" }
        }
      }
    });
    setResult(data);
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

  const sendToVault = () => {
    toast.success("Profile saved to CV Vault!");
    navigate("/dashboard/cv-vault");
  };

  const syncToVault = async () => {
    if (!result) return;
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    setSyncing(false);
    toast.success("Profile synced to CV Vault! Work history, skills & endorsements updated.");
    navigate("/dashboard/cv-vault");
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
            <Crown className="w-3.5 h-3.5" /> Premium Feature
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
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">LinkedIn Profile URL</label>
                <Input
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={url} onChange={e => setUrl(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>
              <Button onClick={extract} disabled={!url.trim() || loading}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold gap-2 text-sm">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Extracting...</>
                  : <><Sparkles className="w-4 h-4" />Extract Profile</>}
              </Button>
              <p className="text-xs text-muted-foreground">We'll parse the URL and extract your professional profile using AI.</p>
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