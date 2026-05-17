'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, Wand2, Loader2 } from 'lucide-react';
import { EXAMPLE_PROMPTS, type ExamplePrompt } from '@/config/example-prompts';
import { cn } from '@/lib/utils';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  disabled?: boolean;
  /** Omit marketing header and outer glass shell when wrapped by a parent Card */
  embedded?: boolean;
  /** When `embedded` and `sidebar`, use `sidebar-*` tokens to match the builder rail */
  embeddedVariant?: 'default' | 'sidebar';
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

/**
 * Natural-language prompt field with examples, validation, and generate action.
 */
export const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  function PromptInput(
    { onGenerate, isGenerating, disabled, embedded = false, embeddedVariant = 'default' },
    forwardedRef
  ) {
    const [prompt, setPrompt] = useState('');
    const [showExamples, setShowExamples] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const sidebarDock = embedded && embeddedVariant === 'sidebar';

    const MIN_LENGTH = 10;
    const MAX_LENGTH = 2000;
    const isValid = prompt.length >= MIN_LENGTH && prompt.length <= MAX_LENGTH;

    const setTextareaRef = mergeRefs(textareaRef, forwardedRef);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [prompt]);

    const handleSubmit = useCallback(() => {
      if (isValid && !isGenerating && !disabled) {
        onGenerate(prompt);
      }
    }, [isValid, isGenerating, disabled, onGenerate, prompt]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValid && !isGenerating) {
          e.preventDefault();
          handleSubmit();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [prompt, isValid, isGenerating, handleSubmit]);

    const handleExampleSelect = (example: ExamplePrompt) => {
      setPrompt(example.prompt);
      setShowExamples(false);
      textareaRef.current?.focus();
    };

    const categories = [
      { value: 'all', label: 'All Examples' },
      { value: 'form', label: 'Forms' },
      { value: 'card', label: 'Cards' },
      { value: 'modal', label: 'Modals' },
      { value: 'layout', label: 'Layouts' },
      { value: 'data-display', label: 'Data Display' },
      { value: 'navigation', label: 'Navigation' },
      { value: 'feedback', label: 'Feedback' },
    ];

    const filteredExamples =
      selectedCategory === 'all'
        ? EXAMPLE_PROMPTS
        : EXAMPLE_PROMPTS.filter((ex) => ex.category === selectedCategory);

    const shellClass = embedded
      ? 'rounded-none border-0 bg-transparent p-0'
      : 'glass rounded-2xl p-6 shadow-2xl border border-white/10';

    const inner = (
      <>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label
            htmlFor="prompt"
            className={cn(
              'text-sm font-medium',
              sidebarDock ? 'text-sidebar-foreground/85' : 'text-foreground/80'
            )}
          >
            Describe your component
          </label>
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className={cn(
              'inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200',
              sidebarDock
                ? 'cursor-pointer border-sidebar-border/80 bg-sidebar-accent/40 text-sidebar-foreground/90 hover:border-sidebar-border hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'
                : 'border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground'
            )}
          >
            <Wand2
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                sidebarDock ? 'text-sidebar-primary' : 'text-primary/80'
              )}
            />
            Examples
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 shrink-0 transition-transform',
                showExamples ? 'rotate-180' : '',
                sidebarDock ? 'text-sidebar-foreground/65' : 'opacity-70'
              )}
            />
          </button>
        </div>

        <AnimatePresence>
          {showExamples && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div
                className={cn(
                  'rounded-lg border p-4',
                  sidebarDock
                    ? 'border-sidebar-border bg-sidebar-accent/35'
                    : 'border-border bg-muted/30'
                )}
              >
                <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedCategory(cat.value)}
                      className={cn(
                        'whitespace-nowrap rounded-full px-3 py-1 text-xs transition-all',
                        selectedCategory === cat.value
                          ? sidebarDock
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'bg-primary text-primary-foreground'
                          : sidebarDock
                            ? 'bg-sidebar/50 text-sidebar-foreground/80 hover:bg-sidebar-accent/80'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
                  {filteredExamples.map((example) => (
                    <button
                      key={example.id}
                      type="button"
                      onClick={() => handleExampleSelect(example)}
                      className={cn(
                        'group rounded-lg border p-3 text-left transition-colors duration-200',
                        sidebarDock
                          ? 'cursor-pointer border-sidebar-border/80 bg-sidebar/45 hover:border-sidebar-primary/50 hover:bg-sidebar-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'
                          : 'border-border bg-background/50 hover:border-primary/40 hover:bg-muted/40'
                      )}
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h4
                          className={cn(
                            'text-sm font-medium',
                            sidebarDock
                              ? 'text-sidebar-foreground group-hover:text-sidebar-primary'
                              : 'text-foreground group-hover:text-primary'
                          )}
                        >
                          {example.title}
                        </h4>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs capitalize',
                            sidebarDock
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          )}
                        >
                          {example.category}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'line-clamp-2 text-xs',
                          sidebarDock ? 'text-sidebar-foreground/70' : 'text-muted-foreground'
                        )}
                      >
                        {example.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <textarea
            ref={setTextareaRef}
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create a contact form with name, email, phone, and message fields. Include validation and a submit button with loading state."
            disabled={isGenerating || disabled}
            className={cn(
              'max-h-[min(52vh,420px)] min-h-[148px] w-full resize-none rounded-xl border px-5 py-4 text-[15px] leading-relaxed shadow-inner focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[168px] sm:text-base',
              sidebarDock
                ? 'border-sidebar-border/80 bg-sidebar-accent/25 text-sidebar-foreground placeholder:text-sidebar-foreground/45 focus-visible:border-sidebar-border focus-visible:ring-sidebar-ring'
                : 'border-border/60 bg-muted/20 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-border focus-visible:ring-ring'
            )}
            rows={5}
          />

          <div className="pointer-events-none absolute bottom-3.5 right-4">
            <span
              className={cn(
                'text-[11px] tabular-nums tracking-tight',
                prompt.length < MIN_LENGTH
                  ? sidebarDock
                    ? 'text-sidebar-foreground/50'
                    : 'text-muted-foreground'
                  : prompt.length > MAX_LENGTH
                    ? 'text-destructive'
                    : sidebarDock
                      ? 'text-sidebar-primary'
                      : 'text-emerald-600 dark:text-emerald-400'
              )}
            >
              {prompt.length} / {MAX_LENGTH}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {prompt.length > 0 && prompt.length < MIN_LENGTH && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'mt-2 text-xs',
                sidebarDock ? 'text-amber-300' : 'text-amber-500'
              )}
            >
              Prompt is too short. Please provide at least {MIN_LENGTH} characters.
            </motion.p>
          )}
          {prompt.length > MAX_LENGTH && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-xs text-destructive"
            >
              Prompt is too long. Maximum {MAX_LENGTH} characters allowed.
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p
            className={cn(
              'text-[11px] sm:text-xs',
              sidebarDock ? 'text-sidebar-foreground/65' : 'text-muted-foreground'
            )}
          >
            <span
              className={cn(
                sidebarDock ? 'text-sidebar-foreground/55' : 'text-muted-foreground/80'
              )}
            >
              Press{' '}
            </span>
            <kbd
              className={cn(
                'rounded-md border px-1.5 py-0.5 font-mono text-[10px]',
                sidebarDock
                  ? 'border-sidebar-border bg-sidebar-accent/60 text-sidebar-foreground'
                  : 'border-border/70 bg-muted/60 text-foreground/90'
              )}
            >
              ⌘
            </kbd>
            <span
              className={cn(
                sidebarDock ? 'text-sidebar-foreground/55' : 'text-muted-foreground/80'
              )}
            >
              {' '}
              +{' '}
            </span>
            <kbd
              className={cn(
                'rounded-md border px-1.5 py-0.5 font-mono text-[10px]',
                sidebarDock
                  ? 'border-sidebar-border bg-sidebar-accent/60 text-sidebar-foreground'
                  : 'border-border/70 bg-muted/60 text-foreground/90'
              )}
            >
              Enter
            </kbd>
            <span
              className={cn(
                sidebarDock ? 'text-sidebar-foreground/55' : 'text-muted-foreground/80'
              )}
            >
              {' '}
              to generate
            </span>
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isGenerating || disabled}
            className={cn(
              'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium shadow-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 sm:px-7',
              sidebarDock
                ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 focus-visible:ring-sidebar-ring'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring'
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate
              </>
            )}
          </button>
        </div>

        <div
          className={cn(
            'mt-7 border-t pt-6',
            sidebarDock ? 'border-sidebar-border/50' : 'border-border/40'
          )}
        >
          <p
            className={cn(
              'mb-3 text-[10px] font-medium uppercase tracking-wider',
              sidebarDock ? 'text-sidebar-foreground/55' : 'text-muted-foreground/80'
            )}
          >
            Quick guide
          </p>
          <ul
            className={cn(
              'grid gap-x-6 gap-y-2 text-[11px] leading-snug sm:grid-cols-2 sm:text-xs',
              sidebarDock ? 'text-sidebar-foreground/70' : 'text-muted-foreground'
            )}
          >
            <li>Field types, validation, and styling preferences</li>
            <li>Password rules, conditional fields, special UX</li>
            <li>Light/dark theme and palette when it matters</li>
            <li>Accessibility and responsive breakpoints</li>
          </ul>
        </div>
      </>
    );

    if (embedded) {
      return <div className={shellClass}>{inner}</div>;
    }

    return (
      <div className="mx-auto w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-3 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Generate Your Component</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Describe your component in natural language, and watch AI bring it to life
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={shellClass}
        >
          {inner}
        </motion.div>
      </div>
    );
  }
);

PromptInput.displayName = "PromptInput";

// Made with Bob
