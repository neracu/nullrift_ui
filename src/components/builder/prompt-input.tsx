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
      ? 'rounded-lg border border-border bg-muted/20 p-4'
      : 'glass rounded-2xl p-6 shadow-2xl border border-white/10';

    const inner = (
      <>
        <div className="mb-4 flex items-center justify-between">
          <label htmlFor="prompt" className="text-sm font-medium text-muted-foreground">
            Describe your component
          </label>
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-primary transition-colors hover:bg-muted"
          >
            <Wand2 className="h-4 w-4" />
            Example Prompts
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showExamples ? 'rotate-180' : ''}`}
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
            className="max-h-[300px] min-h-[120px] w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            rows={4}
          />

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span
              className={`text-xs ${
                prompt.length < MIN_LENGTH
                  ? 'text-muted-foreground'
                  : prompt.length > MAX_LENGTH
                    ? 'text-destructive'
                    : 'text-emerald-500'
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

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Press{' '}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘</kbd>{' '}
            +{' '}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd>{' '}
            to generate
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isGenerating || disabled}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
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

        <div className="mt-6 border-t border-border pt-6">
          <h3 className="mb-3 text-sm font-medium text-foreground">Tips</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Be specific about field types, validation rules, and styling preferences</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Mention special features like password strength or conditional fields</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Specify theme (light/dark) and color preferences when relevant</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Include accessibility or responsive requirements</span>
            </li>
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
