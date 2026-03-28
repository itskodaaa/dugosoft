import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, Download, Check, PenLine, FileUp } from "lucide-react";
import ProcessingBorder from "../components/shared/ProcessingBorder";
import FileUpload from "../components/shared/FileUpload";
import InputModeToggle from "../components/shared/InputModeToggle";
import StatusBadge from "../components/shared/StatusBadge";
import { toast } from "sonner";

const PLACEHOLDER_RESUME = `JOHN DOE
Software Engineer · john.doe@email.com · LinkedIn: linkedin.com/in/johndoe

═══════════════════════════════════════════════════════════

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 5+ years of experience in full-stack development. Proficient in React, Node.js, and cloud technologies with a proven track record of delivering scalable applications serving millions of users.

WORK EXPERIENCE

Senior Software Engineer | TechCorp Inc. | Jan 2021 – Present
• Led development of microservices architecture serving 2M+ active users
• Reduced API response time by 40% through Redis caching and query optimization  
• Mentored 3 junior developers and established code review processes
• Delivered 8 major product features ahead of schedule

Software Engineer | StartupXYZ | Mar 2019 – Dec 2020
• Built customer-facing dashboard with React and TypeScript (50K+ DAU)
• Implemented CI/CD pipelines, reducing deployment time by 60%
• Collaborated with product team on 12+ feature releases
• Improved test coverage from 45% to 88%

SKILLS
Languages: JavaScript, TypeScript, Python, SQL
Frontend: React, Next.js, Tailwind CSS, Redux
Backend: Node.js, Express, FastAPI, GraphQL
Cloud & DevOps: AWS, Docker, Kubernetes, GitHub Actions
Databases: PostgreSQL, MongoDB, Redis

EDUCATION
B.S. Computer Science | State University | 2019
GPA: 3.8/4.0 | Dean's List | Senior Thesis: Distributed Systems Optimization

CERTIFICATIONS
• AWS Certified Solutions Architect – Associate (2023)
• Google Cloud Professional Developer (2022)`;

const PARSED_CV = {
  fullName: "Maria Rossi",
  targetRole: "Senior Product Manager",
  summary: "Experienced Product Manager with 6 years driving product strategy at B2B SaaS companies. Led cross-functional teams of 15+, launched 4 flagship products, and grew ARR from $2M to $18M.",
  experience: "Senior PM | CloudSoft Ltd. | 2020–Present\n• Owned roadmap for core analytics product (12K+ users)\n• Increased user retention by 32% through data-driven redesign\n\nProduct Manager | DataPipe Inc. | 2018–2020\n• Launched 3 integrations generating $2M ARR\n• Managed backlog of 200+ user stories",
  skills: "Product Strategy, Agile/Scrum, Roadmapping, A/B Testing, SQL, Figma, JIRA, Mixpanel, Amplitude",
  education: "MBA, Business Strategy | Bocconi University | 2018\nB.Sc. Economics | University of Milan | 2016",
};

const inputModes = [
  { value: "manual", label: "Manual Input", icon: PenLine },
  { value: "upload", label: "Upload Existing CV", icon: FileUp },
];

