"use client";

import { useCallback, useState, useRef } from "react";
import { Copy, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Sidebar } from "@/components/dashboard/sidebar";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { PromptInput } from "@/components/builder/prompt-input";
import { GenerationLoading } from "@/components/builder/generation-loading";
import { GenerationError } from "@/components/builder/generation-error";
import { PreviewCanvas } from "@/components/builder/preview-canvas";
import { TuningPanel } from "@/components/builder/tuning-panel";
import { ExportModal } from "@/components/builder/export-modal";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import {
  useKeyboardShortcuts,
  COMMON_SHORTCUTS,
  type KeyboardShortcut,
} from "@/hooks/use-keyboard-shortcuts";
import { fadeIn, slideInRight, pageTransition } from "@/lib/animations/variants";
import {
  BUILDER_SECTION_IDS,
  scrollToBuilderSection,
} from "@/lib/builder-nav";
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

const noopShortcutAction = () => {};

const BUILDER_SHORTCUTS_FOR_MODAL: KeyboardShortcut[] = [
  { ...COMMON_SHORTCUTS.GENERATE, action: noopShortcutAction },
  { ...COMMON_SHORTCUTS.EXPORT, action: noopShortcutAction },
  { ...COMMON_SHORTCUTS.FOCUS_PROMPT, action: noopShortcutAction },
  { ...COMMON_SHORTCUTS.CLOSE_MODAL, action: noopShortcutAction },
  { ...COMMON_SHORTCUTS.HELP, action: noopShortcutAction },
];

