'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, Wand2, Loader2 } from 'lucide-react';
import { EXAMPLE_PROMPTS, type ExamplePrompt } from '@/config/example-prompts';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function PromptInput({ onGenerate, isGenerating, disabled }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MIN_LENGTH = 10;
  const MAX_LENGTH = 2000;
  const isValid = prompt.length >= MIN_LENGTH && prompt.length <= MAX_LENGTH;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValid && !isGenerating) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prompt, isValid, isGenerating]);

  const handleSubmit = () => {
    if (isValid && !isGenerating && !disabled) {
      onGenerate(prompt);
    }
  };

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
    { value: 'feedback', label: 'Feedback' }
  ];

  const filteredExamples = selectedCategory === 'all'
    ? EXAMPLE_PROMPTS
    : EXAMPLE_PROMPTS.filter(ex => ex.category === selectedCategory);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-8 h-8 text-pink-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
            Generate Your Component
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          Describe your component in natural language, and watch AI bring it to life
        </p>
      </motion.div>

      {/* Main Input Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 shadow-2xl border border-white/10"
      >
        {/* Example Prompts Button */}
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="prompt" className="text-sm font-medium text-gray-300">
            Describe your component
          </label>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-pink-400 hover:text-pink-300 transition-colors rounded-lg hover:bg-white/5"
          >
            <Wand2 className="w-4 h-4" />
            Example Prompts
            <ChevronDown className={`w-4 h-4 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Examples Dropdown */}
        <AnimatePresence>
          {showExamples && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5">
                {/* Category Filter */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all ${
                        selectedCategory === cat.value
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Examples Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {filteredExamples.map(example => (
                    <button
                      key={example.id}
                      onClick={() => handleExampleSelect(example)}
                      className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-pink-500/30 group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white group-hover:text-pink-400 transition-colors">
                          {example.title}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 capitalize">
                          {example.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {example.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create a contact form with name, email, phone, and message fields. Include validation and a submit button with loading state."
            disabled={isGenerating || disabled}
            className="w-full min-h-[120px] max-h-[300px] px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={4}
          />
          
          {/* Character Counter */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className={`text-xs ${
              prompt.length < MIN_LENGTH
                ? 'text-gray-500'
                : prompt.length > MAX_LENGTH
                ? 'text-red-400'
                : 'text-green-400'
            }`}>
              {prompt.length} / {MAX_LENGTH}
            </span>
          </div>
        </div>

        {/* Validation Messages */}
        <AnimatePresence>
          {prompt.length > 0 && prompt.length < MIN_LENGTH && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-yellow-400 mt-2"
            >
              Prompt is too short. Please provide at least {MIN_LENGTH} characters.
            </motion.p>
          )}
          {prompt.length > MAX_LENGTH && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-red-400 mt-2"
            >
              Prompt is too long. Maximum {MAX_LENGTH} characters allowed.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Press <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">⌘</kbd> + <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">Enter</kbd> to generate
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!isValid || isGenerating || disabled}
            className="group relative px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg font-medium text-white transition-all hover:shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            <span className="flex items-center gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Component
                </>
              )}
            </span>
            
            {/* Shimmer effect */}
            {!isGenerating && !disabled && isValid && (
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-sm font-medium text-gray-300 mb-3">💡 Tips for better results:</h3>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-pink-500 mt-0.5">•</span>
              <span>Be specific about field types, validation rules, and styling preferences</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-500 mt-0.5">•</span>
              <span>Mention any special features like password strength indicators or conditional fields</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-500 mt-0.5">•</span>
              <span>Specify the theme (light/dark) and color preferences if you have any</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-500 mt-0.5">•</span>
              <span>Include accessibility requirements or responsive design needs</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

// Made with Bob