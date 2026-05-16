/**
 * Style Controls Component
 * 
 * UI controls for customizing component styles including colors,
 * spacing, borders, and typography.
 */

'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
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
  SPACING_OPTIONS,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
} from '@/types/tuning';
import { cn } from '@/lib/utils';

export interface StyleControlsProps {
  /** Current style overrides */
  styleOverrides: StyleOverrides;
  
  /** Callback when style changes */
  onStyleChange: (overrides: Partial<StyleOverrides>) => void;
  
  /** Whether controls are disabled */
  disabled?: boolean;
}

/**
 * Style customization controls
 */
export function StyleControls({
  styleOverrides,
  onStyleChange,
  disabled = false,
}: StyleControlsProps) {
  return (
    <div className="space-y-6">
      {/* Border Radius */}
      <div className="space-y-2">
        <Label htmlFor="border-radius" className="text-sm text-muted-foreground">
          Border Radius
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
            className="h-9 border-border bg-background text-foreground"
          >
            <SelectValue placeholder="Select border radius" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover text-popover-foreground">
            {BORDER_RADIUS_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="focus:bg-accent focus:text-accent-foreground"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Spacing */}
      <div className="space-y-2">
        <Label htmlFor="spacing" className="text-sm text-muted-foreground">
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
            className="h-9 border-border bg-background text-foreground"
          >
            <SelectValue placeholder="Select spacing" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover text-popover-foreground">
            {SPACING_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="focus:bg-accent focus:text-accent-foreground"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Primary Color */}
      <div className="space-y-2">
        <Label htmlFor="primary-color" className="text-sm text-muted-foreground">
          Primary Color
        </Label>
        <div className="flex gap-2">
          <input
            id="primary-color"
            type="color"
            value={styleOverrides.primaryColor || '#3b82f6'}
            onChange={(e) => onStyleChange({ primaryColor: e.target.value })}
            disabled={disabled}
            className={cn(
              'h-10 w-20 cursor-pointer rounded-md border border-border',
              'bg-background disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
          <input
            type="text"
            value={styleOverrides.primaryColor || '#3b82f6'}
            onChange={(e) => onStyleChange({ primaryColor: e.target.value })}
            disabled={disabled}
            placeholder="#3b82f6"
            className={cn(
              'flex-1 rounded-md border border-border bg-background px-3 py-2',
              'text-sm text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
        </div>
      </div>

      {/* Secondary Color */}
      <div className="space-y-2">
        <Label htmlFor="secondary-color" className="text-sm text-muted-foreground">
          Secondary Color
        </Label>
        <div className="flex gap-2">
          <input
            id="secondary-color"
            type="color"
            value={styleOverrides.secondaryColor || '#ec4899'}
            onChange={(e) => onStyleChange({ secondaryColor: e.target.value })}
            disabled={disabled}
            className={cn(
              'h-10 w-20 cursor-pointer rounded-md border border-border',
              'bg-background disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
          <input
            type="text"
            value={styleOverrides.secondaryColor || '#ec4899'}
            onChange={(e) => onStyleChange({ secondaryColor: e.target.value })}
            disabled={disabled}
            placeholder="#ec4899"
            className={cn(
              'flex-1 rounded-md border border-border bg-background px-3 py-2',
              'text-sm text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <Label htmlFor="background-color" className="text-sm text-muted-foreground">
          Background Color
        </Label>
        <div className="flex gap-2">
          <input
            id="background-color"
            type="color"
            value={styleOverrides.backgroundColor || '#ffffff'}
            onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
            disabled={disabled}
            className={cn(
              'h-10 w-20 cursor-pointer rounded-md border border-border',
              'bg-background disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
          <input
            type="text"
            value={styleOverrides.backgroundColor || '#ffffff'}
            onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
            disabled={disabled}
            placeholder="#ffffff"
            className={cn(
              'flex-1 rounded-md border border-border bg-background px-3 py-2',
              'text-sm text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Label htmlFor="font-family" className="text-sm text-muted-foreground">
          Font Family
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
            className="h-9 border-border bg-background text-foreground"
          >
            <SelectValue placeholder="Select font family" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover text-popover-foreground">
            {FONT_FAMILY_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="focus:bg-accent focus:text-accent-foreground"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <Label htmlFor="font-size" className="text-sm text-muted-foreground">
          Font Size
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
            className="h-9 border-border bg-background text-foreground"
          >
            <SelectValue placeholder="Select font size" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover text-popover-foreground">
            {FONT_SIZE_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="focus:bg-accent focus:text-accent-foreground"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <button
        onClick={() =>
          onStyleChange({
            borderRadius: 'md',
            spacing: 'normal',
            primaryColor: undefined,
            secondaryColor: undefined,
            backgroundColor: undefined,
            fontFamily: 'sans',
            fontSize: 'base',
          })
        }
        disabled={disabled}
        className={cn(
          'w-full rounded-md border border-border bg-muted/40 px-4 py-2',
          'text-sm text-muted-foreground transition-colors',
          'hover:bg-muted hover:text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        Reset Styles
      </button>
    </div>
  );
}

// Made with Bob