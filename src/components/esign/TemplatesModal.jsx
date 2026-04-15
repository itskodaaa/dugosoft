import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, FileText, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const TEMPLATES = [
  {
    id: "nda",
    label: "Non-Disclosure Agreement",
    desc: "Standard NDA for freelancers and contractors.",
    icon: "🔒",
    fields: ["signature", "name", "date"],
    content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of [DATE] between the parties.

1. CONFIDENTIAL INFORMATION
The parties agree to keep all shared information strictly confidential.

2. OBLIGATIONS
Neither party shall disclose confidential information to third parties.

3. TERM
This agreement is effective for 2 years from the date of signing.

4. SIGNATURES

Party A: ___________________   Date: ___________
Party B: ___________________   Date: ___________`,
  },
  {
    id: "offer",
    label: "Job Offer Letter",
    desc: "Formal employment offer with terms.",
    icon: "💼",
    fields: ["signature", "name", "date"],
    content: `JOB OFFER LETTER

Dear [Candidate Name],

We are pleased to offer you the position of [Job Title] at [Company Name].

START DATE: [Start Date]
SALARY: [Salary]
BENEFITS: As per company policy.

Please sign below to accept this offer.

Candidate Signature: ___________________   Date: ___________
HR Representative:   ___________________   Date: ___________`,
  },
  {
    id: "freelance",
    label: "Freelance Contract",
    desc: "Service agreement for freelance projects.",
    icon: "✏️",
    fields: ["signature", "name", "date"],
    content: `FREELANCE SERVICE AGREEMENT

This agreement is between [Client Name] ("Client") and [Freelancer Name] ("Freelancer").

PROJECT SCOPE: [Description of services]
TIMELINE: [Start Date] to [End Date]
PAYMENT: [Amount] due upon completion.

TERMS:
- Freelancer retains copyright until full payment received.
- Client may request 1 revision.

Client Signature:     ___________________   Date: ___________
Freelancer Signature: ___________________   Date: ___________`,
  },
  {
    id: "consent",
    label: "Media Consent Form",
    desc: "Photo/video release and usage consent.",
    icon: "📸",
    fields: ["signature", "name", "date"],
    content: `MEDIA CONSENT FORM

I, [Full Name], hereby grant [Organization Name] permission to use my likeness in photographs, video recordings, and other media.

PURPOSE: [Describe usage]
DURATION: Indefinite
COMPENSATION: None

I understand this consent is voluntary and may be revoked in writing.

Signature: ___________________   Date: ___________
Full Name: ___________________`,
  },
  {
    id: "rental",
    label: "Rental Agreement",
    desc: "Simple property rental contract.",
    icon: "🏠",
    fields: ["signature", "name", "date"],
    content: `RENTAL AGREEMENT

Landlord: [Landlord Name]
Tenant:   [Tenant Name]
Property: [Property Address]

TERM: [Start Date] to [End Date]
RENT: [Amount] per month, due on the 1st.
DEPOSIT: [Deposit Amount]

Both parties agree to the terms above.

Landlord Signature: ___________________   Date: ___________
Tenant Signature:   ___________________   Date: ___________`,
  },
];

export default function TemplatesModal({ onClose }) {
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleUse = async () => {
    if (!selected) return;
    setCreating(true);
    const blob = new Blob([selected.content], { type: "text/plain" });
    const file = new File([blob], `${selected.id}_template.txt`, { type: "text/plain" });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const doc = await base44.entities.ESignDocument.create({
      title: selected.label,
      file_url,
      status: "draft",
    });
    setCreating(false);
    toast.success(`"${selected.label}" created from template!`);
    onClose();
    navigate(`/dashboard/esign/editor/${doc.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card ink-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <h2 className="font-bold text-foreground">Document Templates</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 grid sm:grid-cols-2 gap-3">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setSelected(t === selected ? null : t)}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${selected?.id === t.id ? "border-accent bg-accent/5" : "border-border bg-card hover:border-accent/30 hover:bg-muted/30"}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{t.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                  <div className="flex gap-1 mt-2">
                    {t.fields.map(f => (
                      <span key={f} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{f}</span>
                    ))}
                  </div>
                </div>
                {selected?.id === t.id && <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />}
              </div>
            </button>
          ))}
        </div>

        <div className="p-5 border-t border-border flex gap-2 shrink-0">
          <Button onClick={handleUse} disabled={!selected || creating}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2">
            {creating ? "Creating..." : <><ChevronRight className="w-4 h-4" /> Use Template</>}
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
        </div>
      </motion.div>
    </div>
  );
}