'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

/**
 * Custom hook for managing keyboard shortcuts
 * 
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 'Enter',
 *       ctrl: true,
 *       action: handleGenerate,
 *       description: 'Generate component'
 *     }
 *   ]
 * });
 * ```
 */
export function useKeyboardShortcuts({
  enabled = true,
  shortcuts,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs (unless explicitly allowed)
    const target = event.target as HTMLElement;
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
    const isContentEditable = target.isContentEditable;

    for (const shortcut of shortcutsRef.current) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        // Allow Ctrl+Enter in inputs for form submission
        const allowInInput = shortcut.key === 'Enter' && shortcut.ctrl;
        
        if (!isInput && !isContentEditable || allowInInput) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}

/**
 * Format keyboard shortcut for display
 * 
 * @example
 * formatShortcut({ key: 'Enter', ctrl: true }) // "Ctrl+Enter"
 */
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'action' | 'description'>): string {
  const parts: string[] = [];
  
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (shortcut.meta && !isMac) {
    parts.push('Meta');
  }
  
  // Capitalize first letter of key
  const key = shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1);
  parts.push(key);
  
  return parts.join('+');
}

/**
 * Get platform-specific modifier key name
 */
export function getModifierKey(): 'Ctrl' | '⌘' {
  if (typeof navigator === 'undefined') return 'Ctrl';
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return isMac ? '⌘' : 'Ctrl';
}

/**
 * Common keyboard shortcuts for the app
 */
export const COMMON_SHORTCUTS = {
  GENERATE: { key: 'Enter', ctrl: true, description: 'Generate component' },
  EXPORT: { key: 'e', ctrl: true, description: 'Open export modal' },
  UNDO: { key: 'z', ctrl: true, description: 'Undo last change' },
  REDO: { key: 'z', ctrl: true, shift: true, description: 'Redo last change' },
  SAVE: { key: 's', ctrl: true, description: 'Save current state' },
  FOCUS_PROMPT: {
    key: 'k',
    ctrl: true,
    description: 'Focus main prompt or assistant follow-up',
  },
  CLOSE_MODAL: { key: 'Escape', description: 'Close modal or panel' },
  HELP: { key: '/', ctrl: true, description: 'Show keyboard shortcuts' },
} as const;

// Made with Bob
