import React from "react";
import { motion } from "framer-motion";
import { FileSignature, Sparkles, Shield, Zap } from "lucide-react";

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


    </div>
  );
}