'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  GENERATION_STAGES,
  useGenerationStageProgress,
} from '@/lib/builder/generation-stages';

interface GenerationLoadingProps {
  onCancel?: () => void;
}

/**
 * Full-page style loading card while the generate API runs (initial build).
 */
export function GenerationLoading({ onCancel }: GenerationLoadingProps) {
  const {
    currentStage,
    currentStageIndex,
    currentStageInfo,
    progress,
    elapsedSeconds,
    estimatedSecondsRemaining,
  } = useGenerationStageProgress(true);

  return (
    <div className="w-full">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight">
              Generating
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {currentStageInfo.description}
            </CardDescription>
          </div>
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={onCancel}
              title="Cancel"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50">
              <Loader2 className="size-4 animate-spin text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{currentStageInfo.label}</p>
              <p className="text-xs text-muted-foreground">
                {elapsedSeconds}s elapsed
                {estimatedSecondsRemaining > 0 ? ` · ~${estimatedSecondsRemaining}s left` : null}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
            </div>
          </div>

          <ol className="space-y-1.5" aria-label="Generation steps">
            {GENERATION_STAGES.map((stage, index) => {
              const isActive = stage.id === currentStage;
              const isComplete = index < currentStageIndex;
              const isPending = index > currentStageIndex;

              return (
                <li
                  key={stage.id}
                  className={cn(
                    'flex items-center gap-3 rounded-md border border-transparent px-2 py-2 text-sm transition-colors',
                    isActive && 'border-border bg-muted/40',
                    isPending && 'opacity-50'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-md border',
                      isComplete &&
                        'border-primary/30 bg-primary/10 text-primary',
                      isActive && 'border-primary/40 bg-primary/15 text-primary',
                      isPending && 'border-border bg-muted/30 text-muted-foreground'
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      stage.icon
                    )}
                  </span>
                  <span
                    className={cn(
                      'min-w-0 truncate font-medium',
                      isActive && 'text-foreground',
                      isComplete && 'text-muted-foreground',
                      isPending && 'text-muted-foreground'
                    )}
                  >
                    {stage.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

// Made with Bob
