/**
 * Style Controls Component
 *
 * Sectioned UI for typography, layout, colors, and advanced Tailwind classes.
 */

'use client';

import React, { useCallback, useEffect, useId, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StyleOverrides } from '@/types/tuning';
import {
  BORDER_RADIUS_OPTIONS,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  SPACING_OPTIONS,
  STYLE_PANEL_RESET_VALUES,
  THEME_OPTIONS,
  TUNING_COLOR_PRESETS,
} from '@/types/tuning';
import {
  getContrastForegroundForHex,
  isValidHexColor,
  normalizeHex6,
  PREVIEW_DEFAULT_FORM_SURFACE_DARK,
  PREVIEW_DEFAULT_FORM_SURFACE_LIGHT,
  tryNormalizeUserHex,
} from '@/lib/tuning/color-contrast';
import { cn } from '@/lib/utils';

const DEFAULT_PRIMARY = '#2563eb';
const DEFAULT_SECONDARY = '#64748b';
const DEFAULT_BACKGROUND = '#ffffff';
const DEFAULT_TEXT = '#0f172a';

export interface StyleControlsProps {
  styleOverrides: StyleOverrides;
  onStyleChange: (overrides: Partial<StyleOverrides>) => void;
  disabled?: boolean;
  className?: string;
  slotClassNames?: { root?: string; section?: string; presets?: string };
}

interface HexColorFieldProps {
  label: string;
  value: string | undefined;
  fallbackHex: string;
  onCommit: (hex: string | undefined) => void;
  disabled?: boolean;
}

/**
 * Color picker + hex field with blur validation (invalid hex is not committed).
 */
