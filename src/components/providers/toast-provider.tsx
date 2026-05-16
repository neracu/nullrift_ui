'use client';

import { Toaster } from 'sonner';

/**
 * Toast Provider Component
 * 
 * Provides toast notification functionality throughout the app using Sonner.
 * Configured with custom styling to match the app's design system.
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
        className: 'toast',
      }}
    />
  );
}

// Made with Bob
