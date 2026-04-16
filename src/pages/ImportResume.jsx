import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Upload, FileText, CheckCircle2, Loader2, X, Sparkles,
  User, Briefcase, GraduationCap, Code, Award, ArrowRight, RefreshCw
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ACCEPT = ".pdf,.doc,.docx";

function DataSection({ icon: Icon, title, color, children }) {
  return (
    <div className="bg-card ink-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm font-bold text-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function ImportResume() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState("upload"); // upload | result

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      toast.error("Please upload a PDF or Word document.");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const processFile = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploading(false);
      setParsing(true);

      const res = await base44.functions.invoke("parseResume", {
        file_url,
        file_name: file.name,
      });

      if (res.data?.success) {
        setResult(res.data);
        setStep("result");
        toast.success(res.data.message || "Resume parsed successfully!");
      } else {
        toast.error(res.data?.error || "Failed to parse resume.");
      }
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
    }
    setUploading(false);
    setParsing(false);
  };

  const data = result?.data;

  return (
    <div className="max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
          <Upload className="w-6 h-6 text-accent" /> AI Resume Importer
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload your PDF or Word resume — AI will extract your skills, experience, and education to power your entire dashboard.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                dragging ? "border-accent bg-accent/5" : file ? "border-green-400 bg-green-50" : "border-border hover:border-accent/50 hover:bg-muted/30"
              }`}
            >
              <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                  <div>
                    <p className="font-bold text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB · Ready to analyze</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setFile(null); }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive font-semibold">
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground mb-1">Drop your resume here</p>
                    <p className="text-sm text-muted-foreground">PDF, DOC, or DOCX · Up to 10MB</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Browse Files
                  </Button>
                </div>
              )}
            </div>

            {/* What gets extracted */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: User, label: "Contact Info", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: Code, label: "Skills", color: "text-accent", bg: "bg-accent/10" },
                { icon: Briefcase, label: "Work History", color: "text-orange-500", bg: "bg-orange-500/10" },
                { icon: GraduationCap, label: "Education", color: "text-green-500", bg: "bg-green-500/10" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-card ink-border rounded-xl p-3 flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg}`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{item.label}</span>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={processFile}
              disabled={!file || uploading || parsing}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-white rounded-xl font-semibold gap-2 text-sm"
            >
              {uploading && <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>}
              {parsing && <><Loader2 className="w-4 h-4 animate-spin" /> AI is reading your resume...</>}
              {!uploading && !parsing && <><Sparkles className="w-4 h-4" /> Analyze Resume with AI</>}
            </Button>

            {parsing && (
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-center">
                <p className="text-sm text-accent font-semibold">🤖 Extracting skills, experience, and education from your resume...</p>
                <p className="text-xs text-muted-foreground mt-1">This takes about 10–20 seconds</p>
              </div>
            )}
          </motion.div>
        )}

        {step === "result" && data && (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {/* Success banner */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-green-800">Resume Parsed Successfully!</p>
                <p className="text-xs text-green-700 mt-0.5">{result.message}</p>
              </div>
              <button onClick={() => { setStep("upload"); setFile(null); setResult(null); }}
                className="text-xs font-semibold text-green-700 hover:underline flex items-center gap-1 shrink-0">
                <RefreshCw className="w-3 h-3" /> Import Another
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Contact */}
              <DataSection icon={User} title="Contact Info" color="text-blue-500">
                <div className="space-y-1 text-xs text-muted-foreground">
                  {data.full_name && <p><span className="font-semibold text-foreground">Name:</span> {data.full_name}</p>}
                  {data.headline && <p><span className="font-semibold text-foreground">Title:</span> {data.headline}</p>}
                  {data.email && <p><span className="font-semibold text-foreground">Email:</span> {data.email}</p>}
                  {data.location && <p><span className="font-semibold text-foreground">Location:</span> {data.location}</p>}
                  {data.seniority_level && <p><span className="font-semibold text-foreground">Level:</span> {data.seniority_level}</p>}
                  {data.years_of_experience && <p><span className="font-semibold text-foreground">Experience:</span> {data.years_of_experience} years</p>}
                </div>
              </DataSection>

              {/* Skills */}
              <DataSection icon={Code} title={`Skills (${data.skills?.length || 0})`} color="text-accent">
                <div className="flex flex-wrap gap-1">
                  {(data.skills || []).slice(0, 15).map((s, i) => (
                    <span key={i} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">{s}</span>
                  ))}
                  {data.skills?.length > 15 && (
                    <span className="text-[10px] text-muted-foreground px-2 py-0.5">+{data.skills.length - 15} more</span>
                  )}
                </div>
              </DataSection>

              {/* Experience */}
              <DataSection icon={Briefcase} title={`Work History (${data.experience?.length || 0})`} color="text-orange-500">
                <div className="space-y-2">
                  {(data.experience || []).map((e, i) => (
                    <div key={i} className="border-l-2 border-orange-200 pl-2">
                      <p className="text-xs font-bold text-foreground">{e.title}</p>
                      <p className="text-[11px] text-muted-foreground">{e.company} · {e.period}</p>
                    </div>
                  ))}
                </div>
              </DataSection>

              {/* Education */}
              <DataSection icon={GraduationCap} title={`Education (${data.education?.length || 0})`} color="text-green-500">
                <div className="space-y-2">
                  {(data.education || []).map((e, i) => (
                    <div key={i} className="border-l-2 border-green-200 pl-2">
                      <p className="text-xs font-bold text-foreground">{e.degree} {e.field ? `in ${e.field}` : ""}</p>
                      <p className="text-[11px] text-muted-foreground">{e.institution} · {e.year}</p>
                    </div>
                  ))}
                </div>
              </DataSection>
            </div>

            {/* Certifications */}
            {data.certifications?.length > 0 && (
              <DataSection icon={Award} title="Certifications" color="text-purple-500">
                <div className="flex flex-wrap gap-1.5">
                  {data.certifications.map((c, i) => (
                    <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">{c}</span>
                  ))}
                </div>
              </DataSection>
            )}

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/dashboard/career-matcher")}
                className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-xl gap-2 h-11">
                <Sparkles className="w-4 h-4" /> Use for Job Matching
              </Button>
              <Button onClick={() => navigate("/dashboard/resume-builder-v2")} variant="outline"
                className="flex-1 rounded-xl gap-2 h-11">
                <FileText className="w-4 h-4" /> Edit in Resume Builder <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}