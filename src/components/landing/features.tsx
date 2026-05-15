"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/card";
import { Zap, Palette, Download, Code, Sparkles, Eye } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Preview",
    description:
      "See your component come to life in real-time. Fully interactive, fully functional.",
    color: "pink" as const,
  },
  {
    icon: Palette,
    title: "Visual Tuning",
    description:
      "Adjust colors, spacing, typography without touching code. Perfect pixel control.",
    color: "blue" as const,
  },
  {
    icon: Download,
    title: "Clean Export",
    description: "Get production-ready React, Vue, or HTML. Copy-paste and ship.",
    color: "pink" as const,
  },
  {
    icon: Code,
    title: "AI-Powered",
    description:
      "Powered by watsonx.ai. Describe your UI in plain English, get perfect code.",
    color: "blue" as const,
  },
  {
    icon: Sparkles,
    title: "Smart Defaults",
    description:
      "Beautiful, accessible components out of the box. Best practices built-in.",
    color: "pink" as const,
  },
  {
    icon: Eye,
    title: "Live Editing",
    description: "Edit and see changes instantly. No build step, no waiting.",
    color: "blue" as const,
  },
];


export const Features = () => {
  return (
    <section
      id="features"
      className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-deep-space via-[#0b1530] to-deep-space" />
      <div className="pointer-events-none absolute inset-x-0 top-24 h-72 bg-gradient-to-r from-tv-pink-500/10 via-transparent to-tv-blue-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-16 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-white/80 shadow-glass backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-tv-pink-400" />
            Features
          </div>
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Everything you need to{" "}
            <span className="text-gradient-pink">build faster</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-white/60 md:text-xl">
            From idea to production in minutes. No design skills required.
          </p>
        </motion.div>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="space-y-5"
          >
            {features.slice(0, 3).map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <GlassCard glow={feature.color} className="group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div
                        className={`absolute inset-0 blur-xl transition-opacity group-hover:opacity-80 ${
                          feature.color === "pink"
                            ? "bg-tv-pink-500 opacity-50"
                            : "bg-tv-blue-500 opacity-50"
                        }`}
                      />
                      <div
                        className={`relative flex h-12 w-12 items-center justify-center rounded-xl border ${
                          feature.color === "pink"
                            ? "border-tv-pink-500/35 bg-tv-pink-500/15"
                            : "border-tv-blue-500/35 bg-tv-blue-500/15"
                        }`}
                      >
                        <feature.icon
                          className={`h-6 w-6 ${
                            feature.color === "pink"
                              ? "text-tv-pink-300"
                              : "text-tv-blue-300"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 font-mono text-xl font-bold text-white">
                        {feature.title}
                      </h3>
                      <p className="leading-relaxed text-white/60">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="absolute inset-6 rounded-[36px] bg-gradient-to-br from-tv-pink-500/20 via-transparent to-tv-blue-500/25 blur-3xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 shadow-glass backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 backdrop-blur-md">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="mx-auto flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-white/55">
                  nullrift.app/builder
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-tv-blue-950/80 via-[#0c1f3f]/90 to-deep-space p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.18),_transparent_55%)]" />
                <div className="relative space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-tv-pink-500/35 ring-1 ring-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-3/4 rounded bg-white/25" />
                        <div className="h-2 w-1/2 rounded bg-white/12" />
                      </div>
                    </div>
                    <div className="h-24 rounded-lg border border-tv-blue-500/25 bg-white/[0.04]" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-tv-pink-500/20 bg-white/[0.04] p-3 backdrop-blur-md">
                      <div className="mb-2 h-2 w-2/3 rounded bg-white/20" />
                      <div className="h-16 rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-transparent" />
                    </div>
                    <div className="rounded-xl border border-tv-blue-500/20 bg-white/[0.04] p-3 backdrop-blur-md">
                      <div className="mb-2 h-2 w-1/2 rounded bg-white/20" />
                      <div className="h-16 rounded-lg border border-white/10 bg-gradient-to-br from-tv-blue-500/15 to-transparent" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-md">
                    <div className="h-9 flex-1 rounded-lg bg-gradient-to-r from-tv-pink-500/35 to-neon-pink/35" />
                    <div className="h-9 w-9 rounded-lg border border-white/15 bg-white/[0.06]" />
                  </div>
                </div>
              </div>

              <motion.div
                className="absolute -right-3 top-16 rounded-full border border-tv-pink-500/35 bg-white/[0.08] px-4 py-2 font-mono text-[11px] text-white shadow-glow-pink backdrop-blur-xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                Live glass preview
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.slice(3).map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
            >
              <GlassCard
                glow={feature.color}
                className="group h-full cursor-pointer text-center"
              >
                <div className="relative mb-6 inline-block">
                  <div
                    className={`absolute inset-0 blur-xl transition-opacity group-hover:opacity-80 ${
                      feature.color === "pink"
                        ? "bg-tv-pink-500 opacity-50"
                        : "bg-tv-blue-500 opacity-50"
                    }`}
                  />
                  <div
                    className={`relative flex h-16 w-16 items-center justify-center rounded-xl border ${
                      feature.color === "pink"
                        ? "border-tv-pink-500/35 bg-tv-pink-500/15"
                        : "border-tv-blue-500/35 bg-tv-blue-500/15"
                    }`}
                  >
                    <feature.icon
                      className={`h-8 w-8 ${
                        feature.color === "pink"
                          ? "text-tv-pink-300"
                          : "text-tv-blue-300"
                      }`}
                    />
                  </div>
                </div>
                <h3 className="mb-3 font-mono text-xl font-bold text-white">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-white/60">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Made with Bob
