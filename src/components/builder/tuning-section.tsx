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
    <div
      className={cn(
        'border-b border-white/10 last:border-b-0',
        className
      )}
    >
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between px-4 py-3',
          'text-left transition-colors',
          'hover:bg-white/5',
          'focus:outline-none focus:ring-2 focus:ring-tv-blue-500/50'
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-tv-blue-400">
              {icon}
            </span>
          )}
          <span className="font-semibold text-white">
            {title}
          </span>
        </div>
        
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-slate-400 transition-transform" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400 transition-transform" />
        )}
      </button>

      {/* Section Content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="space-y-4 px-4 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Made with Bob