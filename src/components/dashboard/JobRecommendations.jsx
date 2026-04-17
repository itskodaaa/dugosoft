import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase, MapPin, DollarSign, Sparkles,
  Loader2, RefreshCw, X, CheckCircle2, Building2, Clock, BarChart3
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import SalaryAnalysisModal from "@/components/salary/SalaryAnalysisModal";

function CoverLetterModal({ job, onClose }) {
  const [loading, setLoading] = useState(true);
  const [letter, setLetter] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    generateLetter();
  }, []);

  const generateLetter = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a professional cover letter for the following job posting. Make it compelling, personalized, and ATS-optimized.

Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Job Description: ${job.description}
Required Skills: ${job.skills?.join(", ")}

Applicant Name: ${user?.full_name || "Applicant"}
Applicant Background: ${user?.job_title || "Experienced professional"} with skills in ${user?.skills || job.skills?.join(", ")}

Write a 3-paragraph cover letter: opening hook, value proposition, and a strong closing call-to-action. Keep it under 300 words. Start directly with "Dear Hiring Manager," — no subject line.`,
      });
      setLetter(res);
    } catch {
      toast.error("Failed to generate cover letter.");
    }
    setLoading(false);
  };

  const copyText = () => {
    navigator.clipboard.writeText(letter);
    toast.success("Cover letter copied!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div>
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> AI Cover Letter
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{job.title} @ {job.company}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-sm text-muted-foreground">Generating your personalized cover letter…</p>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-xl p-5 text-sm text-foreground leading-relaxed whitespace-pre-wrap font-serif">
              {letter}
            </div>
          )}
        </div>

        {!loading && (
          <div className="p-5 border-t border-border flex items-center gap-3 shrink-0">
            <Button onClick={copyText} className="bg-accent hover:bg-accent/90 text-white rounded-xl gap-2 flex-1">
              <CheckCircle2 className="w-4 h-4" /> Copy Cover Letter
            </Button>
            <Button onClick={generateLetter} variant="outline" className="rounded-xl gap-2">
              <RefreshCw className="w-4 h-4" /> Regenerate
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function JobRecommendations({ userSkills = [] }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [salaryJob, setSalaryJob] = useState(null);
  const [generated, setGenerated] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const skills = userSkills.length > 0
        ? userSkills
        : (user?.skills || "software engineering, project management, communication").split(",").map(s => s.trim());

      const jobTitle = user?.job_title || "Professional";
      const experience = user?.experience_years || "3-5 years";

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 6 realistic and targeted job recommendations for a professional with the following profile:
        
Job Title / Role: ${jobTitle}
Skills: ${skills.join(", ")}
Experience: ${experience}
Location preference: Remote / Global

For each job, provide realistic company names, salary ranges, and a brief description. Make the jobs varied in seniority and company size.`,
        response_json_schema: {
          type: "object",
          properties: {
            jobs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  company: { type: "string" },
                  location: { type: "string" },
                  salary: { type: "string" },
                  type: { type: "string" },
                  match_score: { type: "number" },
                  description: { type: "string" },
                  skills: { type: "array", items: { type: "string" } },
                  posted: { type: "string" },
                  logo_color: { type: "string" },
                }
              }
            }
          }
        }
      });
      setJobs(res.jobs || []);
      setGenerated(true);
    } catch {
      toast.error("Failed to load job recommendations.");
    }
    setLoading(false);
  };

  const getMatchColor = (score) => {
    if (score >= 85) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 70) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-muted-foreground" /> Job Recommendations
        </h2>
        <Button
          onClick={fetchJobs}
          disabled={loading}
          size="sm"
          variant={generated ? "outline" : "default"}
          className={`rounded-full gap-2 text-xs font-semibold ${!generated ? "bg-accent hover:bg-accent/90 text-white" : ""}`}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {generated ? "Refresh" : "Find My Jobs"}
        </Button>
      </div>

      {!generated && !loading && (
        <div className="bg-card ink-border rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-accent" />
          </div>
          <h3 className="font-bold text-foreground mb-2">AI-Powered Job Matching</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
            Get personalized job recommendations based on your skills and profile, with instant AI cover letters.
          </p>
          <Button onClick={fetchJobs} className="bg-accent hover:bg-accent/90 text-white rounded-full px-6 gap-2">
            <Sparkles className="w-4 h-4" /> Find My Jobs
          </Button>
        </div>
      )}

      {loading && (
        <div className="bg-card ink-border rounded-2xl p-10 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Finding the best jobs for your profile…</p>
        </div>
      )}

      {generated && !loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card ink-border rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm"
                  style={{ background: job.logo_color || "#4f8ef7" }}>
                  {job.company?.[0] || "C"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{job.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {job.company}
                  </p>
                </div>
                <Badge className={`text-[10px] font-bold px-2 border ${getMatchColor(job.match_score)} shrink-0`}>
                  {job.match_score}% match
                </Badge>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salary}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.posted}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{job.description}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1">
                {(job.skills || []).slice(0, 3).map((skill, si) => (
                  <span key={si} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-1 flex-wrap">
                <Button
                  onClick={() => setSelectedJob(job)}
                  size="sm"
                  className="flex-1 h-8 rounded-xl text-xs bg-accent hover:bg-accent/90 text-white gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Apply with AI
                </Button>
                <Button
                  onClick={() => setSalaryJob(job)}
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-xl text-xs gap-1 px-3 border-green-200 text-green-700 hover:bg-green-50"
                >
                  <BarChart3 className="w-3 h-3" /> Salary
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedJob && (
          <CoverLetterModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
        {salaryJob && (
          <SalaryAnalysisModal job={salaryJob} onClose={() => setSalaryJob(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}