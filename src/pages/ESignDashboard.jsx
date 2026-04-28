import React from "react";
import { motion } from "framer-motion";
import { FileSignature, Sparkles, Shield, Clock, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ESignDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-10">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-6"
        >
          <FileSignature className="w-10 h-10 text-accent" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground"
        >
          E-Signature <span className="text-accent">is Coming Soon</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
        >
          We're building a state-of-the-art digital signing experience. Secure, fast, and fully integrated with your Dugosoft documents.
        </motion.p>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: Shield,
            title: "Bank-Grade Security",
            desc: "256-bit encryption and legal compliance for all your sensitive documents."
          },
          {
            icon: Zap,
            title: "Instant Sending",
            desc: "Send documents for signature in seconds with personalized templates."
          },
          {
            icon: Sparkles,
            title: "AI-Powered Fields",
            desc: "Our AI automatically detects where signatures and dates should go."
          }
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="bg-card ink-border rounded-2xl p-6 space-y-3 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-3xl group-hover:bg-accent/10 transition-colors" />
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA / Progress Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-accent/5 border border-accent/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-accent/20">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "75%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-full bg-accent"
          />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5" /> Launching May 2026
          </div>
          <h2 className="text-2xl font-bold text-foreground">Want early access?</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our beta testing begins soon. Be the first to try the most powerful e-signature tool for career professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 h-12 font-bold gap-2">
              Join the Waitlist <ArrowRight className="w-4 h-4" />
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" className="rounded-full px-8 h-12 font-bold">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}