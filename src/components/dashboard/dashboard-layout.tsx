'use client';

import React from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Collapsible app sidebar (must use shadcn `Sidebar` + `SidebarRail` inside) */
  sidebar: React.ReactNode;
}

/**
 * Builder shell: SidebarProvider, fixed collapsible rail, and SidebarInset main landmark.
 */
export function DashboardLayout({ children, className, sidebar }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen className="min-h-svh w-full">
      {sidebar}
      <SidebarInset
        className={cn(
          'flex min-h-svh min-w-0 flex-1 flex-col border-border bg-dashboard-canvas md:border-l',
          className
        )}
      >
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

// Made with Bob
