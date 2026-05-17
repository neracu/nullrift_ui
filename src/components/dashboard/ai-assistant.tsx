'use client';

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Sparkles,
  Lightbulb,
  Zap,
  RefreshCw,
  Download,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  useGenerationStageProgress,
} from '@/lib/builder/generation-stages';

type AssistantState = 'minimized' | 'expanded';
type BuilderPhase = 'idle' | 'loading' | 'error' | 'success';

const FOLLOW_UP_PROMPT_MIN_LENGTH = 10;
const FOLLOW_UP_PROMPT_MAX_LENGTH = 2000;

export type AiAssistantHandle = {
  /** Expands the panel and focuses the follow-up prompt when post-success generation is available. */
  focusFollowUp: () => void;
};

interface AiAssistantProps {
  phase?: BuilderPhase;
  /** True when a follow-up generate is running while the last build stays on screen. */
  isFollowUpBusy?: boolean;
  onRegenerate?: () => void;
  onExport?: () => void;
  /** After a successful build, sends a new natural-language prompt to run generate again. */
  onFollowUpGenerate?: (prompt: string) => void;
  className?: string;
}

interface Suggestion {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: () => void;
}

/**
 * Floating AI Assistant: phase hints, export/regenerate shortcuts, and follow-up prompts after a build.
 */
