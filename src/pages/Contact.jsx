import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

const INFO_CARDS = [
  { icon: Mail, title: "Email Us", desc: "For general inquiries and support", value: "hello@softdugo.com", href: "mailto:hello@softdugo.com" },
  { icon: MessageSquare, title: "Live Chat", desc: "Available Mon–Fri, 9am–6pm UTC", value: "Start a conversation", href: "#" },
  { icon: MapPin, title: "Headquarters", desc: "Our main office", value: "San Francisco, CA, USA", href: null },
  { icon: Clock, title: "Response Time", desc: "We aim to reply within", value: "24 hours", href: null },
];

const SUBJECTS = ["General Inquiry", "Technical Support", "Billing & Subscriptions", "Feature Request", "Partnership", "Other"];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill in all required fields."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">

        {/* Header */}
        <section className="py-20 px-6 bg-secondary/40">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-center mb-5">
                <img src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/20bb88239_loogoo.png" alt="Softdugo" className="h-16 w-16 object-contain" />
              </div>
              <h1 className="text-4xl font-extrabold text-foreground mb-4">Get in Touch</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Have a question, feedback, or just want to say hello? We'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Info cards */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {INFO_CARDS.map(({ icon: Icon, title, desc, value, href }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card ink-border rounded-2xl p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{desc}</p>
                {href ? (
                  <a href={href} className="text-sm text-accent font-medium hover:underline">{value}</a>
                ) : (
                  <p className="text-sm text-foreground font-medium">{value}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact form */}
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              {sent ? (
                <div className="bg-card ink-border rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-xl font-extrabold text-foreground mb-2">Message Sent!</h2>
                  <p className="text-muted-foreground mb-6">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                  <Button variant="outline" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="rounded-full">
                    Send another message
                  </Button>
                </div>
              ) : (
                <div className="bg-card ink-border rounded-2xl p-8">
                  <h2 className="text-xl font-bold text-foreground mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name *</Label>
                        <Input placeholder="Jane Smith" value={form.name} onChange={set("name")} className="bg-background" required />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email *</Label>
                        <Input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} className="bg-background" required />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Subject</Label>
                      <select
                        value={form.subject}
                        onChange={set("subject")}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Select a subject...</option>
                        {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Message *</Label>
                      <Textarea
                        placeholder="Tell us how we can help..."
                        value={form.message}
                        onChange={set("message")}
                        className="min-h-[140px] resize-none bg-background"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold gap-2">
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Send Message</>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* FAQ teaser */}
        <section className="py-16 px-6 bg-secondary/40">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-extrabold text-foreground mb-4">Frequently Asked Questions</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-left mt-8">
                {[
                  { q: "Is Softdugo free to use?", a: "Yes! Our Free plan gives you access to core features with no credit card required." },
                  { q: "What file formats are supported?", a: "We support PDF, DOCX, TXT, XLSX, and more across our tools." },
                  { q: "Is my data safe?", a: "Absolutely. All files are encrypted and never used to train AI models." },
                  { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime from the Pricing & Subscription page in your dashboard." },
                ].map(({ q, a }, i) => (
                  <div key={i} className="bg-card ink-border rounded-xl p-5">
                    <p className="text-sm font-bold text-foreground mb-1">{q}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}