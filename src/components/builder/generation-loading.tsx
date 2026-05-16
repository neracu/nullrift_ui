'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Code2, Loader2, Search, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GenerationLoadingProps {
  onCancel?: () => void;
}

type Stage = 'analyzing' | 'generating' | 'validating' | 'building';

interface StageInfo {
  id: Stage;
  label: string;
  icon: React.ReactNode;
  description: string;
  duration: number;
}

const STAGES: StageInfo[] = [
  {
    id: 'analyzing',
    label: 'Analyzing prompt',
    icon: <Search className="size-4" />,
    description: 'Detecting structure and intent',
    duration: 2000,
  },
  {
    id: 'generating',
    label: 'Generating schema',
    icon: <Sparkles className="size-4" />,
    description: 'Building the component model',
    duration: 4000,
  },
  {
    id: 'validating',
    label: 'Validating',
    icon: <CheckCircle2 className="size-4" />,
    description: 'Checking schema quality',
    duration: 1500,
  },
  {
    id: 'building',
    label: 'Writing code',
    icon: <Code2 className="size-4" />,
    description: 'Emitting React and types',
    duration: 2500,
  },
];

/**
 * Inline progress UI while the generate API runs: compact stages and a single progress track.
 */
export function GenerationLoading({ onCancel }: GenerationLoadingProps) {
  const [currentStage, setCurrentStage] = useState<Stage>('analyzing');
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const totalDuration = STAGES.reduce((sum, stage) => sum + stage.duration, 0);
  const currentStageIndex = STAGES.findIndex((s) => s.id === currentStage);
  const currentStageInfo = STAGES[currentStageIndex];

  useEffect(() => {
    const stageStartTime = Date.now();
    let animationFrame: number;

    const updateProgress = () => {
      const elapsed = Date.now() - stageStartTime;
      const previousStagesProgress = STAGES.slice(0, currentStageIndex).reduce(
        (sum, stage) => sum + stage.duration,
        0
      );
      const overallProgress =
        ((previousStagesProgress + elapsed) / totalDuration) * 100;

      setProgress(Math.min(overallProgress, 100));

      if (elapsed < currentStageInfo.duration) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else if (currentStageIndex < STAGES.length - 1) {
        setCurrentStage(STAGES[currentStageIndex + 1].id);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [currentStage, currentStageIndex, currentStageInfo.duration, totalDuration]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const estimatedTimeRemaining = Math.max(
    0,
    Math.ceil((totalDuration - (progress / 100) * totalDuration) / 1000)
  );

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
                {elapsedTime}s elapsed
                {estimatedTimeRemaining > 0 ? ` · ~${estimatedTimeRemaining}s left` : null}
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
            {STAGES.map((stage, index) => {
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
