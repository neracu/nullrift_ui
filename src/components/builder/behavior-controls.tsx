/**
 * Behavior Controls Component
 *
 * UX tuning for form validation timing, error presentation, and keyboard/focus behavior.
 */

'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BehaviorSettings } from '@/types/tuning';
import {
  ERROR_POSITION_OPTIONS,
  VALIDATION_DEBOUNCE_OPTIONS,
  VALIDATION_MODE_OPTIONS,
} from '@/types/tuning';
import { cn } from '@/lib/utils';

export interface BehaviorControlsProps {
  behaviorSettings: BehaviorSettings;
  onBehaviorChange: (settings: Partial<BehaviorSettings>) => void;
  disabled?: boolean;
}

const selectTriggerClass =
  'h-9 cursor-pointer border-border bg-background text-foreground transition-colors duration-200';
const selectContentClass = 'border-border bg-popover text-popover-foreground';
const selectItemClass = 'cursor-pointer focus:bg-accent focus:text-accent-foreground';

/**
 * Behavior customization controls (inspector-style sections).
 */
export function BehaviorControls({
  behaviorSettings,
  onBehaviorChange,
  disabled = false,
}: BehaviorControlsProps) {
  const d = behaviorSettings;
  const mode = d.validationMode ?? 'onBlur';
  const debounceDisabled = mode !== 'onChange';

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Validation
        </p>
        <div className="space-y-2">
          <Label htmlFor="validation-mode" className="text-xs font-medium text-muted-foreground">
            When to validate
          </Label>
          <Select
            value={mode}
            onValueChange={(value) =>
              onBehaviorChange({
                validationMode: value as BehaviorSettings['validationMode'],
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="validation-mode" className={selectTriggerClass}>
              <SelectValue placeholder="Select validation mode" />
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              {VALIDATION_MODE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className={selectItemClass}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="validate-debounce" className="text-xs font-medium text-muted-foreground">
            Change debounce
          </Label>
          <Select
            value={String(d.validateDebounceMs ?? 300)}
            onValueChange={(value) =>
              onBehaviorChange({
                validateDebounceMs: Number(value) as BehaviorSettings['validateDebounceMs'],
              })
            }
            disabled={disabled || debounceDisabled}
          >
            <SelectTrigger id="validate-debounce" className={selectTriggerClass}>
              <SelectValue placeholder="Debounce" />
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              {VALIDATION_DEBOUNCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)} className={selectItemClass}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Applies only when validation runs on change.
          </p>
        </div>
      </div>

      <Separator className="bg-border" />

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Errors</p>

        <div className="space-y-2">
          <Label htmlFor="error-position" className="text-xs font-medium text-muted-foreground">
            Error placement
          </Label>
          <Select
            value={d.errorPosition ?? 'below'}
            onValueChange={(value) =>
              onBehaviorChange({
                errorPosition: value as BehaviorSettings['errorPosition'],
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="error-position" className={selectTriggerClass}>
              <SelectValue placeholder="Placement" />
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              {ERROR_POSITION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className={selectItemClass}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          className={cn(
            'flex items-center justify-between gap-3 rounded-md border border-border/80 bg-muted/30 px-3 py-2.5'
          )}
        >
          <div className="min-w-0 space-y-0.5">
            <Label htmlFor="scroll-first-error" className="text-sm font-medium text-foreground">
              Scroll to first error
            </Label>
            <p className="text-xs text-muted-foreground">After submit fails validation</p>
          </div>
          <Switch
            id="scroll-first-error"
            checked={d.scrollToFirstErrorOnSubmit ?? false}
            onCheckedChange={(checked) =>
              onBehaviorChange({ scrollToFirstErrorOnSubmit: checked })
            }
            disabled={disabled}
          />
        </div>
      </div>

      <Separator className="bg-border" />

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Keyboard & focus
        </p>

        <div
          className={cn(
            'flex items-center justify-between gap-3 rounded-md border border-border/80 bg-muted/30 px-3 py-2.5'
          )}
        >
          <div className="min-w-0 space-y-0.5">
            <Label htmlFor="auto-focus" className="text-sm font-medium text-foreground">
              Auto-focus first field
            </Label>
            <p className="text-xs text-muted-foreground">On preview load</p>
          </div>
          <Switch
            id="auto-focus"
            checked={d.autoFocus ?? false}
            onCheckedChange={(checked) => onBehaviorChange({ autoFocus: checked })}
            disabled={disabled}
          />
        </div>

        <div
          className={cn(
            'flex items-center justify-between gap-3 rounded-md border border-border/80 bg-muted/30 px-3 py-2.5'
          )}
        >
          <div className="min-w-0 space-y-0.5">
            <Label htmlFor="submit-on-enter" className="text-sm font-medium text-foreground">
              Submit on Enter
            </Label>
            <p className="text-xs text-muted-foreground">Single-line inputs submit the form</p>
          </div>
          <Switch
            id="submit-on-enter"
            checked={d.submitOnEnter ?? true}
            onCheckedChange={(checked) => onBehaviorChange({ submitOnEnter: checked })}
            disabled={disabled}
          />
        </div>

        <div
          className={cn(
            'flex items-center justify-between gap-3 rounded-md border border-border/80 bg-muted/30 px-3 py-2.5'
          )}
        >
          <div className="min-w-0 space-y-0.5">
            <Label htmlFor="show-required" className="text-sm font-medium text-foreground">
              Required indicators
            </Label>
            <p className="text-xs text-muted-foreground">Asterisk on required labels</p>
          </div>
          <Switch
            id="show-required"
            checked={d.showRequiredIndicators ?? true}
            onCheckedChange={(checked) =>
              onBehaviorChange({ showRequiredIndicators: checked })
            }
            disabled={disabled}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Behavior is stored on the schema and drives the live preview.
      </p>
    </div>
  );
}

// Made with Bob
