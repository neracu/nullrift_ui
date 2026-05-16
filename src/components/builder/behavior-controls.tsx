/**
 * Behavior Controls Component
 * 
 * UI controls for customizing component behavior including validation
 * modes and interaction settings.
 */

'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BehaviorSettings } from '@/types/tuning';
import { VALIDATION_MODE_OPTIONS } from '@/types/tuning';
import { cn } from '@/lib/utils';

export interface BehaviorControlsProps {
  /** Current behavior settings */
  behaviorSettings: BehaviorSettings;
  
  /** Callback when behavior changes */
  onBehaviorChange: (settings: Partial<BehaviorSettings>) => void;
  
  /** Whether controls are disabled */
  disabled?: boolean;
}

/**
 * Behavior customization controls
 */
export function BehaviorControls({
  behaviorSettings,
  onBehaviorChange,
  disabled = false,
}: BehaviorControlsProps) {
  return (
    <div className="space-y-6">
      {/* Validation Mode */}
      <div className="space-y-2">
        <Label htmlFor="validation-mode" className="text-sm text-slate-300">
          Validation Mode
        </Label>
        <Select
          value={behaviorSettings.validationMode || 'onBlur'}
          onValueChange={(value) =>
            onBehaviorChange({
              validationMode: value as BehaviorSettings['validationMode'],
            })
          }
          disabled={disabled}
        >
          <SelectTrigger
            id="validation-mode"
            className="bg-black/30 border-white/10 text-white"
          >
            <SelectValue placeholder="Select validation mode" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10">
            {VALIDATION_MODE_OPTIONS.map((option) => (
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
        <p className="text-xs text-slate-500">
          When to validate field values
        </p>
      </div>

      {/* Show Errors Inline */}
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="show-errors-inline" className="text-sm text-slate-300">
            Show Errors Inline
          </Label>
          <p className="text-xs text-slate-500">
            Display validation errors below fields
          </p>
        </div>
        <Switch
          id="show-errors-inline"
          checked={behaviorSettings.showErrorsInline ?? true}
          onCheckedChange={(checked) =>
            onBehaviorChange({ showErrorsInline: checked })
          }
          disabled={disabled}
        />
      </div>

      {/* Auto Focus */}
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="auto-focus" className="text-sm text-slate-300">
            Auto Focus
          </Label>
          <p className="text-xs text-slate-500">
            Focus first field on component mount
          </p>
        </div>
        <Switch
          id="auto-focus"
          checked={behaviorSettings.autoFocus ?? false}
          onCheckedChange={(checked) =>
            onBehaviorChange({ autoFocus: checked })
          }
          disabled={disabled}
        />
      </div>

      {/* Submit on Enter */}
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="submit-on-enter" className="text-sm text-slate-300">
            Submit on Enter
          </Label>
          <p className="text-xs text-slate-500">
            Submit form when Enter key is pressed
          </p>
        </div>
        <Switch
          id="submit-on-enter"
          checked={behaviorSettings.submitOnEnter ?? true}
          onCheckedChange={(checked) =>
            onBehaviorChange({ submitOnEnter: checked })
          }
          disabled={disabled}
        />
      </div>

      {/* Show Required Indicators */}
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="show-required" className="text-sm text-slate-300">
            Show Required Indicators
          </Label>
          <p className="text-xs text-slate-500">
            Display asterisk (*) for required fields
          </p>
        </div>
        <Switch
          id="show-required"
          checked={behaviorSettings.showRequiredIndicators ?? true}
          onCheckedChange={(checked) =>
            onBehaviorChange({ showRequiredIndicators: checked })
          }
          disabled={disabled}
        />
      </div>

      {/* Info Box */}
      <div className="rounded-md border border-tv-blue-500/30 bg-tv-blue-500/10 p-3">
        <p className="text-xs text-slate-300">
          <span className="font-semibold text-tv-blue-400">Note:</span> Behavior
          settings affect how users interact with the component but don't change
          the visual appearance.
        </p>
      </div>
    </div>
  );
}

// Made with Bob