function phaseLabel(phase: BuilderPhase): string {
  switch (phase) {
    case "idle":
      return "Ready";
    case "loading":
      return "Generating";
    case "error":
      return "Error";
    case "success":
      return "Ready to export";
    default:
      return "—";
  }
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
  const [showExportModal, setShowExportModal] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const [errorState, setErrorState] = useState<{
    error: string;
    code?: string;
    hint?: string;
    retryable?: boolean;
  } | null>(null);

  const promptInputRef = useRef<HTMLTextAreaElement>(null);

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
        const errorMsg = err.message || err.error || "Generation failed";
        setErrorState({
          error: errorMsg,
          code: err.code,
          hint: err.hint,
          retryable: err.retryable !== false,
        });
        setPhase("error");
        toast.error(errorMsg, {
          description: err.hint || "Please try again with a different prompt",
        });
        return;
      }

      const okBody = body as GenerateSuccessJson;
      if (okBody.success === true && typeof okBody.code === "string" && okBody.schema) {
        setGeneratedCode(okBody.code);
        setGeneratedSchema(okBody.schema);
        setCurrentSchema(okBody.schema);
        setCurrentCode(okBody.code);
        setShowTuningPanel(false);
        setPhase("success");
        toast.success("Component generated successfully!", {
          description: "Your component is ready to customize and export",
        });
        return;
      }

      setErrorState({
        error: "Unexpected response from server",
        retryable: true,
      });
      setPhase("error");
      toast.error("Unexpected response from server");
    } catch {
      const errorMsg = "Network error";
      setErrorState({
        error: errorMsg,
        hint: "Check your connection and try again.",
        retryable: true,
      });
      setPhase("error");
      toast.error(errorMsg, {
        description: "Check your connection and try again",
      });
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastPrompt) {
      void runGenerate(lastPrompt);
    }
  }, [lastPrompt, runGenerate]);

  const handleCopyCode = useCallback(() => {
    if (currentCode) {
      navigator.clipboard.writeText(currentCode);
      toast.success("Code copied to clipboard!");
    }
  }, [currentCode]);

  const handleSidebarWorkspace = useCallback(() => {
    scrollToBuilderSection(BUILDER_SECTION_IDS.workspace);
  }, []);

  const handleSidebarGenerate = useCallback(() => {
    scrollToBuilderSection(BUILDER_SECTION_IDS.generate);
    requestAnimationFrame(() => promptInputRef.current?.focus());
  }, []);

  const handleSidebarLibrary = useCallback(() => {
    scrollToBuilderSection(BUILDER_SECTION_IDS.library);
  }, []);

  const handleSidebarExport = useCallback(() => {
    if (currentSchema && phase === "success") {
      setShowExportModal(true);
    } else {
      toast.info("Generate a component first", {
        description: "Run a prompt, then open Export from the sidebar or preview.",
      });
    }
  }, [currentSchema, phase]);

  useKeyboardShortcuts({
    shortcuts: [
      {
        ...COMMON_SHORTCUTS.EXPORT,
        action: () => {
          if (currentSchema && phase === "success") {
            setShowExportModal(true);
          }
        },
      },
      {
        ...COMMON_SHORTCUTS.FOCUS_PROMPT,
        action: () => {
          promptInputRef.current?.focus();
        },
      },
      {
        key: "Escape",
        action: () => {
          if (showExportModal) {
            setShowExportModal(false);
          } else if (showTuningPanel) {
            setShowTuningPanel(false);
          } else if (shortcutsModalOpen) {
            setShortcutsModalOpen(false);
          }
        },
        description: "Close modal or panel",
      },
    ],
  });

  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          onWorkspace={handleSidebarWorkspace}
          onGenerate={handleSidebarGenerate}
          onExport={handleSidebarExport}
          onLibrary={handleSidebarLibrary}
          onSettings={() => setShortcutsModalOpen(true)}
        />
      }
    >
      <KeyboardShortcutsModal
        shortcuts={BUILDER_SHORTCUTS_FOR_MODAL}
        open={shortcutsModalOpen}
        onOpenChange={setShortcutsModalOpen}
      />

      <motion.div
        className="relative flex min-h-0 flex-1 flex-col bg-background text-foreground"
        initial="hidden"
        animate="visible"
        variants={pageTransition}
      >
        <SidebarTrigger className="fixed left-4 top-4 z-40 md:hidden" aria-label="Open menu" />
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-12 pt-14 md:px-8 md:pt-6">
          <section
            id={BUILDER_SECTION_IDS.workspace}
            className="mb-8 scroll-mt-24 space-y-6 lg:scroll-mt-8"
          >
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Builder
              </h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Describe a UI in plain language, preview it live, then tune or export.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold tabular-nums">Local</p>
                  <CardDescription className="mt-1">In-browser workspace</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{phaseLabel(phase)}</p>
                  <CardDescription className="mt-1">Generation pipeline</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Export
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    {phase === "success" && currentSchema ? "Available" : "—"}
                  </p>
                  <CardDescription className="mt-1">ZIP / schema when ready</CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          <section
            id={BUILDER_SECTION_IDS.generate}
            className="scroll-mt-24 space-y-8 lg:scroll-mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prompt</CardTitle>
                <CardDescription>Natural language → generated React component</CardDescription>
              </CardHeader>
              <CardContent>
                <PromptInput
                  ref={promptInputRef}
                  embedded
                  onGenerate={(prompt) => void runGenerate(prompt)}
                  isGenerating={phase === "loading"}
                  disabled={phase === "loading"}
                />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {phase === "loading" && (
                  <motion.div
                    key="loading"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={fadeIn}
                  >
                    <GenerationLoading onCancel={() => setPhase("idle")} />
                  </motion.div>
                )}

                {phase === "error" && errorState && (
                  <motion.div
                    key="error"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={fadeIn}
                  >
                    <GenerationError
                      error={errorState.error}
                      code={errorState.code}
                      hint={errorState.hint}
                      retryable={errorState.retryable}
                      onRetry={handleRetry}
                      onDismiss={() => setPhase("idle")}
                    />
                  </motion.div>
                )}

                {phase === "success" &&
                  generatedCode &&
                  generatedSchema &&
                  currentSchema && (
                    <motion.div
                      key="success"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={fadeIn}
                      className="space-y-6"
                    >
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTuningPanel(!showTuningPanel)}
                          className="gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          {showTuningPanel ? "Hide" : "Show"} tuning
                        </Button>
                      </div>

                      <div
                        className={`grid gap-6 ${showTuningPanel ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1"}`}
                      >
                        <div className="space-y-6">
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                          >
                            <PreviewCanvas
                              schema={currentSchema}
                              code={currentCode}
                              onSubmit={(data) => {
                                console.log("Form submitted:", data);
                                toast.success("Form submitted successfully!", {
                                  description: "Check the console for submitted data",
                                });
                              }}
                              onError={(error) => {
                                console.error("Preview error:", error);
                                toast.error("Preview error", {
                                  description: error.message,
                                });
                              }}
                              onExport={() => setShowExportModal(true)}
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Card>
                              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
                                <div>
                                  <CardTitle className="text-lg">Generated code</CardTitle>
                                  <CardDescription>Framework targets (React live)</CardDescription>
                                </div>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={handleCopyCode}
                                  className="gap-2"
                                >
                                  <Copy className="h-4 w-4" />
                                  Copy
                                </Button>
                              </CardHeader>
                              <CardContent>
                                <Tabs defaultValue="react" className="w-full">
                                  <TabsList>
                                    <TabsTrigger value="react">React</TabsTrigger>
                                    <TabsTrigger value="vue">Vue</TabsTrigger>
                                    <TabsTrigger value="html">HTML</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="react" className="mt-4">
                                    <pre className="max-h-[480px] overflow-auto rounded-md border border-border bg-muted/40 p-4 text-left text-xs leading-relaxed text-foreground">
                                      <code>{currentCode}</code>
                                    </pre>
                                  </TabsContent>
                                  <TabsContent value="vue" className="mt-4">
                                    <p className="rounded-md border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                                      Vue export is not available in this build.
                                    </p>
                                  </TabsContent>
                                  <TabsContent value="html" className="mt-4">
                                    <p className="rounded-md border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                                      HTML export is not available in this build.
                                    </p>
                                  </TabsContent>
                                </Tabs>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </div>

                        <AnimatePresence>
                          {showTuningPanel && (
                            <motion.div
                              className="lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)]"
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={slideInRight}
                            >
                              <TuningPanel
                                schema={generatedSchema}
                                code={generatedCode}
                                onSchemaChange={setCurrentSchema}
                                onCodeChange={setCurrentCode}
                                onClose={() => setShowTuningPanel(false)}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </section>

          <section
            id={BUILDER_SECTION_IDS.library}
            className="mt-12 scroll-mt-24 lg:scroll-mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Library</CardTitle>
                <CardDescription>Saved components will appear here.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                  No saved components yet. Generate one above, then we&apos;ll add persistence
                  here.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>

        {currentSchema && (
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            schema={currentSchema}
          />
        )}

        <AiAssistant
          phase={phase}
          onRegenerate={() => lastPrompt && void runGenerate(lastPrompt)}
          onExport={() => setShowExportModal(true)}
        />
      </motion.div>
    </DashboardLayout>
  );
}

// Made with Bob
