'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, Sparkles, CheckCircle2, Code2, X } from 'lucide-react';

interface GenerationLoadingProps {
  onCancel?: () => void;
}

type Stage = 'analyzing' | 'generating' | 'validating' | 'building';

interface StageInfo {
  id: Stage;
  label: string;
  icon: React.ReactNode;
  description: string;
  duration: number; // milliseconds
}

const STAGES: StageInfo[] = [
  {
    id: 'analyzing',
    label: 'Analyzing Prompt',
    icon: <Search className="w-5 h-5" />,
    description: 'Understanding your requirements and detecting component type',
    duration: 2000
  },
  {
    id: 'generating',
    label: 'Generating Schema',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Creating component structure with AI',
    duration: 4000
  },
  {
    id: 'validating',
    label: 'Validating Structure',
    icon: <CheckCircle2 className="w-5 h-5" />,
    description: 'Ensuring schema meets quality standards',
    duration: 1500
  },
  {
    id: 'building',
    label: 'Building Component',
    icon: <Code2 className="w-5 h-5" />,
    description: 'Generating React code and TypeScript types',
    duration: 2500
  }
];

export function GenerationLoading({ onCancel }: GenerationLoadingProps) {
  const [currentStage, setCurrentStage] = useState<Stage>('analyzing');
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const totalDuration = STAGES.reduce((sum, stage) => sum + stage.duration, 0);
  const currentStageIndex = STAGES.findIndex(s => s.id === currentStage);
  const currentStageInfo = STAGES[currentStageIndex];

  // Simulate stage progression
  useEffect(() => {
    const stageStartTime = Date.now();
    let animationFrame: number;

    const updateProgress = () => {
      const elapsed = Date.now() - stageStartTime;
      const stageProgress = Math.min((elapsed / currentStageInfo.duration) * 100, 100);
      
      // Calculate overall progress
      const previousStagesProgress = STAGES.slice(0, currentStageIndex)
        .reduce((sum, stage) => sum + stage.duration, 0);
      const overallProgress = ((previousStagesProgress + (elapsed / 1000) * 1000) / totalDuration) * 100;
      
      setProgress(Math.min(overallProgress, 100));
      
      if (elapsed < currentStageInfo.duration) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else if (currentStageIndex < STAGES.length - 1) {
        setCurrentStage(STAGES[currentStageIndex + 1].id);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [currentStage, currentStageIndex]);

  // Track elapsed time
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const estimatedTimeRemaining = Math.max(0, Math.ceil((totalDuration - (progress / 100) * totalDuration) / 1000));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Main Loading Card */}
      <div className="glass rounded-2xl p-8 shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 animate-pulse opacity-50 blur-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Generating Your Component</h3>
              <p className="text-sm text-gray-400">This usually takes 5-10 seconds</p>
            </div>
          </div>
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Cancel generation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">
              {Math.round(progress)}% Complete
            </span>
            <span className="text-sm text-gray-400">
              {elapsedTime}s elapsed • ~{estimatedTimeRemaining}s remaining
            </span>
          </div>
          
          <div className="relative h-2 bg-slate-900/50 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Stages */}
        <div className="space-y-4">
          {STAGES.map((stage, index) => {
            const isActive = stage.id === currentStage;
            const isComplete = index < currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/10 to-blue-500/10 border border-pink-500/30'
                    : isComplete
                    ? 'bg-green-500/5 border border-green-500/20'
                    : 'bg-white/5 border border-white/5'
                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white animate-pulse'
                    : isComplete
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-gray-500'
                }`}>
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      {stage.icon}
                    </motion.div>
                  ) : (
                    stage.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${
                      isActive ? 'text-white' : isComplete ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {stage.label}
                    </h4>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-1"
                      >
                        <motion.div
                          className="w-1.5 h-1.5 bg-pink-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-pink-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-pink-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </motion.div>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isActive ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {stage.description}
                  </p>
                </div>

                {/* Status Badge */}
                {isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full"
                  >
                    Done
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg"
        >
          <p className="text-sm text-gray-400 text-center">
            <span className="text-blue-400 font-medium">💡 Did you know?</span> Our AI can generate components in multiple frameworks and includes built-in validation logic!
          </p>
        </motion.div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-pink-500 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20,
              opacity: 0
            }}
            animate={{
              y: -20,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Made with Bob