export default function ResumeBuilder() {
  const [inputMode, setInputMode] = useState("manual");
  const [cvFile, setCvFile] = useState(null);
  const [parsedCV, setParsedCV] = useState(null);
  const [parsingStatus, setParsingStatus] = useState("idle");

  const [formData, setFormData] = useState({
    fullName: "", summary: "", experience: "", skills: "", education: "", targetRole: "",
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleCVUpload = (file) => {
    setCvFile(file);
    setParsingStatus("processing");
    setParsedCV(null);
    setTimeout(() => {
      setParsedCV(PARSED_CV);
      setFormData(PARSED_CV);
      setParsingStatus("complete");
      toast.success("CV parsed successfully — review and edit below");
    }, 2000);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setResult("");
    setTimeout(() => {
      setResult(PLACEHOLDER_RESUME);
      setGenerating(false);
    }, 2200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Resume copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModeChange = (mode) => {
    setInputMode(mode);
    setResult("");
    if (mode === "manual") {
      setFormData({ fullName: "", summary: "", experience: "", skills: "", education: "", targetRole: "" });
      setCvFile(null);
      setParsedCV(null);
      setParsingStatus("idle");
    }
  };

  const activeData = parsedCV && inputMode === "upload" ? formData : formData;
  const canGenerate = inputMode === "manual"
    ? formData.fullName.trim().length > 0
    : parsedCV !== null;

  const fieldStyle = "bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent transition-colors";

  return (
    <div className="max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">Resume Builder</h1>
        <p className="text-muted-foreground mb-6">
          Fill in your details manually or upload your existing CV to generate an ATS-optimized resume.
        </p>
      </motion.div>

      {/* Mode toggle */}
      <div className="mb-6">
        <InputModeToggle modes={inputModes} active={inputMode} onChange={handleModeChange} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input pane */}
        <motion.div
          key={inputMode}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Upload mode: show uploader, then parsed form */}
          {inputMode === "upload" && (
            <div className="mb-6">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
                Upload Your CV
              </Label>
              <FileUpload
                accept=".pdf,.docx,.doc"
                acceptLabel="PDF, DOCX — your existing resume or CV"
                file={cvFile}
                onFile={handleCVUpload}
                onRemove={() => {
                  setCvFile(null);
                  setParsedCV(null);
                  setParsingStatus("idle");
                  setFormData({ fullName: "", summary: "", experience: "", skills: "", education: "", targetRole: "" });
                  setResult("");
                }}
              />
              {parsingStatus !== "idle" && (
                <div className="mt-3 flex items-center gap-2">
                  <StatusBadge
                    status={parsingStatus}
                    label={parsingStatus === "processing" ? "Parsing CV..." : "CV parsed — review below"}
                  />
                </div>
              )}
            </div>
          )}

          {/* Form — shown always (upload mode shows it after parsing) */}
          <AnimatePresence>
            {(inputMode === "manual" || parsedCV) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {parsedCV && inputMode === "upload" && (
                  <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-xs text-accent font-medium">
                    ✦ Parsed from your CV — edit any field before generating
                  </div>
                )}

                <div>
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Full Name</Label>
                  <Input placeholder="John Doe" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} className={fieldStyle} />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Target Job Role</Label>
                  <Input placeholder="Senior Software Engineer" value={formData.targetRole} onChange={(e) => handleChange("targetRole", e.target.value)} className={fieldStyle} />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Professional Summary</Label>
                  <Textarea placeholder="Brief summary of your background..." value={formData.summary} onChange={(e) => handleChange("summary", e.target.value)} className={`${fieldStyle} min-h-[80px] resize-none`} />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Work Experience</Label>
                  <Textarea placeholder="Company | Role | Dates &#10;• Achievement 1&#10;• Achievement 2" value={formData.experience} onChange={(e) => handleChange("experience", e.target.value)} className={`${fieldStyle} min-h-[110px] resize-none`} />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Skills</Label>
                  <Input placeholder="React, Node.js, Python, AWS..." value={formData.skills} onChange={(e) => handleChange("skills", e.target.value)} className={fieldStyle} />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Education</Label>
                  <Input placeholder="B.S. Computer Science, MIT, 2019" value={formData.education} onChange={(e) => handleChange("education", e.target.value)} className={fieldStyle} />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating || !canGenerate}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-12 font-semibold gap-2 mt-2"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate ATS Resume
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Waiting for upload */}
          {inputMode === "upload" && !parsedCV && parsingStatus === "idle" && (
            <div className="p-5 rounded-xl ink-border bg-muted/30 text-center text-sm text-muted-foreground">
              Upload your CV above to auto-fill the form and generate an improved ATS version.
            </div>
          )}
        </motion.div>

        {/* Output pane */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Resume Preview</Label>
            {generating && <StatusBadge status="processing" label="Generating..." />}
          </div>

          <ProcessingBorder processing={generating}>
            <div className="p-6 min-h-[520px]">
              {result ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-white rounded-lg p-8 shadow-sm ink-border mb-4 max-h-[400px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-xs text-foreground leading-relaxed">
                      {result}
                    </pre>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopy} className="rounded-full h-8 text-xs gap-1.5">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy Text"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full h-8 text-xs gap-1.5"
                      onClick={() => toast.success("PDF download started (simulated)")}
                    >
                      <Download className="w-3 h-3" />
                      Download PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full h-8 text-xs gap-1.5"
                      onClick={() => toast.success("DOCX download started (simulated)")}
                    >
                      <Download className="w-3 h-3" />
                      Download DOCX
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[440px] text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {generating
                      ? "AI is generating your ATS-optimized resume..."
                      : "Fill in your details or upload a CV, then click Generate."}
                  </p>
                </div>
              )}
            </div>
          </ProcessingBorder>
        </motion.div>
      </div>
    </div>
  );
}