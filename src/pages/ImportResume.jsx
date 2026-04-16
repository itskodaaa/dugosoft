import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload, FileText, Loader2, CheckCircle2, Sparkles,
  User, Briefcase, GraduationCap, Wrench, Mail, Phone,
  MapPin, Globe, ArrowRight, RefreshCw, AlertCircle, Download
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SECTION_ICONS = {
  contact: { icon: User, color: "text-blue-500", bg: "bg-blue-500/10" },
  summary: { icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10" },
  experience: { icon: Briefcase, color: "text-orange-500", bg: "bg-orange-500/10" },
  education: { icon: GraduationCap, color: "text-green-500", bg: "bg-green-500/10" },
  skills: { icon: Wrench, color: "text-accent", bg: "bg-accent/10" },
};

export default function ImportResume() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "text/plain"];
    if (!validTypes.includes(f.type) && !f.name.match(/\.(pdf|docx?|txt)$/i)) {
      toast.error("Please upload a PDF, Word (.docx), or text file.");
      return;
    }
    setFile(f);
    setParsed(null);
    setSaved(false);
  };

  const parseResume = async () => {
    if (!file) return;
    setParsing(true);
    try {
      // Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extract structured data using AI
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            full_name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            location: { type: "string" },
            linkedin: { type: "string" },
            website: { type: "string" },
            job_title: { type: "string" },
            summary: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company: { type: "string" },
                  title: { type: "string" },
                  start_date: { type: "string" },
                  end_date: { type: "string" },
                  description: { type: "string" },
                }
              }
            },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  institution: { type: "string" },
                  degree: { type: "string" },
                  field: { type: "string" },
                  year: { type: "string" },
                }
              }
            },
            languages: { type: "array", items: { type: "string" } },
            certifications: { type: "array", items: { type: "string" } },
          }
        }
      });

      if (result.status === "success") {
        setParsed(result.output);
      } else {
        toast.error("Could not parse this file. Try a cleaner PDF or text-based resume.");
      }
    } catch (e) {
      toast.error("Failed to parse resume. Please try again.");
    }
    setParsing(false);
  };

  const saveToProfile = async () => {
    if (!parsed) return;
    setSaving(true);
    try {
      // Save profile data to user entity
      const updates = {
        job_title: parsed.job_title || user?.job_title,
        skills: parsed.skills?.join(", ") || user?.skills,
        phone: parsed.phone || user?.phone,
        location: parsed.location || user?.location,
        linkedin_url: parsed.linkedin || user?.linkedin_url,
        resume_summary: parsed.summary,
        experience_years: parsed.experience?.length > 0
          ? `${parsed.experience.length}+ roles`
          : user?.experience_years,
      };
      await base44.auth.updateMe(updates);
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);

      // Save as a resume project
      const resumeData = JSON.stringify({
        personalInfo: {
          fullName: parsed.full_name || user?.full_name,
          email: parsed.email || user?.email,
          phone: parsed.phone || "",
          location: parsed.location || "",
          linkedin: parsed.linkedin || "",
          website: parsed.website || "",
          title: parsed.job_title || "",
          summary: parsed.summary || "",
        },
        experience: parsed.experience || [],
        education: parsed.education || [],
        skills: parsed.skills || [],
        languages: parsed.languages || [],
        certifications: parsed.certifications || [],
      });

      await base44.entities.ResumeProject.create({
        title: `${parsed.full_name || "My"} Resume — Imported`,
        resume_data: resumeData,
        status: "complete",
        template_id: "modern",
        template_name: "Modern",
      });

      setSaved(true);
      toast.success("Profile updated and resume saved to your library!");
    } catch (e) {
      toast.error("Failed to save. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Import Resume</h1>
            <p className="text-sm text-muted-foreground">Upload your existing CV — AI will parse and populate your profile automatically.</p>
          </div>
        </div>
      </motion.div>

      {/* Upload Zone */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
            dragging ? "border-accent bg-accent/5 scale-[1.01]" :
            file ? "border-green-400 bg-green-50 dark:bg-green-500/5" :
            "border-border bg-card hover:border-accent/50 hover:bg-accent/3"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <FileText className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">Ready to parse</Badge>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Upload className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Drop your resume here</p>
                <p className="text-sm text-muted-foreground mt-1">or <span className="text-accent font-semibold">click to browse</span></p>
              </div>
              <div className="flex gap-2 mt-1">
                {["PDF", "DOCX", "DOC", "TXT"].map(f => (
                  <span key={f} className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {file && !parsed && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={parseResume}
              disabled={parsing}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 gap-2 font-bold"
            >
              {parsing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing resume…</>
                : <><Sparkles className="w-4 h-4" /> Parse with AI</>}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Parsing progress */}
      <AnimatePresence>
        {parsing && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-card ink-border rounded-2xl p-6 text-center">
            <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-3" />
            <p className="font-semibold text-foreground">AI is reading your resume…</p>
            <p className="text-sm text-muted-foreground mt-1">Extracting contact info, experience, skills, and education.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parsed Results */}
      <AnimatePresence>
        {parsed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Success banner */}
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-green-800 dark:text-green-400">Resume successfully parsed!</p>
                <p className="text-xs text-green-700 dark:text-green-500">Review the extracted data below, then save to your profile.</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-card ink-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="font-bold text-foreground">Contact Information</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: User, label: "Name", value: parsed.full_name },
                  { icon: Mail, label: "Email", value: parsed.email },
                  { icon: Phone, label: "Phone", value: parsed.phone },
                  { icon: MapPin, label: "Location", value: parsed.location },
                  { icon: Globe, label: "LinkedIn", value: parsed.linkedin },
                  { icon: Briefcase, label: "Job Title", value: parsed.job_title },
                ].filter(f => f.value).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-semibold text-foreground truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {parsed.summary && (
              <div className="bg-card ink-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                  </div>
                  <h3 className="font-bold text-foreground">Professional Summary</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{parsed.summary}</p>
              </div>
            )}

            {/* Skills */}
            {parsed.skills?.length > 0 && (
              <div className="bg-card ink-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground">Skills ({parsed.skills.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsed.skills.map((skill, i) => (
                    <span key={i} className="text-xs bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {parsed.experience?.length > 0 && (
              <div className="bg-card ink-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-foreground">Experience ({parsed.experience.length} roles)</h3>
                </div>
                <div className="space-y-3">
                  {parsed.experience.map((exp, i) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
                        <div>
                          <p className="text-sm font-bold text-foreground">{exp.title}</p>
                          <p className="text-xs text-muted-foreground">{exp.company}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {exp.start_date} — {exp.end_date || "Present"}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {parsed.education?.length > 0 && (
              <div className="bg-card ink-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-green-500" />
                  </div>
                  <h3 className="font-bold text-foreground">Education</h3>
                </div>
                <div className="space-y-3">
                  {parsed.education.map((edu, i) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-xl flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">{edu.degree} {edu.field ? `in ${edu.field}` : ""}</p>
                        <p className="text-xs text-muted-foreground">{edu.institution}</p>
                      </div>
                      {edu.year && <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{edu.year}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pb-4">
              {saved ? (
                <div className="flex-1 flex items-center justify-center gap-2 bg-green-50 dark:bg-green-500/10 border border-green-200 rounded-2xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-bold text-green-800 dark:text-green-400 text-sm">Saved to your profile!</p>
                    <p className="text-xs text-green-700 dark:text-green-500">Resume added to your library.</p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={saveToProfile}
                  disabled={saving}
                  size="lg"
                  className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-2xl gap-2 font-bold h-12"
                >
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : <><CheckCircle2 className="w-4 h-4" /> Save to Profile & Resume Library</>}
                </Button>
              )}
              {saved && (
                <Button
                  onClick={() => navigate("/dashboard/resume-builder-v2")}
                  size="lg"
                  className="bg-foreground hover:bg-foreground/90 text-background rounded-2xl gap-2 font-bold h-12"
                >
                  Open in Resume Builder <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={() => { setFile(null); setParsed(null); setSaved(false); }}
                variant="outline"
                size="lg"
                className="rounded-2xl h-12 gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Start Over
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}