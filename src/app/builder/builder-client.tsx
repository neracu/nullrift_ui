"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Copy, Eye, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Sidebar } from "@/components/dashboard/sidebar";
import { AiAssistant, type AiAssistantHandle } from "@/components/dashboard/ai-assistant";
import { PromptInput } from "@/components/builder/prompt-input";
import { GenerationLoading } from "@/components/builder/generation-loading";
import { GenerationError } from "@/components/builder/generation-error";
import { PreviewCanvas } from "@/components/builder/preview-canvas";
import { TuningPanel } from "@/components/builder/tuning-panel";
import { ExportModal } from "@/components/builder/export-modal";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { cn } from "@/lib/utils";
import type { ComponentSchema } from "@/lib/watsonx/types";

type BuilderPhase = "idle" | "loading" | "error" | "success";
type BuilderOutputView = "preview" | "code";

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
  const [outputView, setOutputView] = useState<BuilderOutputView>("preview");
  const [showExportModal, setShowExportModal] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [librarySheetOpen, setLibrarySheetOpen] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const [errorState, setErrorState] = useState<{
    error: string;
    code?: string;
    hint?: string;
    retryable?: boolean;
  } | null>(null);

  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const assistantRef = useRef<AiAssistantHandle>(null);

  useEffect(() => {
    if (phase === "success") {
      setOutputView("preview");
    }
  }, [phase]);

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
    scrollToBuilderSection(BUILDER_SECTION_IDS.generate);
    requestAnimationFrame(() => {
      if (phase === "success") {
        assistantRef.current?.focusFollowUp();
      } else {
        promptInputRef.current?.focus();
      }
    });
  }, [phase]);

  const handleSidebarLibrary = useCallback(() => {
    setLibrarySheetOpen(true);
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
          if (phase === "success") {
            assistantRef.current?.focusFollowUp();
          } else {
            promptInputRef.current?.focus();
          }
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

      <Sheet open={librarySheetOpen} onOpenChange={setLibrarySheetOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
          <SheetHeader className="space-y-1 text-left">
            <SheetTitle>Library</SheetTitle>
            <SheetDescription>Saved components will appear here.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex-1">
            <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No saved components yet. Generate from the prompt in the main view, then we&apos;ll
              add persistence here.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <motion.div
        className="relative flex min-h-0 flex-1 flex-col bg-background text-foreground"
        initial="hidden"
        animate="visible"
        variants={pageTransition}
      >
        <SidebarTrigger className="fixed left-4 top-4 z-40 md:hidden" aria-label="Open menu" />
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 pb-12 pt-14 md:px-8 md:pt-6">
          <section
            id={BUILDER_SECTION_IDS.generate}
            className="flex min-h-0 flex-1 flex-col scroll-mt-24 lg:scroll-mt-8"
          >
            {phase !== "success" ? (
              <div
                className={cn(
                  "flex w-full flex-col items-center px-0 py-8",
                  "min-h-[min(560px,calc(100svh-10rem))] flex-1 justify-center"
                )}
              >
                <AnimatePresence mode="wait">
                  {phase !== "loading" ? (
                    <motion.div
                      key="prompt-slot"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.22 }}
                      className="w-full max-w-3xl"
                    >
                      <Card className="w-full shadow-md">
                        <CardHeader>
                          <CardTitle className="text-lg">Prompt</CardTitle>
                          <CardDescription>
                            Natural language → generated React component
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <PromptInput
                            ref={promptInputRef}
                            embedded
                            onGenerate={(prompt) => void runGenerate(prompt)}
                            isGenerating={false}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="loading-slot"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.22 }}
                      className="w-full max-w-3xl"
                    >
                      <GenerationLoading onCancel={() => setPhase("idle")} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : null}

            <div className={cn("w-full space-y-6", phase !== "success" && "mt-8")}>
              <AnimatePresence mode="wait">
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
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div
                          className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-1"
                          role="group"
                          aria-label="Switch between preview and generated code"
                        >
                          <Button
                            type="button"
                            variant={outputView === "preview" ? "secondary" : "ghost"}
                            size="icon"
                            className="size-9 shrink-0"
                            aria-label="Show interactive preview"
                            aria-pressed={outputView === "preview"}
                            onClick={() => setOutputView("preview")}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant={outputView === "code" ? "secondary" : "ghost"}
                            size="icon"
                            className="size-9 shrink-0 font-mono text-sm font-bold leading-none"
                            aria-label="Show generated code"
                            aria-pressed={outputView === "code"}
                            onClick={() => setOutputView("code")}
                          >
                            <span aria-hidden className="select-none">
                              &lt;&gt;
                            </span>
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTuningPanel(!showTuningPanel)}
                          className="gap-2 self-end sm:self-auto"
                        >
                          <Settings className="h-4 w-4" />
                          {showTuningPanel ? "Hide" : "Show"} tuning
                        </Button>
                      </div>

                      <div
                        className={`grid gap-6 ${showTuningPanel ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1"}`}
                      >
                        <div className="relative min-h-[min(420px,50vh)] space-y-6">
                          <div className={cn(outputView === "preview" ? "block" : "hidden")}>
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
                            />
                          </div>

                          <div className={cn(outputView === "code" ? "block" : "hidden")}>
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
                          </div>
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
        </div>

        {currentSchema && (
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            schema={currentSchema}
          />
        )}

        <AiAssistant
          ref={assistantRef}
          phase={phase}
          onRegenerate={() => lastPrompt && void runGenerate(lastPrompt)}
          onExport={() => setShowExportModal(true)}
          onFollowUpGenerate={(prompt) => void runGenerate(prompt)}
        />
      </motion.div>
    </DashboardLayout>
  );
}

// Made with Bob
