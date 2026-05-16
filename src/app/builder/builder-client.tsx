"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { PromptInput } from "@/components/builder/prompt-input";
import { GenerationLoading } from "@/components/builder/generation-loading";
import { GenerationError } from "@/components/builder/generation-error";
import { PreviewCanvas } from "@/components/builder/preview-canvas";
import { TuningPanel } from "@/components/builder/tuning-panel";
import { Button } from "@/components/ui/button";
import type { ComponentSchema } from "@/lib/watsonx/types";

type BuilderPhase = "idle" | "loading" | "error" | "success";

interface GenerateErrorJson {
  error?: string;
  message?: string;
  code?: string;
  hint?: string;
  retryable?: boolean;
}

interface GenerateSuccessJson {
  success: true;
  code: string;
  schema: ComponentSchema;
  metadata?: any;
}

/**
 * Client-side builder: prompt → POST /api/generate → interactive preview with code display.
 */
export function BuilderClient() {
  const [phase, setPhase] = useState<BuilderPhase>("idle");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [generatedSchema, setGeneratedSchema] = useState<ComponentSchema | null>(null);
  const [currentSchema, setCurrentSchema] = useState<ComponentSchema | null>(null);
  const [currentCode, setCurrentCode] = useState<string>("");
  const [showTuningPanel, setShowTuningPanel] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const [errorState, setErrorState] = useState<{
    error: string;
    code?: string;
    hint?: string;
    retryable?: boolean;
  } | null>(null);

  const runGenerate = useCallback(async (prompt: string) => {
    setLastPrompt(prompt);
    setPhase("loading");
    setErrorState(null);
    setGeneratedCode("");
    setGeneratedSchema(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const body = (await response.json()) as GenerateErrorJson | GenerateSuccessJson;

      if (!response.ok) {
        const err = body as GenerateErrorJson;
        setErrorState({
          error: err.message || err.error || "Generation failed",
          code: err.code,
          hint: err.hint,
          retryable: err.retryable !== false,
        });
        setPhase("error");
        return;
      }

      const okBody = body as GenerateSuccessJson;
      if (okBody.success === true && typeof okBody.code === "string" && okBody.schema) {
        setGeneratedCode(okBody.code);
        setGeneratedSchema(okBody.schema);
        setCurrentSchema(okBody.schema);
        setCurrentCode(okBody.code);
        setShowTuningPanel(false); // Reset tuning panel on new generation
        setPhase("success");
        return;
      }

      setErrorState({
        error: "Unexpected response from server",
        retryable: true,
      });
      setPhase("error");
    } catch {
      setErrorState({
        error: "Network error",
        hint: "Check your connection and try again.",
        retryable: true,
      });
      setPhase("error");
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastPrompt) {
      void runGenerate(lastPrompt);
    }
  }, [lastPrompt, runGenerate]);

  return (
    <div className="min-h-screen bg-deep-space text-foreground">
      <header className="border-b border-white/10 bg-deep-space/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <span className="text-sm font-medium text-muted-foreground sm:text-base">Builder</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Component builder</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Describe a UI; watsonx generates a schema and we render React code.
          </p>
        </div>

        <PromptInput
          onGenerate={(prompt) => void runGenerate(prompt)}
          isGenerating={phase === "loading"}
          disabled={phase === "loading"}
        />

        <div className="mt-12">
          {phase === "loading" && (
            <GenerationLoading onCancel={() => setPhase("idle")} />
          )}

          {phase === "error" && errorState && (
            <GenerationError
              error={errorState.error}
              code={errorState.code}
              hint={errorState.hint}
              retryable={errorState.retryable}
              onRetry={handleRetry}
              onDismiss={() => setPhase("idle")}
            />
          )}

          {phase === "success" && generatedCode && generatedSchema && currentSchema && (
            <>
              {/* Tuning Toggle Button */}
              <div className="mb-4 flex justify-end">
                <Button
                  variant="glass-blue"
                  size="sm"
                  onClick={() => setShowTuningPanel(!showTuningPanel)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {showTuningPanel ? 'Hide' : 'Show'} Tuning Panel
                </Button>
              </div>

              <div className={`grid gap-6 ${showTuningPanel ? 'lg:grid-cols-[1fr_400px]' : 'lg:grid-cols-2'}`}>
                <div className="space-y-6">
                  {/* Interactive Preview */}
                  <PreviewCanvas
                    schema={currentSchema}
                    code={currentCode}
                    onSubmit={(data) => {
                      console.log('Form submitted:', data);
                    }}
                    onError={(error) => {
                      console.error('Preview error:', error);
                    }}
                  />

                  {/* Generated Code */}
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4 shadow-inner sm:p-6">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h2 className="text-sm font-medium text-muted-foreground sm:text-base">Generated Code</h2>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-white/20"
                        onClick={() => void navigator.clipboard.writeText(currentCode)}
                      >
                        Copy
                      </Button>
                    </div>
                    <pre className="max-h-[min(70vh,720px)] overflow-auto rounded-lg bg-black/50 p-4 text-left text-xs leading-relaxed text-emerald-100/90 sm:text-sm">
                      <code>{currentCode}</code>
                    </pre>
                  </div>
                </div>

                {/* Tuning Panel */}
                {showTuningPanel && (
                  <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)]">
                    <TuningPanel
                      schema={generatedSchema}
                      code={generatedCode}
                      onSchemaChange={setCurrentSchema}
                      onCodeChange={setCurrentCode}
                      onClose={() => setShowTuningPanel(false)}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Made with Bob
