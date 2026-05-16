/**
 * Post-generation builder workspace: tuning hook, preview canvas (design mode), and code tabs.
 */

'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Eye, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PreviewCanvas } from '@/components/builder/preview-canvas';
import { TuningPanel } from '@/components/builder/tuning-panel';
import { IdeCodeBlock, type IdeCodeLang } from '@/components/builder/ide-code-block';
import { CanvasSelectionBar } from '@/components/builder/canvas-selection-bar';
import { useTuning } from '@/hooks/use-tuning';
import { slideInRight, fadeIn } from '@/lib/animations/variants';
import type { PreviewCanvasMode } from '@/lib/preview/types';
import type { ComponentSchema } from '@/lib/watsonx/types';
import { generateCode } from '@/lib/generator/code-builder';
import {
  componentNameToKebabCase,
  getFrameworkPreview,
} from '@/lib/builder/framework-preview-code';
import type { ExportFile } from '@/types/export';
import { cn } from '@/lib/utils';

export type BuilderOutputView = 'preview' | 'code';

type CodeFrameworkTab = 'react' | 'vue' | 'html';
type ReactSnippetTab = 'component' | 'types' | 'styles';

type FrameworkPreviewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; file: ExportFile };

function exportLanguageToShikiLang(lang: ExportFile['language']): IdeCodeLang {
  switch (lang) {
    case 'vue':
      return 'vue';
    case 'html':
      return 'html';
    case 'javascript':
      return 'javascript';
    case 'css':
      return 'css';
    default:
      return 'typescript';
  }
}

/** Stroke icon matching a compact `</>` code-glyph (preview toggle). */
function CodeJsxGlyphIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M7 7 3 12 7 17M17 7l4 5-4 5M11 6l2 12"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface BuilderSuccessWorkspaceProps {
  generatedSchema: ComponentSchema;
  generatedCode: string;
  outputView: BuilderOutputView;
  onOutputViewChange: (view: BuilderOutputView) => void;
  showTuningPanel: boolean;
  onToggleTuning: () => void;
  onSchemaChange: (schema: ComponentSchema) => void;
  onCodeChange: (code: string) => void;
  onTuningDirtyChange: (dirty: boolean) => void;
  onCopyCode: (text?: string) => void;
  currentCode: string;
}

/**
 * Holds useTuning, canvas design state, preview, and tuning sidebar for the success phase.
 */
