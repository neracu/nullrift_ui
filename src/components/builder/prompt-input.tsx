'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, Wand2, Loader2 } from 'lucide-react';
import { EXAMPLE_PROMPTS, type ExamplePrompt } from '@/config/example-prompts';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  disabled?: boolean;
  /** Omit marketing header and outer glass shell when wrapped by a parent Card */
  embedded?: boolean;
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
    { onGenerate, isGenerating, disabled, embedded = false },
    forwardedRef
  ) {
    const [prompt, setPrompt] = useState('');
    const [showExamples, setShowExamples] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          <label htmlFor="prompt" className="text-sm font-medium text-foreground/80">
            Describe your component
          </label>
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
          >
            <Wand2 className="h-3.5 w-3.5 shrink-0 text-primary/80" />
            Examples
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 opacity-70 transition-transform ${showExamples ? 'rotate-180' : ''}`}
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
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs transition-all ${
                        selectedCategory === cat.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
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
                      className="group rounded-lg border border-border bg-background/50 p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-foreground group-hover:text-primary">
                          {example.title}
                        </h4>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground">
                          {example.category}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{example.description}</p>
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
            className="max-h-[min(52vh,420px)] min-h-[148px] w-full resize-none rounded-xl border border-border/60 bg-muted/20 px-5 py-4 text-[15px] leading-relaxed text-foreground shadow-inner placeholder:text-muted-foreground/70 focus-visible:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[168px] sm:text-base"
            rows={5}
          />

          <div className="pointer-events-none absolute bottom-3.5 right-4">
            <span
              className={`text-[11px] tabular-nums tracking-tight ${
                prompt.length < MIN_LENGTH
                  ? 'text-muted-foreground'
                  : prompt.length > MAX_LENGTH
                    ? 'text-destructive'
                    : 'text-emerald-600 dark:text-emerald-400'
              }`}
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
              className="mt-2 text-xs text-amber-500"
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
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            <span className="text-muted-foreground/80">Press </span>
            <kbd className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-foreground/90">
              ⌘
            </kbd>
            <span className="text-muted-foreground/80"> + </span>
            <kbd className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-foreground/90">
              Enter
            </kbd>
            <span className="text-muted-foreground/80"> to generate</span>
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isGenerating || disabled}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 sm:px-7"
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

        <div className="mt-7 border-t border-border/40 pt-6">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            Quick guide
          </p>
          <ul className="grid gap-x-6 gap-y-2 text-[11px] leading-snug text-muted-foreground sm:grid-cols-2 sm:text-xs">
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
