import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Play,
  Zap,
  Hexagon,
  Triangle,
  Command,
  Ghost,
  Gem,
  Cpu,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const CLIENTS: { name: string; icon: LucideIcon }[] = [
  { name: "Acme Corp", icon: Hexagon },
  { name: "Quantum", icon: Triangle },
  { name: "Command+Z", icon: Command },
  { name: "Phantom", icon: Ghost },
  { name: "Ruby", icon: Gem },
  { name: "Chipset", icon: Cpu },
];

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex cursor-default flex-col items-center justify-center transition-transform hover:-translate-y-1">
    <span className="text-xl font-bold text-white sm:text-2xl">{value}</span>
    <span className="text-[10px] font-medium uppercase tracking-wider text-tv-blue-300/70 sm:text-xs">
      {label}
    </span>
  </div>
);

const FEATURES = [
  "Production-ready components",
  "Tailwind CSS + shadcn/ui",
  "TypeScript by default",
];

export default function HeroSection() {
  return (
    <div className="relative w-full min-h-screen overflow-y-auto bg-deep-space font-sans text-white">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-fade-in {
          animation: fadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(217,70,239,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(0,217,255,0.12) 0%, transparent 55%)",
        }}
      />

      <div
        className="absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 md:pb-24 md:pt-28 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:min-h-[calc(100dvh-6.5rem)] lg:grid-cols-12 lg:items-stretch lg:gap-8">
          <div className="flex flex-col justify-center space-y-8 lg:col-span-7 lg:py-4">
            <div className="animate-fade-in delay-100 inline-flex w-fit items-center gap-2 rounded-full border border-tv-pink-500/30 bg-tv-pink-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-tv-pink-300">
              <Sparkles className="h-3 w-3" />
              Powered by watsonx.ai
            </div>

            <h1
              className="animate-fade-in delay-100 text-5xl font-medium leading-[0.9] tracking-tighter sm:text-6xl lg:text-7xl xl:text-8xl"
              style={{
                maskImage: "linear-gradient(180deg, black 0%, black 80%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(180deg, black 0%, black 80%, transparent 100%)",
              }}
            >
              Generate UI
              <br />
              <span className="bg-gradient-to-br from-tv-pink-400 via-neon-pink to-tv-blue-400 bg-clip-text text-transparent">
                Components
              </span>
              <br />
              with AI
            </h1>

            <p className="animate-fade-in delay-200 max-w-xl text-lg leading-relaxed text-tv-blue-200/70">
              Describe what you need and NullRift instantly produces production-ready React
              components styled with Tailwind CSS. No boilerplate. No guesswork.
            </p>

            <ul className="animate-fade-in delay-300 space-y-2">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-tv-blue-200/60">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-neon-pink" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="animate-fade-in delay-300 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-neon-pink px-8 py-4 text-sm font-semibold text-white shadow-glow-pink transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,0,110,0.7)] active:scale-[0.98]"
              >
                Start Building Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#how-it-works"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-tv-pink-500/40 hover:bg-white/10"
              >
                <Play className="h-4 w-4 fill-current" />
                See How It Works
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6 lg:col-span-5 lg:py-4">
            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-tv-pink-500/20 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-neon-pink/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-neon-blue/10 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-pink/15 ring-1 ring-neon-pink/30">
                    <Zap className="h-6 w-6 text-neon-pink" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">10k+</div>
                    <div className="text-sm text-tv-blue-300/70">Components Generated</div>
                  </div>
                </div>

                <div className="mb-8 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-tv-blue-300/70">Developer Satisfaction</span>
                    <span className="font-medium text-neon-pink">98%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-tv-pink-500 to-neon-pink shadow-[0_0_10px_rgba(255,0,110,0.6)]" />
                  </div>
                </div>

                <div className="mb-6 h-px w-full bg-white/10" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value="∞" label="Iterations" />
                  <div className="mx-auto h-full w-px bg-white/10" />
                  <StatItem value="24/7" label="Available" />
                  <div className="mx-auto h-full w-px bg-white/10" />
                  <StatItem value="Free" label="To Start" />
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-neon-pink/20 bg-neon-pink/10 px-3 py-1 text-[10px] font-medium tracking-wide text-tv-pink-300">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-pink opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-pink" />
                    </span>
                    LIVE
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-neon-blue/20 bg-neon-blue/10 px-3 py-1 text-[10px] font-medium tracking-wide text-tv-blue-300">
                    <Sparkles className="h-3 w-3 text-neon-blue" />
                    AI-POWERED
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-8 backdrop-blur-xl">
              <h3 className="mb-6 px-8 text-sm font-medium text-tv-blue-300/60">
                Trusted by Industry Leaders
              </h3>

              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage:
                    "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                }}
              >
                <div className="animate-marquee flex gap-12 whitespace-nowrap px-4">
                  {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, i) => {
                    const Icon = client.icon;
                    return (
                      <div
                        key={`${client.name}-${i}`}
                        className="flex cursor-default items-center gap-2 opacity-40 grayscale transition-all hover:scale-105 hover:grayscale-0 hover:opacity-100"
                      >
                        <Icon className="h-6 w-6 fill-current text-tv-pink-400" />
                        <span className="text-lg font-bold tracking-tight text-white">
                          {client.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
