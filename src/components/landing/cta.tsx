"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";


export const CTA = () => {
  return (
    <section className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-neon-pink/35 via-tv-pink-500/15 to-transparent blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-tv-blue-500/35 via-sky-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.05] p-1 shadow-glass backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_40%,rgba(255,255,255,0.08))] opacity-60" />
          <div className="relative rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent px-8 py-12 md:px-14 md:py-16">
            <motion.div
              className="absolute inset-0 opacity-70"
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(236,72,153,0.18), transparent 35%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.16), transparent 32%)",
                backgroundSize: "200% 200%",
              }}
            />

            <div className="relative z-10 space-y-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 font-mono text-sm text-white/80 shadow-inner backdrop-blur-xl"
              >
                <Sparkles className="h-4 w-4 animate-pulse text-tv-pink-400" />
                Ready when you are
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="text-balance text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
              >
                Start building your UI
                <br />
                <span className="text-gradient-pink">in seconds</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="mx-auto max-w-2xl text-lg text-white/65 md:text-xl"
              >
                Join teams shipping polished interfaces with AI-backed glass
                previews and watsonx-ready generation.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.16 }}
                className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row"
              >
                <Button variant="neon" size="xl" className="group" asChild>
                  <Link href="/builder">
                    Try NullRift UI Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="glass" size="xl" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-8 pt-4 font-mono text-sm text-white/60"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-tv-pink-500" />
                  Free to start
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-tv-blue-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-neon-pink" />
                  Cancel anytime
                </div>
              </motion.div>
            </div>

            <motion.div
              className="pointer-events-none absolute -right-10 top-10 h-36 w-36 rounded-full bg-tv-pink-500/20 blur-3xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute -left-8 bottom-6 h-32 w-32 rounded-full bg-tv-blue-500/20 blur-3xl"
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.45, 0.25, 0.45] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Made with Bob