export function BuilderSuccessWorkspace({
  generatedSchema,
  generatedCode,
  outputView,
  onOutputViewChange,
  showTuningPanel,
  onToggleTuning,
  onSchemaChange,
  onCodeChange,
  onTuningDirtyChange,
  onCopyCode,
  currentCode,
}: BuilderSuccessWorkspaceProps) {
  const tuning = useTuning(generatedSchema, generatedCode, {
    onSchemaChange,
    onCodeChange,
    maxHistorySize: 50,
    autoSave: true,
    storageKey: `nullrift-tuning-${generatedSchema.id}`,
  });

  const previewSchema = useDeferredValue(tuning.currentSchema);
  const previewCode = useDeferredValue(tuning.currentCode);

  const generatedPack = useMemo(() => generateCode(tuning.currentSchema), [tuning.currentSchema]);
  const fileBase = useMemo(
    () => componentNameToKebabCase(tuning.currentSchema.name),
    [tuning.currentSchema.name]
  );
  const hasStylesSnippet = Boolean(generatedPack.styles?.trim());

  const [codeFramework, setCodeFramework] = useState<CodeFrameworkTab>('react');
  const [reactSnippet, setReactSnippet] = useState<ReactSnippetTab>('component');
  const [vuePreview, setVuePreview] = useState<FrameworkPreviewState>({ status: 'idle' });
  const [htmlPreview, setHtmlPreview] = useState<FrameworkPreviewState>({ status: 'idle' });

  const [canvasMode, setCanvasMode] = useState<PreviewCanvasMode>('interact');
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);

  useEffect(() => {
    onTuningDirtyChange(tuning.isDirty);
  }, [tuning.isDirty, onTuningDirtyChange]);

  useEffect(() => {
    if (canvasMode === 'interact') {
      setSelectedFieldIds([]);
    }
  }, [canvasMode]);

  useEffect(() => {
    if (outputView !== 'code' || codeFramework !== 'vue') {
      setVuePreview({ status: 'idle' });
      return;
    }
    let cancelled = false;
    setVuePreview({ status: 'loading' });
    void getFrameworkPreview(tuning.currentSchema, 'vue').then((res) => {
      if (cancelled) return;
      if ('error' in res) setVuePreview({ status: 'error', message: res.error });
      else setVuePreview({ status: 'ready', file: res.file });
    });
    return () => {
      cancelled = true;
    };
  }, [outputView, codeFramework, tuning.currentSchema]);

  useEffect(() => {
    if (outputView !== 'code' || codeFramework !== 'html') {
      setHtmlPreview({ status: 'idle' });
      return;
    }
    let cancelled = false;
    setHtmlPreview({ status: 'loading' });
    void getFrameworkPreview(tuning.currentSchema, 'html').then((res) => {
      if (cancelled) return;
      if ('error' in res) setHtmlPreview({ status: 'error', message: res.error });
      else setHtmlPreview({ status: 'ready', file: res.file });
    });
    return () => {
      cancelled = true;
    };
  }, [outputView, codeFramework, tuning.currentSchema]);

  useEffect(() => {
    if (!hasStylesSnippet && reactSnippet === 'styles') {
      setReactSnippet('component');
    }
  }, [hasStylesSnippet, reactSnippet]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (e.key === 'Escape') {
        setSelectedFieldIds([]);
      }
      if (e.key === 'd' || e.key === 'D') {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          setCanvasMode('design');
        }
      }
      if (e.key === 'i' || e.key === 'I') {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          setCanvasMode('interact');
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onFieldCanvasSelect = useCallback((fieldId: string, opts: { additive: boolean }) => {
    setSelectedFieldIds((prev) => {
      if (opts.additive) {
        const next = new Set(prev);
        if (next.has(fieldId)) next.delete(fieldId);
        else next.add(fieldId);
        return [...next];
      }
      return [fieldId];
    });
  }, []);

  const onCanvasReorder = useCallback(
    (newOrder: string[]) => {
      tuning.reorderFields(newOrder);
    },
    [tuning]
  );

  const onCycleFieldColSpan = useCallback(
    (fieldId: string) => {
      const field = tuning.currentSchema.fields.find((f) => f.id === fieldId);
      if (!field) return;
      const layout = tuning.currentSchema.layout;
      const max = layout === 'grid' ? 3 : layout === 'two-column' ? 2 : 1;
      if (max <= 1) return;
      const cur = field.layout?.colSpan ?? 1;
      const next = cur >= max ? 1 : cur + 1;
      const bounded = Math.min(next, max) as 1 | 2 | 3;
      tuning.modifyField(fieldId, {
        layout: { ...field.layout, colSpan: bounded },
      });
    },
    [tuning]
  );

  const clearCanvasSelection = useCallback(() => setSelectedFieldIds([]), []);

  const handleBatchRemove = useCallback(() => {
    if (selectedFieldIds.length === 0) return;
    tuning.removeFields(selectedFieldIds);
    setSelectedFieldIds([]);
  }, [selectedFieldIds, tuning]);

  const handleBatchDuplicate = useCallback(() => {
    if (selectedFieldIds.length === 0) return;
    tuning.duplicateFields(selectedFieldIds);
    setSelectedFieldIds([]);
  }, [selectedFieldIds, tuning]);

  const getActiveCodeText = useCallback((): string => {
    if (codeFramework === 'react') {
      if (reactSnippet === 'component') return currentCode;
      if (reactSnippet === 'types') return generatedPack.types;
      return generatedPack.styles ?? '';
    }
    if (codeFramework === 'vue' && vuePreview.status === 'ready') return vuePreview.file.content;
    if (codeFramework === 'html' && htmlPreview.status === 'ready') return htmlPreview.file.content;
    return '';
  }, [codeFramework, reactSnippet, currentCode, generatedPack, vuePreview, htmlPreview]);

  const handleCopyActive = useCallback(() => {
    const text = getActiveCodeText();
    if (!text.trim()) {
      toast.error('Nothing to copy yet', {
        description: 'Switch file or wait for the preview to finish loading.',
      });
      return;
    }
    onCopyCode(text);
  }, [getActiveCodeText, onCopyCode]);

  return (
    <motion.div
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
            variant={outputView === 'preview' ? 'secondary' : 'ghost'}
            size="icon"
            className="size-9 shrink-0"
            aria-label="Show interactive preview"
            aria-pressed={outputView === 'preview'}
            onClick={() => onOutputViewChange('preview')}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            type="button"
            variant={outputView === 'code' ? 'secondary' : 'ghost'}
            size="icon"
            className="size-9 shrink-0"
            aria-label="Show generated code"
            aria-pressed={outputView === 'code'}
            onClick={() => onOutputViewChange('code')}
          >
            <CodeJsxGlyphIcon className="size-4" />
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleTuning}
          className="gap-2 self-end sm:self-auto"
        >
          <Settings className="h-4 w-4" />
          {showTuningPanel ? 'Hide' : 'Show'} tuning
        </Button>
      </div>

      <div className={`grid gap-6 ${showTuningPanel ? 'lg:grid-cols-[1fr_380px]' : 'grid-cols-1'}`}>
        <div className="relative min-h-[min(420px,50vh)] space-y-6">
          <div className={cn(outputView === 'preview' ? 'block' : 'hidden')}>
            <div className="relative">
              <PreviewCanvas
                schema={previewSchema}
                code={previewCode}
                canvasMode={canvasMode}
                selectedFieldIds={selectedFieldIds}
                onFieldCanvasSelect={onFieldCanvasSelect}
                onCanvasReorder={onCanvasReorder}
                onCanvasLayerReorder={tuning.reorderLayers}
                onCycleFieldColSpan={onCycleFieldColSpan}
                onCanvasModeChange={setCanvasMode}
                onDesignSchemaMetaChange={tuning.modifySchemaMeta}
                onDesignFieldCopyChange={tuning.modifyField}
                onSubmit={(data) => {
                  console.log('Form submitted:', data);
                  toast.success('Form submitted successfully!', {
                    description: 'Check the console for submitted data',
                  });
                }}
                onError={(error) => {
                  console.error('Preview error:', error);
                  toast.error('Preview error', {
                    description: error.message,
                  });
                }}
              />
              {canvasMode === 'design' && (
                <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
                  <CanvasSelectionBar
                    count={selectedFieldIds.length}
                    onRemove={handleBatchRemove}
                    onDuplicate={handleBatchDuplicate}
                    onClear={clearCanvasSelection}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={cn(outputView === 'code' ? 'block' : 'hidden')}>
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="text-lg">Generated code</CardTitle>
                  <CardDescription>
                    React matches the live preview; Vue and HTML are bundled export previews.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyActive}
                  className="cursor-pointer gap-2 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={codeFramework}
                  onValueChange={(v) => setCodeFramework(v as CodeFrameworkTab)}
                  className="w-full"
                >
                  <TabsList className="h-9 w-full justify-start sm:w-auto">
                    <TabsTrigger
                      value="react"
                      className="cursor-pointer transition-colors data-[state=active]:font-medium"
                    >
                      React
                    </TabsTrigger>
                    <TabsTrigger
                      value="vue"
                      className="cursor-pointer transition-colors data-[state=active]:font-medium"
                    >
                      Vue
                    </TabsTrigger>
                    <TabsTrigger
                      value="html"
                      className="cursor-pointer transition-colors data-[state=active]:font-medium"
                    >
                      HTML
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="react" className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2" role="tablist" aria-label="React file">
                      <Button
                        type="button"
                        size="sm"
                        variant={reactSnippet === 'component' ? 'secondary' : 'outline'}
                        className="cursor-pointer transition-colors"
                        aria-pressed={reactSnippet === 'component'}
                        onClick={() => setReactSnippet('component')}
                      >
                        Component
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={reactSnippet === 'types' ? 'secondary' : 'outline'}
                        className="cursor-pointer transition-colors"
                        aria-pressed={reactSnippet === 'types'}
                        onClick={() => setReactSnippet('types')}
                      >
                        Types
                      </Button>
                      {hasStylesSnippet ? (
                        <Button
                          type="button"
                          size="sm"
                          variant={reactSnippet === 'styles' ? 'secondary' : 'outline'}
                          className="cursor-pointer transition-colors"
                          aria-pressed={reactSnippet === 'styles'}
                          onClick={() => setReactSnippet('styles')}
                        >
                          Styles
                        </Button>
                      ) : null}
                    </div>
                    {reactSnippet === 'component' ? (
                      <IdeCodeBlock
                        code={currentCode}
                        lang="tsx"
                        fileLabel={`${tuning.currentSchema.name}.tsx`}
                        downloadFileName={`${fileBase}.tsx`}
                      />
                    ) : null}
                    {reactSnippet === 'types' ? (
                      <IdeCodeBlock
                        code={generatedPack.types}
                        lang="typescript"
                        fileLabel={`${fileBase}.types.ts`}
                        downloadFileName={`${fileBase}.types.ts`}
                      />
                    ) : null}
                    {reactSnippet === 'styles' && hasStylesSnippet ? (
                      <IdeCodeBlock
                        code={generatedPack.styles ?? ''}
                        lang="css"
                        fileLabel={`${fileBase}.module.css`}
                        downloadFileName={`${fileBase}.module.css`}
                      />
                    ) : null}
                  </TabsContent>
                  <TabsContent value="vue" className="mt-4">
                    {vuePreview.status === 'loading' || vuePreview.status === 'idle' ? (
                      <div
                        className="max-h-[480px] min-h-[12rem] animate-pulse rounded-md border border-border bg-muted/25 motion-reduce:animate-none"
                        aria-busy
                        aria-label="Loading Vue preview"
                      />
                    ) : null}
                    {vuePreview.status === 'error' ? (
                      <p className="rounded-md border border-dashed border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                        {vuePreview.message}
                      </p>
                    ) : null}
                    {vuePreview.status === 'ready' ? (
                      <IdeCodeBlock
                        code={vuePreview.file.content}
                        lang={exportLanguageToShikiLang(vuePreview.file.language)}
                        fileLabel={vuePreview.file.name}
                        downloadFileName={vuePreview.file.name}
                      />
                    ) : null}
                  </TabsContent>
                  <TabsContent value="html" className="mt-4">
                    {htmlPreview.status === 'loading' || htmlPreview.status === 'idle' ? (
                      <div
                        className="max-h-[480px] min-h-[12rem] animate-pulse rounded-md border border-border bg-muted/25 motion-reduce:animate-none"
                        aria-busy
                        aria-label="Loading HTML preview"
                      />
                    ) : null}
                    {htmlPreview.status === 'error' ? (
                      <p className="rounded-md border border-dashed border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                        {htmlPreview.message}
                      </p>
                    ) : null}
                    {htmlPreview.status === 'ready' ? (
                      <IdeCodeBlock
                        code={htmlPreview.file.content}
                        lang={exportLanguageToShikiLang(htmlPreview.file.language)}
                        fileLabel={htmlPreview.file.name}
                        downloadFileName={htmlPreview.file.name}
                      />
                    ) : null}
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
                tuning={tuning}
                highlightedFieldIds={canvasMode === 'design' ? selectedFieldIds : []}
                onFieldSelectionChange={setSelectedFieldIds}
                onClose={() => onToggleTuning()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Made with Bob