function HexColorField({ label, value, fallbackHex, onCommit, disabled }: HexColorFieldProps) {
  const baseId = useId();
  const pickerId = `${baseId}-picker`;
  const textId = `${baseId}-text`;
  const resolved = value && isValidHexColor(value) ? normalizeHex6(value)! : undefined;
  const displayHex = resolved ?? fallbackHex;
  const [draft, setDraft] = useState(displayHex);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setDraft(displayHex);
    setInvalid(false);
  }, [displayHex]);

  const commitDraft = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setInvalid(false);
      onCommit(undefined);
      return;
    }
    const normalized = tryNormalizeUserHex(trimmed);
    if (normalized) {
      setInvalid(false);
      onCommit(normalized);
      setDraft(normalized);
    } else {
      setInvalid(true);
      setDraft(displayHex);
    }
  }, [draft, displayHex, onCommit]);

  return (
    <div className="space-y-2">
      <Label htmlFor={pickerId} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="flex gap-2">
        <input
          id={pickerId}
          type="color"
          value={displayHex}
          onChange={(e) => {
            const next = normalizeHex6(e.target.value);
            if (next) {
              setInvalid(false);
              setDraft(next);
              onCommit(next);
            }
          }}
          disabled={disabled}
          className={cn(
            'h-9 w-16 shrink-0 cursor-pointer rounded-md border border-border',
            'bg-background disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
        <input
          id={textId}
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (invalid) setInvalid(false);
          }}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
          disabled={disabled}
          placeholder={fallbackHex}
          aria-invalid={invalid}
          className={cn(
            'min-w-0 flex-1 rounded-md border bg-background px-2.5 py-1.5',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50',
            invalid ? 'border-destructive' : 'border-border'
          )}
        />
      </div>
      {invalid ? (
        <p className="text-xs text-destructive" role="alert">
          Use #RGB or #RRGGBB
        </p>
      ) : null}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

/**
 * Style customization controls
 */
export function StyleControls({
  styleOverrides,
  onStyleChange,
  disabled = false,
  className,
  slotClassNames,
}: StyleControlsProps) {
  const themeValue = styleOverrides.theme ?? 'system';
  const customClassesJoined = (styleOverrides.customClasses ?? []).join(' ');

  const defaultSurfaceForAutoText =
    styleOverrides.theme === 'dark'
      ? PREVIEW_DEFAULT_FORM_SURFACE_DARK
      : PREVIEW_DEFAULT_FORM_SURFACE_LIGHT;

  const handleAutoText = () => {
    const bg = styleOverrides.backgroundColor;
    const ref =
      bg && isValidHexColor(bg) ? normalizeHex6(bg)! : defaultSurfaceForAutoText;
    onStyleChange({ textColor: getContrastForegroundForHex(ref) });
  };

  return (
    <div className={cn('space-y-4', className, slotClassNames?.root)}>
      <section className={cn('space-y-3', slotClassNames?.section)}>
        <SectionTitle>Layout</SectionTitle>
        <div className="space-y-2">
          <Label htmlFor="tuning-theme" className="text-xs font-medium text-muted-foreground">
            Surface theme
          </Label>
          <Select
            value={themeValue}
            onValueChange={(v) =>
              onStyleChange({ theme: v as NonNullable<StyleOverrides['theme']> })
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="tuning-theme"
              className="h-9 cursor-pointer border-border bg-background text-foreground transition-colors duration-200"
            >
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover text-popover-foreground">
              {THEME_OPTIONS.map((o) => (
                <SelectItem
                  key={o.value}
                  value={o.value}
                  className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="border-radius" className="text-xs font-medium text-muted-foreground">
              Border radius
            </Label>
            <Select
              value={styleOverrides.borderRadius || 'md'}
              onValueChange={(value) =>
                onStyleChange({ borderRadius: value as StyleOverrides['borderRadius'] })
              }
              disabled={disabled}
            >
              <SelectTrigger
                id="border-radius"
                className="h-9 cursor-pointer border-border bg-background text-foreground transition-colors duration-200"
              >
                <SelectValue placeholder="Radius" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-popover-foreground">
                {BORDER_RADIUS_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spacing" className="text-xs font-medium text-muted-foreground">
              Spacing
            </Label>
            <Select
              value={styleOverrides.spacing || 'normal'}
              onValueChange={(value) =>
                onStyleChange({ spacing: value as StyleOverrides['spacing'] })
              }
              disabled={disabled}
            >
              <SelectTrigger
                id="spacing"
                className="h-9 cursor-pointer border-border bg-background text-foreground transition-colors duration-200"
              >
                <SelectValue placeholder="Spacing" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-popover-foreground">
                {SPACING_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Separator className="bg-border" />

      <section className={cn('space-y-3', slotClassNames?.section)}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <SectionTitle>Colors</SectionTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 cursor-pointer text-xs"
            onClick={handleAutoText}
            disabled={disabled}
          >
            Auto text
          </Button>
        </div>

        <div className={cn('flex flex-wrap gap-2', slotClassNames?.presets)}>
          {TUNING_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              title={preset.label}
              disabled={disabled}
              onClick={() =>
                onStyleChange({
                  primaryColor: preset.primaryColor,
                  secondaryColor: preset.secondaryColor,
                  backgroundColor: preset.backgroundColor,
                  textColor: preset.textColor,
                })
              }
              className={cn(
                'relative h-8 w-8 cursor-pointer rounded-full border-2 border-border ring-offset-2 ring-offset-background transition-all duration-200',
                'hover:ring-2 hover:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
              style={{
                background: `linear-gradient(135deg, ${preset.primaryColor} 50%, ${preset.secondaryColor} 50%)`,
              }}
              aria-label={`Apply ${preset.label} palette`}
            />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <HexColorField
            label="Primary"
            value={styleOverrides.primaryColor}
            fallbackHex={DEFAULT_PRIMARY}
            onCommit={(hex) => onStyleChange({ primaryColor: hex })}
            disabled={disabled}
          />
          <HexColorField
            label="Secondary"
            value={styleOverrides.secondaryColor}
            fallbackHex={DEFAULT_SECONDARY}
            onCommit={(hex) => onStyleChange({ secondaryColor: hex })}
            disabled={disabled}
          />
          <HexColorField
            label="Background"
            value={styleOverrides.backgroundColor}
            fallbackHex={DEFAULT_BACKGROUND}
            onCommit={(hex) => onStyleChange({ backgroundColor: hex })}
            disabled={disabled}
          />
          <HexColorField
            label="Text"
            value={styleOverrides.textColor}
            fallbackHex={DEFAULT_TEXT}
            onCommit={(hex) => onStyleChange({ textColor: hex })}
            disabled={disabled}
          />
        </div>
      </section>

      <Separator className="bg-border" />

      <section className={cn('space-y-3', slotClassNames?.section)}>
        <SectionTitle>Typography</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="font-family" className="text-xs font-medium text-muted-foreground">
              Font family
            </Label>
            <Select
              value={styleOverrides.fontFamily || 'sans'}
              onValueChange={(value) =>
                onStyleChange({ fontFamily: value as StyleOverrides['fontFamily'] })
              }
              disabled={disabled}
            >
              <SelectTrigger
                id="font-family"
                className="h-9 cursor-pointer border-border bg-background text-foreground transition-colors duration-200"
              >
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-popover-foreground">
                {FONT_FAMILY_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-size" className="text-xs font-medium text-muted-foreground">
              Font size
            </Label>
            <Select
              value={styleOverrides.fontSize || 'base'}
              onValueChange={(value) =>
                onStyleChange({ fontSize: value as StyleOverrides['fontSize'] })
              }
              disabled={disabled}
            >
              <SelectTrigger
                id="font-size"
                className="h-9 cursor-pointer border-border bg-background text-foreground transition-colors duration-200"
              >
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-popover-foreground">
                {FONT_SIZE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Separator className="bg-border" />

      <section className={cn('space-y-3', slotClassNames?.section)}>
        <SectionTitle>Advanced</SectionTitle>
        <div className="space-y-2">
          <Label htmlFor="custom-classes" className="text-xs font-medium text-muted-foreground">
            Extra Tailwind classes
          </Label>
          <Textarea
            id="custom-classes"
            disabled={disabled}
            defaultValue={customClassesJoined}
            key={customClassesJoined}
            placeholder="e.g. shadow-lg ring-1 ring-border"
            className="min-h-[72px] resize-y text-sm transition-colors duration-200"
            onBlur={(e) => {
              const parts = e.target.value
                .split(/[\s,]+/)
                .map((s) => s.trim())
                .filter(Boolean);
              onStyleChange({ customClasses: parts.length ? parts : undefined });
            }}
          />
          <p className="text-[11px] text-muted-foreground">Space or comma separated. Applied on blur.</p>
        </div>
      </section>

      <Button
        type="button"
        variant="outline"
        className="w-full cursor-pointer transition-colors duration-200"
        onClick={() => onStyleChange({ ...STYLE_PANEL_RESET_VALUES })}
        disabled={disabled}
      >
        Reset styles
      </Button>
    </div>
  );
}

// Made with Bob
