/**
 * Pure helpers for hex color validation and accessible foreground on solid fills.
 */

/** Default form surface when no background override (light preview shell). */
export const PREVIEW_DEFAULT_FORM_SURFACE_LIGHT = '#ffffff';
/** Default form surface for dark-tuned preview. */
export const PREVIEW_DEFAULT_FORM_SURFACE_DARK = '#0f172a';

/** Validates #RGB or #RRGGBB (case-insensitive). */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/** Returns lowercase #rrggbb or null. */
export function normalizeHex6(color: string): string | null {
  if (!isValidHexColor(color)) return null;
  if (color.length === 4) {
    const r = color[1];
    const g = color[2];
    const b = color[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return color.toLowerCase();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex6(hex);
  if (!normalized) return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Picks black or white label color for text/icons on a solid hex background.
 */
export function getContrastForegroundForHex(backgroundHex: string): '#000000' | '#FFFFFF' {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) return '#000000';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Accepts user input with or without leading `#`; returns normalized #rrggbb or null.
 */
export function tryNormalizeUserHex(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const withHash = raw.startsWith('#') ? raw : `#${raw}`;
  return normalizeHex6(withHash);
}

// Made with Bob
