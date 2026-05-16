/**
 * Post-generation builder workspace: tuning hook, preview canvas (design mode), and code tabs.
 */

'use client';

import { useCallback, useDeferredValue, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Eye, Code, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PreviewCanvas } from '@/components/builder/preview-canvas';
import { TuningPanel } from '@/components/builder/tuning-panel';
import { IdeCodeBlock } from '@/components/builder/ide-code-block';
import { CanvasSelectionBar } from '@/components/builder/canvas-selection-bar';
import { useTuning } from '@/hooks/use-tuning';
import { slideInRight, fadeIn } from '@/lib/animations/variants';
import type { PreviewCanvasMode } from '@/lib/preview/types';
import type { ComponentSchema } from '@/lib/watsonx/types';
import { cn } from '@/lib/utils';

export type BuilderOutputView = 'preview' | 'code';

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
  onCopyCode: () => void;
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
            <Code className="size-4" aria-hidden />
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
                  <CardDescription>Framework targets (React live)</CardDescription>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={onCopyCode} className="gap-2">
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
                    <IdeCodeBlock code={currentCode} lang="tsx" />
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