export const AiAssistant = forwardRef<AiAssistantHandle, AiAssistantProps>(
  function AiAssistant(
    { phase = 'idle', isFollowUpBusy = false, onRegenerate, onExport, onFollowUpGenerate, className },
    ref
  ) {
    const [state, setState] = useState<AssistantState>('minimized');
    const [isPulsing, setIsPulsing] = useState(true);
    const [followUpDraft, setFollowUpDraft] = useState('');
    const followUpRef = useRef<HTMLTextAreaElement>(null);

    const toggleState = () => {
      setState(state === 'minimized' ? 'expanded' : 'minimized');
      setIsPulsing(false);
    };

    useImperativeHandle(
      ref,
      () => ({
        focusFollowUp: () => {
          if (phase !== 'success' || !onFollowUpGenerate) return;
          setState('expanded');
          setIsPulsing(false);
          window.setTimeout(() => followUpRef.current?.focus(), 180);
        },
      }),
      [phase, onFollowUpGenerate]
    );

    const submitFollowUp = useCallback(() => {
      if (isFollowUpBusy) return;
      const trimmed = followUpDraft.trim();
      if (trimmed.length < FOLLOW_UP_PROMPT_MIN_LENGTH) {
        toast.error('Enter at least 10 characters', {
          description: 'Describe the next version you want to generate.',
        });
        return;
      }
      onFollowUpGenerate?.(trimmed);
      setFollowUpDraft('');
    }, [followUpDraft, onFollowUpGenerate, isFollowUpBusy]);

    const onFollowUpKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!isFollowUpBusy) submitFollowUp();
      }
    };

    const getSuggestions = (): Suggestion[] => {
      switch (phase) {
        case 'idle':
          return [
            {
              id: 'start',
              icon: <Sparkles className="h-5 w-5" />,
              title: 'Get Started',
              description: 'Try example prompts to see what AI can create',
            },
            {
              id: 'tips',
              icon: <Lightbulb className="h-5 w-5" />,
              title: 'Pro Tips',
              description: 'Be specific about validation, styling, and behavior',
            },
          ];
        case 'loading':
          return [
            {
              id: 'wait',
              icon: <Zap className="h-5 w-5" />,
              title: 'AI is Working',
              description: 'Analyzing your prompt and generating component...',
            },
          ];
        case 'success':
          return [
            {
              id: 'customize',
              icon: <Sparkles className="h-5 w-5" />,
              title: 'Customize',
              description: 'Use the tuning panel to adjust styles and structure',
            },
            {
              id: 'regenerate',
              icon: <RefreshCw className="h-5 w-5" />,
              title: 'Regenerate',
              description: 'Re-run with the same prompt as last time',
              action: onRegenerate,
            },
            {
              id: 'export',
              icon: <Download className="h-5 w-5" />,
              title: 'Export Code',
              description: 'Download in React, Vue, or HTML format',
              action: onExport,
            },
          ];
        case 'error':
          return [
            {
              id: 'retry',
              icon: <RefreshCw className="h-5 w-5" />,
              title: 'Try Again',
              description: 'Refine your prompt and regenerate',
              action: onRegenerate,
            },
            {
              id: 'help',
              icon: <Lightbulb className="h-5 w-5" />,
              title: 'Need Help?',
              description: 'Check prompt examples for inspiration',
            },
          ];
        default:
          return [];
      }
    };

    const suggestions = getSuggestions();
    const stageProgress = useGenerationStageProgress(isFollowUpBusy);

    return (
      <div className={cn('fixed bottom-6 right-6 z-50', className)}>
        <AnimatePresence mode="wait">
          {state === 'minimized' ? (
            <motion.button
              key="minimized"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleState}
              className={cn(
                'relative h-16 w-16 cursor-pointer overflow-hidden rounded-full',
                'border-2 border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg shadow-black/35',
                'ring-1 ring-sidebar-border/50',
                'transition-all duration-300',
                'hover:border-sidebar-primary/40 hover:bg-sidebar-accent hover:shadow-xl hover:shadow-black/40',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              )}
            >
              {isPulsing && (
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-full border border-sidebar-primary/25 bg-gradient-to-br from-sidebar-primary/15 via-transparent to-sidebar-accent/30"
                  animate={{
                    scale: [1, 1.12, 1],
                    opacity: [0.55, 0.2, 0.55],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              <div className="relative flex h-full w-full items-center justify-center">
                <Bot className="h-8 w-8 text-sidebar-primary drop-shadow-sm" aria-hidden />
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="expanded"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="w-[400px] rounded-2xl border border-sidebar-border/70 bg-sidebar/72 shadow-2xl ring-1 ring-sidebar-border/20 backdrop-blur-xl backdrop-saturate-150"
            >
              <div className="flex items-center justify-between border-b border-sidebar-border/50 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      'border border-sidebar-border/80 bg-sidebar-accent/50 backdrop-blur-md'
                    )}
                  >
                    <Bot className="h-6 w-6 text-sidebar-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sidebar-foreground">AI Assistant</h3>
                    <p className="text-xs text-sidebar-foreground/65">Here to help you build</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleState}
                  className="text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-sidebar-foreground/85">Suggestions</span>
                </div>

                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <motion.button
                      key={suggestion.id}
                      type="button"
                      disabled={Boolean(suggestion.action && phase === 'loading')}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => suggestion.action?.()}
                      className={cn(
                        'w-full rounded-lg border border-sidebar-border/50 bg-sidebar-accent/35 p-3 text-left backdrop-blur-sm transition-all hover:bg-sidebar-accent/55',
                        suggestion.action && 'cursor-pointer',
                        suggestion.action &&
                          phase === 'loading' &&
                          'pointer-events-none cursor-not-allowed opacity-50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-blue-500/20 text-pink-400">
                          {suggestion.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-sidebar-foreground">{suggestion.title}</h4>
                          <p className="mt-1 text-xs text-sidebar-foreground/65">{suggestion.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="border-t border-sidebar-border/50 p-4">
                {(phase === 'success' || isFollowUpBusy) && onFollowUpGenerate ? (
                  <div className="space-y-3">
                    {isFollowUpBusy ? (
                      <div className="space-y-2" aria-live="polite" aria-busy="true">
                        <div className="h-0.5 w-full overflow-hidden rounded-full bg-sidebar-border/40">
                          <motion.div
                            className="h-full rounded-full bg-sidebar-primary/70"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(stageProgress.progress, 100)}%` }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                          />
                        </div>
                        <div className="flex items-baseline justify-between gap-3 px-0.5">
                          <span className="min-w-0 truncate text-xs font-medium tracking-tight text-sidebar-foreground/90">
                            {stageProgress.currentStageInfo.label}
                          </span>
                          <span className="shrink-0 tabular-nums text-[10px] text-sidebar-foreground/50">
                            {stageProgress.elapsedSeconds}s
                            {stageProgress.estimatedSecondsRemaining > 0
                              ? ` · ~${stageProgress.estimatedSecondsRemaining}s`
                              : null}
                          </span>
                        </div>
                      </div>
                    ) : null}
                    <Textarea
                      ref={followUpRef}
                      value={followUpDraft}
                      onChange={(e) =>
                        setFollowUpDraft(
                          e.target.value.slice(0, FOLLOW_UP_PROMPT_MAX_LENGTH)
                        )
                      }
                      onKeyDown={onFollowUpKeyDown}
                      placeholder="Describe the next version or changes you want…"
                      rows={3}
                      disabled={isFollowUpBusy}
                      className={cn(
                        'resize-none border-sidebar-border/60 bg-sidebar-accent/40 text-sm text-sidebar-foreground backdrop-blur-sm',
                        'placeholder:text-sidebar-foreground/45',
                        'focus-visible:ring-1 focus-visible:ring-sidebar-ring',
                        isFollowUpBusy && 'cursor-wait opacity-70'
                      )}
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-sidebar-foreground/55">
                        {followUpDraft.length} / {FOLLOW_UP_PROMPT_MAX_LENGTH}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={submitFollowUp}
                        disabled={isFollowUpBusy}
                        className="gap-1.5"
                      >
                        {isFollowUpBusy ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            Generating
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-3.5" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-[11px] leading-snug text-sidebar-foreground/50">
                      ⌘/Ctrl + Enter to send
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-sidebar-accent/35 py-2 text-sm text-sidebar-foreground/70 backdrop-blur-sm transition-colors hover:border-sidebar-border/50 hover:bg-sidebar-accent/55 hover:text-sidebar-foreground"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Use the main prompt area to start a build</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AiAssistant.displayName = 'AiAssistant';

// Made with Bob
