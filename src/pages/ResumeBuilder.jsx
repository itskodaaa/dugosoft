import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, Download, Check } from "lucide-react";
import ProcessingBorder from "../components/shared/ProcessingBorder";
import { toast } from "sonner";

const PLACEHOLDER_RESUME = `JOHN DOE
Software Engineer

PROFESSIONAL SUMMARY
Results-driven software engineer with 5+ years of experience in full-stack development. Proficient in React, Node.js, and cloud technologies. Proven track record of delivering scalable applications and leading cross-functional teams.

WORK EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2021 – Present
• Led development of microservices architecture serving 2M+ users
• Reduced API response time by 40% through optimization
• Mentored 3 junior developers and conducted code reviews

Software Engineer | StartupXYZ | 2019 – 2021
• Built customer-facing dashboard using React and TypeScript
• Implemented CI/CD pipelines reducing deployment time by 60%
• Collaborated with product team on 12+ feature releases

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, PostgreSQL, MongoDB, Git, REST APIs, GraphQL

EDUCATION
B.S. Computer Science | State University | 2019
GPA: 3.8/4.0 | Dean's List`;

export default function ResumeBuilder() {
  const [formData, setFormData] = useState({
    fullName: "",
    summary: "",
    experience: "",
    skills: "",
    education: "",
    targetRole: "",
  });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    setProcessing(true);
    setResult("");
    setTimeout(() => {
      setResult(PLACEHOLDER_RESUME);
      setProcessing(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Resume copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">
          Resume Builder
        </h1>
        <p className="text-muted-foreground mb-8">
          Fill in your details and let AI generate an ATS-optimized resume.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input pane */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-5">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                Full Name
              </Label>
              <Input
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent transition-colors"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                Target Job Role
              </Label>
              <Input
                placeholder="Senior Software Engineer"
                value={formData.targetRole}
                onChange={(e) => handleChange("targetRole", e.target.value)}
                className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent transition-colors"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                Professional Summary
              </Label>
              <Textarea
                placeholder="Brief summary of your professional background..."
                value={formData.summary}
                onChange={(e) => handleChange("summary", e.target.value)}
                className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent transition-colors min-h-[80px] resize-none"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                Work Experience
              </Label>
              <Textarea
                placeholder="List your work experience..."
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent transition-colors min-h-[100px] resize-none"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                Skills
              </Label>
              <Input
                placeholder="React, Node.js, Python, AWS..."
                value={formData.skills}
                onChange={(e) => handleChange("skills", e.target.value)}
                className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent transition-colors"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                Education
              </Label>
              <Input
                placeholder="B.S. Computer Science, MIT, 2019"
                value={formData.education}
                onChange={(e) => handleChange("education", e.target.value)}
                className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent transition-colors"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={processing}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-12 font-semibold gap-2 mt-4"
            >
              {processing ? (
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
          </div>
        </motion.div>

        {/* Output pane */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProcessingBorder processing={processing}>
            <div className="p-6 min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Preview
                </h2>
                {result && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="rounded-full h-8 text-xs gap-1.5"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full h-8 text-xs gap-1.5"
                      onClick={() => toast.info("Download will be available in the full version")}
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  </div>
                )}
              </div>

              {result ? (
                <div className="bg-white rounded-lg p-8 shadow-sm ink-border">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed">
                    {result}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
                  {processing
                    ? "AI is generating your resume..."
                    : "Fill in your details and click Generate to preview your resume."}
                </div>
              )}
            </div>
          </ProcessingBorder>
        </motion.div>
      </div>
    </div>
  );
}