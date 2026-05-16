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
  
  /** Optional className for outer wrapper */
  className?: string;

  /** className for the collapsible trigger button */
  triggerClassName?: string;

  /** className for the inner content wrapper (padding area) */
  contentClassName?: string;
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
  triggerClassName,
  contentClassName,
}: TuningSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border-b border-border last:border-b-0', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm transition-colors duration-200',
          'hover:bg-muted/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          triggerClassName
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
          'overflow-hidden motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-in-out',
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className={cn('space-y-3 px-4 pb-4 pt-1', contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Made with Bob