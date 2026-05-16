'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatShortcut, getModifierKey, type KeyboardShortcut } from '@/hooks/use-keyboard-shortcuts';

interface KeyboardShortcutsModalProps {
  shortcuts: KeyboardShortcut[];
  /** When set, open state is controlled by the parent */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Keyboard Shortcuts Modal
 *
 * Displays all available keyboard shortcuts in a modal dialog.
 * Can be triggered with Ctrl+/ or by clicking a help button.
 */
export function KeyboardShortcutsModal({
  shortcuts,
  open: controlledOpen,
  onOpenChange,
}: KeyboardShortcutsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
      if (!isControlled) {
        setInternalOpen(next);
      }
    },
    [isControlled, onOpenChange]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        setOpen(!open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  const modifierKey = getModifierKey();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange?.(next);
        if (!isControlled) setInternalOpen(next);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and interact with NullRift UI faster
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="grid gap-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
              >
                <span className="text-sm">{shortcut.description}</span>
                <kbd className="pointer-events-none inline-flex h-7 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Press <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">{modifierKey}+/</kbd> to toggle this dialog
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Keyboard Shortcut Badge Component
 * 
 * Displays a keyboard shortcut in a badge format
 */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
      {children}
    </kbd>
  );
}

// Made with Bob
