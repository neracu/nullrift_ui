/**
 * UI class tokens for the Builder "Export Component" dialog.
 * Keeps export styling aligned with the app theme (shadcn / CSS variables).
 */
export const EXPORT_MODAL_THEME = {
  dialogContent:
    'flex max-h-[90vh] w-full max-w-4xl flex-col gap-0 overflow-hidden border-border bg-background p-0 text-foreground shadow-2xl sm:rounded-xl',
  hideRadixClose: '[&>button.absolute]:hidden',
  header: 'flex items-center justify-between gap-4 border-b border-border px-6 py-4',
  title: 'text-lg font-semibold leading-none tracking-tight',
  subtitle: 'sr-only',
  body: 'flex-1 overflow-y-auto p-6',
  footer: 'flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-6 py-4',
  sectionHeading: 'mb-3 block text-sm font-semibold text-foreground',
  formatGrid: 'grid grid-cols-1 gap-3 md:grid-cols-2',
  formatCardBase:
    'rounded-lg border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  formatCardSelected: 'border-primary bg-primary/5 shadow-sm',
  formatCardIdle: 'border-border bg-card hover:border-muted-foreground/40 hover:bg-muted/40',
  formatLabel: 'mb-1 font-semibold text-foreground',
  formatDescription: 'text-sm text-muted-foreground',
  optionRow:
    'flex items-center justify-between gap-4 rounded-lg border border-border bg-card/60 p-3',
  optionTitle: 'font-medium text-foreground',
  optionDescription: 'text-sm text-muted-foreground',
  stateStack: 'flex flex-col items-center justify-center py-12 text-center',
  stateTitle: 'text-lg font-medium text-foreground',
  stateCaption: 'text-sm text-muted-foreground',
  successBanner:
    'flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4 text-left',
  successIcon: 'size-5 shrink-0 text-primary',
  successHeading: 'font-medium text-foreground',
  successMeta: 'text-sm text-muted-foreground',
  errorIcon: 'mb-4 size-12 text-destructive',
} as const;

// Made with Bob
