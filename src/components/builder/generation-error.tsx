'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  RefreshCw, 
  ChevronDown, 
  Copy, 
  CheckCircle2,
  Lightbulb,
  ExternalLink,
  X
} from 'lucide-react';

interface GenerationErrorProps {
  error: string;
  code?: string;
  hint?: string;
  details?: string;
  retryable?: boolean;
  onRetry: () => void;
  onDismiss?: () => void;
}

export function GenerationError({
  error,
  code,
  hint,
  details,
  retryable = true,
  onRetry,
  onDismiss
}: GenerationErrorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const errorText = `Error: ${error}\nCode: ${code || 'UNKNOWN'}\n${details ? `\nDetails: ${details}` : ''}`;
    await navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSuggestions = (): string[] => {
    const suggestions: string[] = [];

    if (code === 'CONFIG_ERROR') {
      suggestions.push('Check your .env.local file exists');
      suggestions.push('Verify WATSONX_API_KEY is set correctly');
      suggestions.push('Ensure WATSONX_PROJECT_ID is valid');
    } else if (code === 'RATE_LIMIT_EXCEEDED') {
      suggestions.push('Wait a moment before trying again');
      suggestions.push('Consider upgrading your API plan');
    } else if (code === 'TIMEOUT') {
      suggestions.push('Try simplifying your prompt');
      suggestions.push('Check your internet connection');
      suggestions.push('Try again in a few moments');
    } else if (code === 'PARSE_ERROR') {
      suggestions.push('Rephrase your prompt to be more specific');
      suggestions.push('Try using one of the example prompts');
      suggestions.push('Break down complex requirements into simpler ones');
    } else if (code === 'VALIDATION_ERROR') {
      suggestions.push('Try a different component type');
      suggestions.push('Simplify your requirements');
      suggestions.push('Use more standard field types');
    } else {
      suggestions.push('Try again with a different prompt');
      suggestions.push('Check the example prompts for guidance');
      suggestions.push('Ensure your internet connection is stable');
    }

    return suggestions;
  };

  const suggestions = getSuggestions();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Main Error Card */}
      <div className="glass rounded-2xl p-6 shadow-2xl border border-red-500/30 bg-red-500/5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-xl font-bold text-white">Generation Failed</h3>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Dismiss error"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <p className="text-gray-300 mb-2">{error}</p>
            
            {code && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-sm">
                <span className="text-red-400 font-mono">{code}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hint */}
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-400 mb-1">Helpful Hint</h4>
                <p className="text-sm text-gray-300">{hint}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">💡 Try these solutions:</h4>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 text-sm text-gray-400"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium mt-0.5">
                    {index + 1}
                  </span>
                  <span>{suggestion}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {retryable && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-pink-500/50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Error
              </>
            )}
          </button>

          <a
            href="https://github.com/yourusername/nullrift-ui/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Report Issue
          </a>
        </div>

        {/* Error Details (Collapsible) */}
        {details && (
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left text-sm text-gray-400 hover:text-white transition-colors"
            >
              <span className="font-medium">Technical Details</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-white/5">
                    <pre className="text-xs text-gray-400 whitespace-pre-wrap break-words font-mono">
                      {details}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Help Resources */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-sm font-medium text-gray-300 mb-3">📚 Need more help?</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/docs/troubleshooting"
              className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors group"
            >
              <span className="flex-1">Troubleshooting Guide</span>
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href="/docs/api-reference"
              className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors group"
            >
              <span className="flex-1">API Reference</span>
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </div>

      {/* Floating Error Indicator */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>
    </motion.div>
  );
}

// Made with Bob