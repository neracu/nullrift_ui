'use client';

import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AssistantState = 'minimized' | 'expanded';
type BuilderPhase = 'idle' | 'loading' | 'error' | 'success';

interface AiAssistantProps {
  phase?: BuilderPhase;
  onRegenerate?: () => void;
  onExport?: () => void;
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
 * Floating AI Assistant Component
 * 
 * Provides contextual help and quick actions based on the current builder phase.
 * Can be minimized to a floating button or expanded to show suggestions.
 */
export function AiAssistant({
  phase = 'idle',
  onRegenerate,
  onExport,
  className,
}: AiAssistantProps) {
  const [state, setState] = useState<AssistantState>('minimized');
  const [isPulsing, setIsPulsing] = useState(true);

  const toggleState = () => {
    setState(state === 'minimized' ? 'expanded' : 'minimized');
    setIsPulsing(false);
  };

  // Get contextual suggestions based on phase
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
            description: 'Try a different variation with modified prompt',
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
          // Minimized State - Floating Button
          <motion.button
            key="minimized"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleState}
            className="relative h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 shadow-2xl shadow-pink-500/50 transition-shadow hover:shadow-pink-500/70"
          >
            {/* Pulsing Ring */}
            {isPulsing && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-blue-500"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Icon */}
            <div className="relative flex h-full w-full items-center justify-center">
              <Bot className="h-8 w-8 text-white" />
            </div>

            {/* Badge */}
            {phase === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white shadow-lg"
              >
                !
              </motion.div>
            )}
          </motion.button>
        ) : (
          // Expanded State - Suggestions Panel
          <motion.div
            key="expanded"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="glass w-[400px] rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-blue-500">
                  <Bot className="h-6 w-6 text-white" />
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

            {/* Suggestions */}
            <div className="max-h-[400px] overflow-y-auto p-4">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-slate-300">
                  Suggestions
                </span>
              </div>

              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <motion.button
                    key={suggestion.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={suggestion.action}
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
                        <h4 className="text-sm font-medium text-white">
                          {suggestion.title}
                        </h4>
                        <p className="mt-1 text-xs text-slate-400">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-4">
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-sm text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
                <MessageCircle className="h-4 w-4" />
                <span>Chat with AI (Coming Soon)</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Made with Bob