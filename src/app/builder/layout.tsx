import type { ReactNode } from 'react';

/**
 * Builder route segment: semantic dark surface (html is already `.dark`).
 */
export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground antialiased">{children}</div>
  );
}

// Made with Bob
