/**
 * Hex snapshots of `:root` sidebar tokens in `globals.css` (HSL → sRGB).
 * Used as tuning panel color defaults so generated form chrome matches the app shell.
 */
export const APP_SHELL_SIDEBAR_HEX = {
  /** `--sidebar-primary` hsl(326 100% 74%) */
  primary: '#ff77d5',
  /** Muted neutral for secondary actions on dark sidebar surfaces */
  secondary: '#64748b',
  /** `--sidebar` hsl(222 47% 11%) */
  background: '#0f172a',
  /** `--sidebar-foreground` hsl(210 40% 98%) */
  text: '#f8fafc',
} as const;

// Made with Bob
