import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  BarChart3,
  Languages,
  Table2,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: FileText,
    title: "AI Resume Builder",
    description: "Generate professional, ATS-optimized resumes in seconds with AI assistance.",
    link: "/dashboard/resume-builder",
    active: true,
  },
  {
    icon: BarChart3,
    title: "ATS Resume Checker",
    description: "Analyze your resume against job descriptions for maximum compatibility.",
    link: "/dashboard/ats-checker",
    active: true,
  },
  {
    icon: Languages,
    title: "Document Translator",
    description: "Translate documents between multiple languages with contextual accuracy.",
    link: "/dashboard/translator",
    active: true,
  },
  {
    icon: Table2,
    title: "PDF to Excel Converter",
    description: "Extract structured data from PDFs and convert into organized tables.",
    link: "/dashboard/pdf-to-excel",
    active: true,
  },
  {
    icon: TrendingUp,
    title: "Financial Analyzer",
    description: "Deep analysis of financial documents with AI-powered insights.",
    link: "#",
    active: false,
  },
  {
    icon: MessageSquare,
    title: "Chat with Document",
    description: "Have conversations with your documents and extract answers instantly.",
    link: "#",
    active: false,
  },
];

export default function FeaturesGrid({ featuresImage }) {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-widest text-accent mb-3"
          >
            Capabilities
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground"
          >
            Everything you need, in one platform
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const Wrapper = feature.active ? Link : "div";
            const wrapperProps = feature.active ? { to: feature.link } : {};

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Wrapper {...wrapperProps} className="block">
                  <div
                    className={`group relative p-6 rounded-xl ink-border bg-card transition-all duration-300 h-full ${
                      feature.active
                        ? "hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1 cursor-pointer"
                        : "opacity-60 cursor-default"
                    }`}
                  >
                    {!feature.active && (
                      <span className="absolute top-4 right-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300 ${
                      feature.active
                        ? "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Wrapper>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}