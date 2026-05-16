/**
 * Code Viewer Component
 * 
 * Displays code with syntax highlighting, line numbers, and copy functionality.
 * Supports multiple files with tab navigation.
 */

"use client";

import { useState } from 'react';
import { Check, Copy, Download, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ExportFile } from '@/types/export';

interface CodeViewerProps {
  /** Files to display */
  files: ExportFile[];
  
  /** Optional title */
  title?: string;
  
  /** Optional className */
  className?: string;
  
  /** Show line numbers */
  showLineNumbers?: boolean;
  
  /** Max height */
  maxHeight?: string;
}

/**
 * Code viewer with syntax highlighting and file tabs
 */
export function CodeViewer({
  files,
  title,
  className = '',
  showLineNumbers = true,
  maxHeight = '600px',
}: CodeViewerProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const activeFile = files[activeFileIndex];

  /**
   * Copy file content to clipboard
   */
  const handleCopy = async (file: ExportFile) => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopiedFile(file.name);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  /**
   * Download individual file
   */
  const handleDownload = (file: ExportFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Get language-specific styling
   */
  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      typescript: 'text-blue-600',
      javascript: 'text-yellow-600',
      html: 'text-orange-600',
      css: 'text-purple-600',
      json: 'text-green-600',
      markdown: 'text-gray-600',
      vue: 'text-emerald-600',
    };
    return colors[language] || 'text-gray-600';
  };

  if (files.length === 0) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-gray-50 p-8 text-center ${className}`}>
        <FileCode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600">No files to display</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white overflow-hidden ${className}`}>
      {/* Header */}
      {title && (
        <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
      )}

      {/* File tabs */}
      {files.length > 1 && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {files.map((file, index) => (
              <button
                key={file.name}
                onClick={() => setActiveFileIndex(index)}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${
                    index === activeFileIndex
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <FileCode className="h-4 w-4" />
                <span>{file.name}</span>
                {file.size && (
                  <span className="text-xs text-gray-400">
                    ({formatFileSize(file.size)})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File info bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${getLanguageColor(activeFile.language)}`}>
            {activeFile.language.toUpperCase()}
          </span>
          {activeFile.path && (
            <span className="text-xs text-gray-500">
              {activeFile.path}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(activeFile)}
            className="h-7 text-xs"
          >
            {copiedFile === activeFile.name ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(activeFile)}
            className="h-7 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Code content */}
      <div
        className="overflow-auto bg-gray-900"
        style={{ maxHeight }}
      >
        <pre className="p-4 text-sm">
          <code className="text-gray-100 font-mono">
            {showLineNumbers ? (
              <LineNumberedCode content={activeFile.content} />
            ) : (
              activeFile.content
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

/**
 * Code with line numbers
 */
function LineNumberedCode({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="flex">
      {/* Line numbers */}
      <div className="select-none pr-4 text-right text-gray-500 border-r border-gray-700">
        {lines.map((_, index) => (
          <div key={index} className="leading-6">
            {index + 1}
          </div>
        ))}
      </div>

      {/* Code lines */}
      <div className="pl-4 flex-1">
        {lines.map((line, index) => (
          <div key={index} className="leading-6">
            {line || '\u00A0'}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Made with Bob