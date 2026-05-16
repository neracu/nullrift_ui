"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Code2,
  Globe,
  ArrowLeft,
} from "lucide-react";

/**
 * Full-screen login / sign-up shell: same backdrop as the marketing hero; email + password then Builder (no API auth).
 */
export default function LoginCardSection() {
  const router = useRouter();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function goToBuilder(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return;
    router.push("/builder");
  }

  function renderFields(mode: "login" | "signup") {
    const eid = `email-${mode}`;
    const pid = `password-${mode}`;
    return (
      <>
        <div className="grid gap-2">
          <Label htmlFor={eid} className="text-sm font-medium text-tv-blue-200/80">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tv-pink-400/70" />
            <Input
              id={eid}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-white/15 bg-white/5 pl-10 text-white placeholder:text-white/40 transition-colors focus-visible:border-tv-pink-500/50 focus-visible:ring-tv-pink-500/30"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={pid} className="text-sm font-medium text-tv-blue-200/80">
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tv-pink-400/70" />
            <Input
              id={pid}
              type={showPassword ? "text" : "password"}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-white/15 bg-white/5 pl-10 pr-10 text-white placeholder:text-white/40 transition-colors focus-visible:border-tv-pink-500/50 focus-visible:ring-tv-pink-500/30"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-2 text-white/50 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tv-pink-500/50"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </>
    );
  }

  const oauthRow = (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="glass"
        className="h-10 cursor-pointer rounded-xl border-white/10 font-mono text-sm text-white/90 transition-all duration-200 hover:border-tv-pink-500/30 hover:text-white"
      >
        <Code2 className="mr-2 h-4 w-4 text-neon-pink" />
        GitHub
      </Button>
      <Button
        type="button"
        variant="glass"
        className="h-10 cursor-pointer rounded-xl border-white/10 font-mono text-sm text-white/90 transition-all duration-200 hover:border-tv-blue-500/30 hover:text-white"
      >
        <Globe className="mr-2 h-4 w-4 text-neon-blue" />
        Google
      </Button>
    </div>
  );

  return (
    <section className="relative flex min-h-dvh flex-col overflow-hidden bg-deep-space font-sans text-white">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-30 [background:radial-gradient(ellipse_80%_60%_at_20%_30%,rgba(217,70,239,0.18)_0%,transparent_60%),radial-gradient(ellipse_60%_50%_at_80%_70%,rgba(0,217,255,0.12)_0%,transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:60px_60px]"
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        <Card className="w-full max-w-sm animate-slide-up rounded-[28px] border border-white/12 bg-white/[0.05] p-0 shadow-glass backdrop-blur-2xl motion-reduce:animate-none">
          <CardHeader className="space-y-4 p-8 sm:p-9">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 font-mono text-sm text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Back to Home
            </Link>
            <div className="space-y-1 text-center sm:text-left">
              <CardTitle className="font-sans tracking-tight text-white">
                {tab === "login" ? "Welcome back" : "Create an account"}
              </CardTitle>
              <CardDescription className="text-base text-tv-blue-200/65">
                {tab === "login"
                  ? "Sign in to open the Builder"
                  : "Register to start building with NullRift"}
              </CardDescription>
            </div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl border border-white/10 bg-white/[0.06] p-1 font-mono text-xs uppercase tracking-wide text-white/60">
                <TabsTrigger
                  value="login"
                  className="cursor-pointer rounded-lg transition-all duration-200 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-inner"
                >
                  Sign in
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="cursor-pointer rounded-lg transition-all duration-200 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-inner"
                >
                  Sign up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-5 space-y-0 outline-none">
                <form onSubmit={goToBuilder} className="grid gap-5">
                  {renderFields("login")}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        id="remember"
                        className="border-white/25 data-[state=checked]:border-tv-pink-500 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-tv-pink-500 data-[state=checked]:to-neon-pink data-[state=checked]:text-white"
                      />
                      <Label
                        htmlFor="remember"
                        className="cursor-pointer text-sm font-normal text-white/55"
                      >
                        Remember me
                      </Label>
                    </div>
                    <span className="shrink-0 text-sm text-tv-pink-300/80">
                      Forgot password?
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="neon"
                    className="h-11 w-full cursor-pointer rounded-xl font-semibold shadow-glow-pink transition-transform duration-200 hover:scale-[1.01] motion-reduce:hover:scale-100"
                  >
                    Continue
                  </Button>

                  <div className="relative py-2">
                    <Separator className="bg-white/10" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded px-2 font-mono text-[10px] uppercase tracking-widest text-white/45 backdrop-blur-sm bg-white/[0.12]">
                      or
                    </span>
                  </div>

                  {oauthRow}
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-5 space-y-0 outline-none">
                <form onSubmit={goToBuilder} className="grid gap-5">
                  {renderFields("signup")}
                  <Button
                    type="submit"
                    variant="neon"
                    className="h-11 w-full cursor-pointer rounded-xl font-semibold shadow-glow-pink transition-transform duration-200 hover:scale-[1.01] motion-reduce:hover:scale-100"
                  >
                    Create account
                  </Button>

                  <div className="relative py-2">
                    <Separator className="bg-white/10" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded px-2 font-mono text-[10px] uppercase tracking-widest text-white/45 backdrop-blur-sm bg-white/[0.12]">
                      or
                    </span>
                  </div>

                  {oauthRow}
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}

// Made with Bob
