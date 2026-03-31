import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Trash2, Bell, Globe } from "lucide-react";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

const SECTIONS = [
  {
    icon: Eye,
    title: "Information We Collect",
    content: [
      "Account information (name, email address) when you register.",
      "Files and documents you upload for processing — these are used solely to provide the requested service.",
      "Usage data such as features accessed, pages visited, and interaction timestamps.",
      "Technical data including browser type, IP address, and device identifiers for security and performance.",
    ],
  },
  {
    icon: Lock,
    title: "How We Use Your Information",
    content: [
      "To provide, maintain, and improve the Softdugo platform and its features.",
      "To process documents, generate resumes, translate content, and perform other requested operations.",
      "To send transactional emails such as account confirmations and billing receipts.",
      "To detect and prevent fraud, abuse, and unauthorized access.",
      "To comply with legal obligations.",
    ],
  },
  {
    icon: Shield,
    title: "Data Security",
    content: [
      "All data is encrypted in transit using TLS 1.3 and at rest using AES-256.",
      "We do not use your uploaded files to train AI models or share them with third parties.",
      "Access to user data is strictly limited to authorized personnel on a need-to-know basis.",
      "We conduct regular security audits and vulnerability assessments.",
    ],
  },
  {
    icon: Globe,
    title: "Data Sharing",
    content: [
      "We do not sell your personal data to third parties — ever.",
      "We may share data with trusted service providers (hosting, payment processing) under strict data processing agreements.",
      "We may disclose information if required by law or to protect the rights and safety of Softdugo and its users.",
    ],
  },
  {
    icon: Bell,
    title: "Cookies & Tracking",
    content: [
      "We use essential cookies to keep you logged in and maintain session security.",
      "Analytics cookies help us understand how users interact with the platform (anonymized).",
      "You can manage cookie preferences in your browser settings at any time.",
    ],
  },
  {
    icon: Trash2,
    title: "Your Rights",
    content: [
      "Access: You can request a copy of all personal data we hold about you.",
      "Correction: You can update or correct your personal information at any time in Settings.",
      "Deletion: You can request deletion of your account and all associated data.",
      "Portability: You can export your data in a machine-readable format.",
      "To exercise any of these rights, contact us at privacy@softdugo.com.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">

        {/* Header */}
        <section className="py-20 px-6 bg-secondary/40">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
              </div>
              <h1 className="text-4xl font-extrabold text-foreground mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground text-lg">Last updated: March 31, 2026</p>
              <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl mx-auto">
                At Softdugo, your privacy is a fundamental right, not an afterthought. This policy explains what data we collect, why we collect it, and how we protect it.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto space-y-10">
            {SECTIONS.map(({ icon: Icon, title, content }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{title}</h2>
                </div>
                <div className="bg-card ink-border rounded-2xl p-6">
                  <ul className="space-y-3">
                    {content.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}

            {/* Contact note */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-2">Questions about this policy?</h3>
              <p className="text-sm text-muted-foreground">
                Contact our Data Protection Officer at{" "}
                <a href="mailto:privacy@softdugo.com" className="text-accent font-medium hover:underline">privacy@softdugo.com</a>
                {" "}or write to us at Softdugo Inc., 123 AI Boulevard, San Francisco, CA 94105.
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}