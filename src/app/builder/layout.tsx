import type { ReactNode } from 'react';

/**
 * Builder route segment: main column uses --dashboard-canvas (duller field behind Prompt).
 */
export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-dashboard-canvas text-foreground antialiased">{children}</div>
  );
}

// Made with Bob
