"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/card";
import { MessageSquare, Sparkles, Sliders, FileCode } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Enter Prompt",
    description: "Describe your UI component in plain English. Be as detailed or as simple as you want.",
    example: '"Create a pricing card with three tiers"',
    color: "pink" as const,
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Generation",
    description: "watsonx.ai analyzes your prompt and generates a fully functional component in seconds.",
    example: "Generating component...",
    color: "blue" as const,
  },
  {
    number: "03",
    icon: Sliders,
    title: "Visual Tuning",
    description: "Fine-tune colors, spacing, typography with intuitive visual controls. No code needed.",
    example: "Adjust styles in real-time",
    color: "pink" as const,
  },
  {
    number: "04",
    icon: FileCode,
    title: "Export Code",
    description: "Get production-ready code in React, Vue, or HTML. Copy, paste, and ship.",
    example: "export default Component",
    color: "blue" as const,
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-tv-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-tv-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-mono mb-6">
            <Sparkles className="w-4 h-4 text-tv-blue-400" />
            <span className="text-white/80">How It Works</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            From idea to code in{" "}
            <span className="text-gradient-blue">4 simple steps</span>
          </h2>

          <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto">
            No design experience required. No coding skills needed. Just describe what you want.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-tv-pink-500/20 via-tv-blue-500/20 to-tv-pink-500/20 -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Step Number Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold font-mono text-lg border-2 ${
                      step.color === "pink"
                        ? "bg-tv-pink-500/20 border-tv-pink-500/50 text-tv-pink-400"
                        : "bg-tv-blue-500/20 border-tv-blue-500/50 text-tv-blue-400"
                    }`}
                  >
                    {step.number}
                  </div>
                </div>

                <GlassCard
                  glow={step.color}
                  className="pt-12 h-full text-center group"
                >
                  {/* Icon */}
                  <div className="relative mb-6 inline-block">
                    <div
                      className={`absolute inset-0 blur-xl opacity-50 group-hover:opacity-75 transition-opacity ${
                        step.color === "pink"
                          ? "bg-tv-pink-500"
                          : "bg-tv-blue-500"
                      }`}
                    />
                    <div
                      className={`relative w-16 h-16 rounded-xl flex items-center justify-center ${
                        step.color === "pink"
                          ? "bg-tv-pink-500/20 border border-tv-pink-500/30"
                          : "bg-tv-blue-500/20 border border-tv-blue-500/30"
                      }`}
                    >
                      <step.icon
                        className={`w-8 h-8 ${
                          step.color === "pink"
                            ? "text-tv-pink-400"
                            : "text-tv-blue-400"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-4 font-mono">
                    {step.title}
                  </h3>

                  <p className="text-white/60 mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Example */}
                  <div className="glass rounded-lg px-4 py-3 inline-block">
                    <code className="text-xs font-mono text-white/40 group-hover:text-white/60 transition-colors">
                      {step.example}
                    </code>
                  </div>

                  {/* Arrow for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.color === "pink"
                            ? "bg-tv-pink-500/20 text-tv-pink-400"
                            : "bg-tv-blue-500/20 text-tv-blue-400"
                        }`}
                      >
                        →
                      </div>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-white/40 font-mono text-sm mb-4">
            Ready to try it yourself?
          </p>
          <motion.div
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a
              href="/builder"
              className="inline-flex items-center gap-2 glass-hover rounded-full px-6 py-3 text-white font-mono border border-tv-pink-500/30 hover:border-tv-pink-500/60 transition-all"
            >
              Start Building
              <span className="text-tv-pink-400">→</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Made with Bob