import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Building2 } from "lucide-react";

const cases = [
  {
    icon: GraduationCap,
    title: "Students & Job Seekers",
    description: "Craft winning resumes, check ATS compatibility, and stand out in competitive job markets.",
  },
  {
    icon: Briefcase,
    title: "Freelancers",
    description: "Translate client documents, extract data from invoices, and manage multilingual projects.",
  },
  {
    icon: Building2,
    title: "Small Businesses",
    description: "Convert PDFs to structured data, analyze documents, and automate repetitive workflows.",
  },
];

export default function UseCases() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-widest text-accent mb-3"
          >
            Use Cases
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground"
          >
            Built for every workflow
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cases.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="p-8 rounded-xl bg-card ink-border text-center hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 text-accent mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}