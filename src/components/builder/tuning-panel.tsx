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
        'flex h-full flex-col overflow-hidden',
        'border-white/10 bg-black/30 backdrop-blur-xl',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-white">UX Tuning Panel</h2>
          <p className="text-xs text-slate-400">
            Customize your component visually
          </p>
        </div>
        
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-black/20 px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={tuning.undo}
          disabled={!tuning.canUndo}
          title="Undo (Ctrl+Z)"
          className="text-slate-400 hover:text-white disabled:opacity-30"
        >
          <Undo className="mr-2 h-4 w-4" />
          Undo
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={tuning.redo}
          disabled={!tuning.canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="text-slate-400 hover:text-white disabled:opacity-30"
        >
          <Redo className="mr-2 h-4 w-4" />
          Redo
        </Button>
        
        <div className="flex-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm('Reset all tuning changes?')) {
              tuning.reset();
            }
          }}
          title="Reset all changes"
          className="text-slate-400 hover:text-red-400"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
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

      {/* Footer */}
      <div className="border-t border-white/10 bg-black/20 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
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
        <details className="border-t border-white/10 bg-black/20 px-4 py-2">
          <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-300">
            Debug Info
          </summary>
          <div className="mt-2 space-y-1 text-xs text-slate-500">
            <div>Component ID: {tuning.state.componentId}</div>
            <div>Can Undo: {tuning.canUndo ? 'Yes' : 'No'}</div>
            <div>Can Redo: {tuning.canRedo ? 'Yes' : 'No'}</div>
            <div>
              Style Overrides:
              <pre className="mt-1 rounded bg-black/50 p-2 text-[10px]">
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