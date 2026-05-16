'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Code2, Search, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

export type GenerationStageId = 'analyzing' | 'generating' | 'validating' | 'building';

export interface GenerationStageInfo {
  id: GenerationStageId;
  label: string;
  icon: ReactNode;
  description: string;
  duration: number;
}

export const GENERATION_STAGES: GenerationStageInfo[] = [
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

const TOTAL_DURATION = GENERATION_STAGES.reduce((sum, stage) => sum + stage.duration, 0);

export interface GenerationStageProgress {
  currentStage: GenerationStageId;
  currentStageIndex: number;
  currentStageInfo: GenerationStageInfo;
  progress: number;
  elapsedSeconds: number;
  estimatedSecondsRemaining: number;
}

/**
 * Drives timed generation stages for loading UIs; pauses and resets when `active` is false.
 */
export function useGenerationStageProgress(active: boolean): GenerationStageProgress {
  const [currentStage, setCurrentStage] = useState<GenerationStageId>('analyzing');
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const currentStageIndex = GENERATION_STAGES.findIndex((s) => s.id === currentStage);
  const currentStageInfo =
    GENERATION_STAGES[Math.max(0, currentStageIndex)] ?? GENERATION_STAGES[0];

  useEffect(() => {
    if (!active) {
      setCurrentStage('analyzing');
      setProgress(0);
      setElapsedSeconds(0);
      return;
    }

    setCurrentStage('analyzing');
    setProgress(0);
    setElapsedSeconds(0);

    const startTime = Date.now();
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const stageStartTime = Date.now();
    let animationFrame: number;
    const idx = GENERATION_STAGES.findIndex((s) => s.id === currentStage);
    const stageInfo = GENERATION_STAGES[idx];
    if (!stageInfo) return;

    const updateProgress = () => {
      const elapsed = Date.now() - stageStartTime;
      const previousStagesProgress = GENERATION_STAGES.slice(0, idx).reduce(
        (sum, stage) => sum + stage.duration,
        0
      );
      const overallProgress = ((previousStagesProgress + elapsed) / TOTAL_DURATION) * 100;
      setProgress(Math.min(overallProgress, 100));

      if (elapsed < stageInfo.duration) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else if (idx < GENERATION_STAGES.length - 1) {
        setCurrentStage(GENERATION_STAGES[idx + 1].id);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [active, currentStage]);

  const estimatedSecondsRemaining = Math.max(
    0,
    Math.ceil((TOTAL_DURATION - (progress / 100) * TOTAL_DURATION) / 1000)
  );

  return {
    currentStage,
    currentStageIndex: Math.max(0, currentStageIndex),
    currentStageInfo,
    progress,
    elapsedSeconds,
    estimatedSecondsRemaining,
  };
}

// Made with Bob
