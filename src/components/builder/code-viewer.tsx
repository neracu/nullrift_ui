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
import { cn } from '@/lib/utils';
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
  
  /** Max height as a Tailwind class (no inline styles) */
  maxHeightClassName?: string;
}

/**
 * Code viewer with syntax highlighting and file tabs
 */
export function CodeViewer({
  files,
  title,
  className = '',
  showLineNumbers = true,
  maxHeightClassName = 'max-h-[min(28rem,50vh)]',
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
      typescript: 'text-sky-500',
      javascript: 'text-amber-500',
      html: 'text-orange-500',
      css: 'text-violet-500',
      json: 'text-emerald-500',
      markdown: 'text-muted-foreground',
      vue: 'text-emerald-600',
    };
    return colors[language] || 'text-muted-foreground';
  };

  if (files.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border border-border bg-muted/40 p-8 text-center',
          className
        )}
      >
        <FileCode className="mx-auto mb-4 size-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No files to display</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card text-card-foreground',
        className
      )}
    >
      {title && (
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      )}

      {files.length > 1 && (
        <div className="border-b border-border bg-muted/20">
          <div className="flex overflow-x-auto">
            {files.map((file, index) => (
              <button
                key={file.name}
                type="button"
                onClick={() => setActiveFileIndex(index)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                  index === activeFileIndex
                    ? 'border-primary bg-background text-primary'
                    : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <FileCode className="size-4 shrink-0" />
                <span>{file.name}</span>
                {file.size && (
                  <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/25 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn('text-xs font-medium', getLanguageColor(activeFile.language))}>
            {activeFile.language.toUpperCase()}
          </span>
          {activeFile.path && (
            <span className="truncate text-xs text-muted-foreground">{activeFile.path}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(activeFile)}
            className="h-7 text-xs"
          >
            {copiedFile === activeFile.name ? (
              <>
                <Check className="mr-1 size-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1 size-3" />
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
            <Download className="mr-1 size-3" />
            Download
          </Button>
        </div>
      </div>

      <div className={cn('overflow-auto bg-zinc-950', maxHeightClassName)}>
        <pre className="p-4 text-sm">
          <code className="font-mono text-zinc-100">
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
      <div className="select-none border-r border-border pr-4 text-right text-xs text-muted-foreground">
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