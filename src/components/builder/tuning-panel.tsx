/**
 * Tuning Panel Component
 * 
 * Main panel for customizing generated components with style, structure,
 * and behavior controls. Includes undo/redo functionality.
 */

'use client';

import React, { useEffect } from 'react';
import { Palette, Layout, Settings, Undo, Redo, RotateCcw, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TuningSection } from './tuning-section';
import { StyleControls } from './style-controls';
import { StructureControls } from './structure-controls';
import { BehaviorControls } from './behavior-controls';
import { useTuning } from '@/hooks/use-tuning';
import type { ComponentSchema } from '@/lib/watsonx/types';
import { cn } from '@/lib/utils';

export interface TuningPanelProps {
  /** Initial component schema */
  schema: ComponentSchema;
  
  /** Initial generated code */
  code: string;
  
  /** Callback when schema changes */
  onSchemaChange?: (schema: ComponentSchema) => void;
  
  /** Callback when code changes */
  onCodeChange?: (code: string) => void;
  
  /** Callback when panel is closed */
  onClose?: () => void;
  
  /** Optional className */
  className?: string;
}

/**
 * Main tuning panel component
 */
export function TuningPanel({
  schema,
  code,
  onSchemaChange,
  onCodeChange,
  onClose,
  className,
}: TuningPanelProps) {
  // Initialize tuning hook
  const tuning = useTuning(schema, code, {
    onSchemaChange,
    onCodeChange,
    maxHistorySize: 50,
    autoSave: true,
    storageKey: `nullrift-tuning-${schema.id}`,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (tuning.canUndo) {
          tuning.undo();
        }
      }
      
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        if (tuning.canRedo) {
          tuning.redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tuning]);

  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden border-border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
            <Palette className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>UX Tuning</span>
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Visual and structure overrides</p>
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Close tuning panel"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={tuning.undo}
          disabled={!tuning.canUndo}
          title="Undo (Ctrl+Z)"
          className="h-8 gap-1.5 text-xs"
        >
          <Undo className="size-3.5" />
          Undo
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={tuning.redo}
          disabled={!tuning.canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="h-8 gap-1.5 text-xs"
        >
          <Redo className="size-3.5" />
          Redo
        </Button>

        <div className="min-w-[1rem] flex-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm('Reset all tuning changes?')) {
              tuning.reset();
            }
          }}
          title="Reset all changes"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Style Section */}
        <TuningSection
          title="Style"
          icon={<Palette className="h-4 w-4" />}
          defaultOpen={true}
        >
          <StyleControls
            styleOverrides={tuning.state.styleOverrides}
            onStyleChange={tuning.updateStyle}
          />
        </TuningSection>

        {/* Structure Section */}
        <TuningSection
          title="Structure"
          icon={<Layout className="h-4 w-4" />}
          defaultOpen={false}
        >
          <StructureControls
            schema={tuning.currentSchema}
            onAddField={tuning.addField}
            onRemoveField={tuning.removeField}
            onReorderFields={tuning.reorderFields}
            onModifyField={tuning.modifyField}
            onLayoutChange={tuning.changeLayout}
          />
        </TuningSection>

        {/* Behavior Section */}
        <TuningSection
          title="Behavior"
          icon={<Settings className="h-4 w-4" />}
          defaultOpen={false}
        >
          <BehaviorControls
            behaviorSettings={tuning.state.behaviorSettings}
            onBehaviorChange={tuning.updateBehavior}
          />
        </TuningSection>
      </div>

      <div className="border-t border-border bg-muted/20 px-4 py-2.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            History: {tuning.state.historyIndex + 1} / {tuning.state.history.length}
          </span>
          <span>
            {tuning.currentSchema.fields.length} field
            {tuning.currentSchema.fields.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="border-t border-border bg-muted/15 px-4 py-2">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Debug Info
          </summary>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div>Component ID: {tuning.state.componentId}</div>
            <div>Can Undo: {tuning.canUndo ? 'Yes' : 'No'}</div>
            <div>Can Redo: {tuning.canRedo ? 'Yes' : 'No'}</div>
            <div>
              Style Overrides:
              <pre className="mt-1 rounded-md border border-border bg-muted/40 p-2 text-[10px] text-foreground">
                {JSON.stringify(tuning.state.styleOverrides, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      )}
    </Card>
  );
}

// Made with Bob