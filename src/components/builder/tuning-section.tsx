/**
 * Tuning Section Component
 * 
 * Collapsible section wrapper for tuning panel controls.
 * Provides consistent styling and animation for all tuning sections.
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TuningSectionProps {
  /** Section title */
  title: string;
  
  /** Optional icon component */
  icon?: React.ReactNode;
  
  /** Whether section is open by default */
  defaultOpen?: boolean;
  
  /** Section content */
  children: React.ReactNode;
  
  /** Optional className for customization */
  className?: string;
}

/**
 * Collapsible section for tuning controls
 */
export function TuningSection({
  title,
  icon,
  defaultOpen = true,
  children,
  className,
}: TuningSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border-b border-border last:border-b-0', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors',
          'hover:bg-muted/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-muted-foreground [&_svg]:size-3.5">{icon}</span>
          )}
          <span className="font-medium text-foreground">{title}</span>
        </div>

        {isOpen ? (
          <ChevronDown className="size-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground" />
        )}
      </button>

      {/* Section Content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="space-y-3 px-4 pb-4 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// Made with Bob