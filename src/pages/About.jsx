import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Zap, Users, Globe, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

const TEAM = [
  { name: "Amara Osei", role: "CEO & Co-Founder", avatar: "AO", color: "#4f46e5", bio: "10+ years in AI and document automation." },
  { name: "Sofia Melo", role: "CTO & Co-Founder", avatar: "SM", color: "#0ea5e9", bio: "Ex-Google engineer, ML infrastructure expert." },
  { name: "James Kimani", role: "Head of Product", avatar: "JK", color: "#10b981", bio: "Product leader with a passion for UX." },
  { name: "Nina Patel", role: "Lead Designer", avatar: "NP", color: "#f97316", bio: "Award-winning interface and brand designer." },
];

const VALUES = [
  { icon: Target, title: "Mission-Driven", desc: "We exist to remove friction from how people work with documents and data." },
  { icon: Zap, title: "AI-First", desc: "Every feature is built around cutting-edge AI to deliver real, measurable results." },
  { icon: Users, title: "User-Centric", desc: "We obsess over the user experience — simple, fast, and delightful." },
  { icon: Globe, title: "Global Reach", desc: "Built for professionals worldwide, with multi-language support at the core." },
  { icon: Shield, title: "Privacy First", desc: "Your data is yours. We never train on your files or sell your information." },
  { icon: Star, title: "Quality Always", desc: "We'd rather ship one great feature than ten mediocre ones." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">

        {/* Hero */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex justify-center mb-6">
                <img src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/20bb88239_loogoo.png" alt="Dugosoft" className="h-20 w-20 object-contain" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6">
                We're building the future<br />of document intelligence
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Dugosoft is an AI-powered platform that helps professionals create resumes, translate documents, convert files, and extract insights — all in one place. We believe powerful tools should be simple and accessible to everyone.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-6 bg-secondary/40">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10,000+", label: "Active Users" },
              { value: "500K+", label: "Documents Processed" },
              { value: "5+", label: "Languages Supported" },
              { value: "99.9%", label: "Uptime SLA" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <p className="text-3xl font-extrabold text-accent mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-extrabold text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Dugosoft was founded in 2024 by a team of engineers and designers who were tired of using five different tools just to update a resume, translate a contract, and share a file with a colleague.</p>
                <p>We asked ourselves: <span className="text-foreground font-medium">"What if there was one intelligent platform that handled all of this?"</span> So we built it.</p>
                <p>Starting with a simple resume builder, we quickly expanded into ATS checking, multilingual translation, document merging, and career mentorship powered by AI. Today, tens of thousands of professionals around the world rely on Dugosoft every day.</p>
                <p>We're a small but passionate team, backed by belief that AI should work <em>for</em> people — removing busywork so they can focus on what actually matters.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-6 bg-secondary/40">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <h2 className="text-3xl font-extrabold text-foreground">What we stand for</h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {VALUES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-card ink-border rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <h2 className="text-3xl font-extrabold text-foreground">Meet the team</h2>
              <p className="text-muted-foreground mt-2">The people behind the platform</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TEAM.map((member, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-card ink-border rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white mx-auto mb-4"
                    style={{ background: member.color }}>
                    {member.avatar}
                  </div>
                  <h3 className="font-bold text-foreground">{member.name}</h3>
                  <p className="text-xs text-accent font-medium mb-2">{member.role}</p>
                  <p className="text-xs text-muted-foreground">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-secondary/40">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-extrabold text-foreground mb-4">Ready to get started?</h2>
              <p className="text-muted-foreground mb-8">Join thousands of professionals who use Dugosoft every day.</p>
              <Link to="/dashboard">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-10 h-12 font-semibold gap-2">
                  Try Dugosoft Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}