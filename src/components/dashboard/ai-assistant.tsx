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
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

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
    { phase = 'idle', onRegenerate, onExport, onFollowUpGenerate, className },
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
      const trimmed = followUpDraft.trim();
      if (trimmed.length < FOLLOW_UP_PROMPT_MIN_LENGTH) {
        toast.error('Enter at least 10 characters', {
          description: 'Describe the next version you want to generate.',
        });
        return;
      }
      onFollowUpGenerate?.(trimmed);
      setFollowUpDraft('');
    }, [followUpDraft, onFollowUpGenerate]);

    const onFollowUpKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submitFollowUp();
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
                'relative h-16 w-16 overflow-hidden rounded-full',
                'border border-white/25 bg-white/[0.08] shadow-2xl shadow-black/30',
                'backdrop-blur-2xl backdrop-saturate-150',
                'transition-all duration-300',
                'hover:border-white/40 hover:bg-white/[0.12] hover:shadow-black/40'
              )}
            >
              {isPulsing && (
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-full border border-white/35 bg-gradient-to-br from-fuchsia-400/10 via-transparent to-cyan-400/10"
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
                <Bot className="h-8 w-8 text-white/95 drop-shadow-sm" />
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="expanded"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="glass w-[400px] rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      'border border-white/25 bg-white/[0.08] backdrop-blur-xl'
                    )}
                  >
                    <Bot className="h-6 w-6 text-white/95" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Assistant</h3>
                    <p className="text-xs text-slate-400">Here to help you build</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleState}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-300">Suggestions</span>
                </div>

                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <motion.button
                      key={suggestion.id}
                      type="button"
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => suggestion.action?.()}
                      className={cn(
                        'w-full rounded-lg border border-white/10 bg-white/5 p-3 text-left transition-all hover:bg-white/10',
                        suggestion.action && 'cursor-pointer'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-blue-500/20 text-pink-400">
                          {suggestion.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{suggestion.title}</h4>
                          <p className="mt-1 text-xs text-slate-400">{suggestion.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 p-4">
                {phase === 'success' && onFollowUpGenerate ? (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-slate-300">Next generation</p>
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
                      className={cn(
                        'resize-none border-white/15 bg-white/5 text-sm text-white',
                        'placeholder:text-slate-500',
                        'focus-visible:ring-1 focus-visible:ring-white/30'
                      )}
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">
                        {followUpDraft.length} / {FOLLOW_UP_PROMPT_MAX_LENGTH}
                      </span>
                      <Button type="button" size="sm" onClick={submitFollowUp} className="gap-1.5">
                        <Sparkles className="size-3.5" />
                        Generate
                      </Button>
                    </div>
                    <p className="text-[11px] leading-snug text-slate-500">
                      ⌘/Ctrl + Enter to send
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-sm text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
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
