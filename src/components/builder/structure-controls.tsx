/**
 * Structure Controls Component
 * 
 * UI controls for managing component structure including adding,
 * removing, and reordering fields.
 */

'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Copy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FieldDefinition } from '@/lib/watsonx/types';
import type { ComponentSchema } from '@/lib/watsonx/types';
import { FIELD_TYPE_OPTIONS, LAYOUT_OPTIONS } from '@/types/tuning';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface StructureControlsProps {
  /** Current component schema */
  schema: ComponentSchema;
  
  /** Callback when field is added */
  onAddField: (field: FieldDefinition) => void;
  
  /** Callback when field is removed */
  onRemoveField: (fieldId: string) => void;
  
  /** Callback when fields are reordered */
  onReorderFields: (newOrder: string[]) => void;
  
  /** Callback when field is modified */
  onModifyField: (fieldId: string, changes: Partial<FieldDefinition>) => void;
  
  /** Callback when layout changes */
  onLayoutChange: (layout: ComponentSchema['layout']) => void;
  
  /** Whether controls are disabled */
  disabled?: boolean;
}

/**
 * Structure management controls
 */
export function StructureControls({
  schema,
  onAddField,
  onRemoveField,
  onReorderFields,
  onModifyField,
  onLayoutChange,
  disabled = false,
}: StructureControlsProps) {
  const [selectedFieldType, setSelectedFieldType] = useState<FieldDefinition['type']>('input');
  const [newFieldLabel, setNewFieldLabel] = useState('');

  /**
   * Handle adding a new field
   */
  const handleAddField = () => {
    if (!newFieldLabel.trim()) {
      alert('Please enter a field label');
      return;
    }

    const newField: FieldDefinition = {
      id: `field_${Date.now()}`,
      type: selectedFieldType,
      label: newFieldLabel,
      placeholder: `Enter ${newFieldLabel.toLowerCase()}`,
    };

    // Add type-specific defaults
    if (selectedFieldType === 'select' || selectedFieldType === 'radio') {
      newField.options = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ];
    }

    onAddField(newField);
    setNewFieldLabel('');
  };

  /**
   * Move field up in order
   */
  const moveFieldUp = (fieldId: string) => {
    const index = schema.fields.findIndex((f) => f.id === fieldId);
    if (index <= 0) return;

    const newOrder = schema.fields.map((f) => f.id);
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onReorderFields(newOrder);
  };

  /**
   * Move field down in order
   */
  const moveFieldDown = (fieldId: string) => {
    const index = schema.fields.findIndex((f) => f.id === fieldId);
    if (index === -1 || index === schema.fields.length - 1) return;

    const newOrder = schema.fields.map((f) => f.id);
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onReorderFields(newOrder);
  };

  return (
    <div className="space-y-6">
      {/* Layout Selector */}
      <div className="space-y-2">
        <Label htmlFor="layout" className="text-sm text-slate-300">
          Layout
        </Label>
        <Select
          value={schema.layout}
          onValueChange={(value) =>
            onLayoutChange(value as ComponentSchema['layout'])
          }
          disabled={disabled}
        >
          <SelectTrigger
            id="layout"
            className="bg-black/30 border-white/10 text-white"
          >
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10">
            {LAYOUT_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-white hover:bg-white/10"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fields List */}
      <div className="space-y-2">
        <Label className="text-sm text-slate-300">
          Fields ({schema.fields.length})
        </Label>
        
        <div className="space-y-2 rounded-md border border-white/10 bg-black/20 p-2">
          {schema.fields.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              No fields yet. Add one below.
            </p>
          ) : (
            schema.fields.map((field, index) => (
              <div
                key={field.id}
                className={cn(
                  'group flex items-center gap-2 rounded-md border border-white/10',
                  'bg-black/30 p-2 transition-colors hover:bg-white/5'
                )}
              >
                {/* Drag Handle */}
                <div className="cursor-move text-slate-500">
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* Field Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {field.label}
                  </p>
                  <p className="text-xs text-slate-400">
                    {field.type}
                    {field.validation?.required && (
                      <span className="ml-1 text-tv-pink-400">*</span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Move Up */}
                  <button
                    onClick={() => moveFieldUp(field.id)}
                    disabled={disabled || index === 0}
                    className={cn(
                      'rounded p-1 text-slate-400 transition-colors',
                      'hover:bg-white/10 hover:text-white',
                      'disabled:cursor-not-allowed disabled:opacity-30'
                    )}
                    title="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => moveFieldDown(field.id)}
                    disabled={disabled || index === schema.fields.length - 1}
                    className={cn(
                      'rounded p-1 text-slate-400 transition-colors',
                      'hover:bg-white/10 hover:text-white',
                      'disabled:cursor-not-allowed disabled:opacity-30'
                    )}
                    title="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => {
                      if (confirm(`Remove field "${field.label}"?`)) {
                        onRemoveField(field.id);
                      }
                    }}
                    disabled={disabled}
                    className={cn(
                      'rounded p-1 text-slate-400 transition-colors',
                      'hover:bg-red-500/20 hover:text-red-400',
                      'disabled:cursor-not-allowed disabled:opacity-30'
                    )}
                    title="Remove field"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Field Form */}
      <div className="space-y-3 rounded-md border border-white/10 bg-black/20 p-3">
        <Label className="text-sm text-slate-300">Add New Field</Label>
        
        {/* Field Type */}
        <Select
          value={selectedFieldType}
          onValueChange={(value) =>
            setSelectedFieldType(value as FieldDefinition['type'])
          }
          disabled={disabled}
        >
          <SelectTrigger className="bg-black/30 border-white/10 text-white">
            <SelectValue placeholder="Select field type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10">
            {FIELD_TYPE_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-white hover:bg-white/10"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Field Label */}
        <input
          type="text"
          value={newFieldLabel}
          onChange={(e) => setNewFieldLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddField();
            }
          }}
          disabled={disabled}
          placeholder="Field label (e.g., Email Address)"
          className={cn(
            'w-full rounded-md border border-white/10 bg-black/30 px-3 py-2',
            'text-sm text-white placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-tv-blue-500/50',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />

        {/* Add Button */}
        <Button
          onClick={handleAddField}
          disabled={disabled || !newFieldLabel.trim()}
          variant="glass-blue"
          size="sm"
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
      </div>

      {/* Field Count Info */}
      <div className="rounded-md border border-white/10 bg-black/20 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Fields:</span>
          <span className="font-semibold text-white">{schema.fields.length}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-slate-400">Required Fields:</span>
          <span className="font-semibold text-white">
            {schema.fields.filter((f) => f.validation?.required).length}
          </span>
        </div>
      </div>
    </div>
  );
}

// Made with Bob