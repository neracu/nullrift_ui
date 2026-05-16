/**
 * Maps schema styling (including UX tuning) to submit button class names and inline colors.
 * Shared by live preview and exporters.
 */

import type { StylingConfig } from '@/lib/watsonx/types';
import { getContrastForegroundForHex } from '@/lib/tuning/color-contrast';

const DEFAULT_PRIMARY_HEX = '#3b82f6';
const DEFAULT_SECONDARY_HEX = '#64748b';

export interface SubmitButtonPresentation {
  className: string;
  style: Record<string, string>;
}

function joinClasses(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Resolve Tailwind layout classes and inline color styles for the primary form submit control.
 */
export function resolveSubmitButtonPresentation(styling: StylingConfig): SubmitButtonPresentation {
  const primary = (styling.primaryColor && styling.primaryColor.trim()) || DEFAULT_PRIMARY_HEX;
  const secondary = (styling.secondaryColor && styling.secondaryColor.trim()) || DEFAULT_SECONDARY_HEX;
  const variant = styling.submitButtonVariant ?? 'solid';
  const size = styling.submitButtonSize ?? 'default';
  const fullWidth = styling.submitButtonFullWidth !== false;

  const sizeClasses =
    size === 'sm'
      ? 'text-sm px-3 py-1.5'
      : size === 'lg'
        ? 'text-lg px-5 py-2.5'
        : 'text-base px-4 py-2';

  const base = joinClasses(
    'inline-flex items-center justify-center font-medium rounded-md transition-opacity duration-200',
    'hover:opacity-90 active:opacity-80',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    fullWidth ? 'w-full' : 'w-auto min-w-[9rem]',
    sizeClasses
  );

  const style: Record<string, string> = {};

  if (variant === 'solid') {
    style.backgroundColor = primary;
    style.color = getContrastForegroundForHex(primary);
    return { className: base, style };
  }

  if (variant === 'secondary') {
    style.backgroundColor = secondary;
    style.color = getContrastForegroundForHex(secondary);
    return { className: base, style };
  }

  if (variant === 'outline') {
    const outlineBase = joinClasses(
      base,
      'border-2 bg-transparent',
      'hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.06]'
    );
    style.borderColor = primary;
    style.color = primary;
    return { className: outlineBase, style };
  }

  const ghostBase = joinClasses(
    base,
    'border-0 bg-transparent',
    'hover:bg-slate-900/[0.06] dark:hover:bg-white/[0.08]'
  );
  style.color = primary;
  return { className: ghostBase, style };
}

// Made with Bob
