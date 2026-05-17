/**
 * UI class tokens for the Builder "Export Component" dialog.
 * Aligned with sidebar / Library glass rail (border-sidebar-*, bg-sidebar/*, backdrop-blur).
 */
export const EXPORT_MODAL_THEME = {
  dialogContent:
    'flex max-h-[90vh] w-full max-w-4xl flex-col gap-0 overflow-hidden border border-sidebar-border/70 bg-sidebar/90 p-0 text-sidebar-foreground shadow-2xl ring-1 ring-sidebar-border/25 backdrop-blur-xl backdrop-saturate-150 sm:rounded-xl',
  hideRadixClose: '[&>button.absolute]:hidden',
  header:
    'flex items-center justify-between gap-4 border-b border-sidebar-border/50 bg-sidebar-accent/40 px-6 py-4 backdrop-blur-sm',
  title: 'text-lg font-semibold leading-none tracking-tight text-sidebar-foreground',
  subtitle: 'sr-only',
  body: 'flex-1 overflow-y-auto bg-gradient-to-br from-sidebar-accent/45 via-sidebar/85 to-sidebar-accent/70 p-6',
  footer:
    'flex items-center justify-between gap-3 border-t border-sidebar-border/25 bg-sidebar-accent/25 px-6 py-4 backdrop-blur-sm',
  sectionHeading: 'mb-3 block text-sm font-semibold text-sidebar-foreground',
  formatGrid: 'grid grid-cols-1 gap-3 md:grid-cols-2',
  formatCardBase:
    'rounded-lg border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  formatCardSelected:
    'border-sidebar-primary bg-sidebar-primary/15 shadow-sm ring-1 ring-sidebar-primary/25',
  formatCardIdle:
    'border-sidebar-border/55 bg-sidebar-accent/25 hover:border-sidebar-border hover:bg-sidebar-accent/40',
  formatLabel: 'mb-1 font-semibold text-sidebar-foreground',
  formatDescription: 'text-sm text-sidebar-foreground/65',
  optionRow:
    'flex items-center justify-between gap-4 rounded-lg border border-sidebar-border/55 bg-sidebar-accent/25 p-3 backdrop-blur-sm',
  optionTitle: 'font-medium text-sidebar-foreground',
  optionDescription: 'text-sm text-sidebar-foreground/65',
  stateStack: 'flex flex-col items-center justify-center py-12 text-center',
  stateTitle: 'text-lg font-medium text-sidebar-foreground',
  stateCaption: 'text-sm text-sidebar-foreground/65',
  successBanner:
    'flex items-center gap-3 rounded-lg border border-sidebar-border/55 bg-sidebar-accent/30 p-4 text-left backdrop-blur-sm',
  successIcon: 'size-5 shrink-0 text-sidebar-primary',
  successHeading: 'font-medium text-sidebar-foreground',
  successMeta: 'text-sm text-sidebar-foreground/65',
  errorIcon: 'mb-4 size-12 text-destructive',
  footerGhost:
    'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground focus-visible:ring-sidebar-ring',
  footerPrimary:
    'border-0 bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90 focus-visible:ring-sidebar-ring',
} as const;

// Made with Bob
