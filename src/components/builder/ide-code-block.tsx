/**
 * Renders source with Shiki (VS Code–style token colors) for the builder output.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { IDE_SYNTAX_THEME } from "@/lib/syntax-highlight";
import { downloadFile } from "@/lib/export";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type IdeCodeLang = "tsx" | "typescript" | "jsx" | "javascript" | "vue" | "html" | "css";

interface IdeCodeBlockProps {
  code: string;
  lang: IdeCodeLang;
  className?: string;
  /** Gutter with line indices (synced scroll with highlighted body). */
  showLineNumbers?: boolean;
  /** Optional monospace label in the toolbar (e.g. file name). */
  fileLabel?: string;
  /** When set, shows Download using {@link downloadFile}. */
  downloadFileName?: string;
}

/**
 * Async highlighter: shows a short loading state, then colored HTML; falls back to plain monospace on error.
 */
export function IdeCodeBlock({
  code,
  lang,
  className,
  showLineNumbers = false,
  fileLabel,
  downloadFileName,
}: IdeCodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const lines = useMemo(() => code.split("\n"), [code]);
  const showToolbar = Boolean(fileLabel?.trim() || downloadFileName);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { codeToHtml } = await import("shiki/bundle/web");
        const out = await codeToHtml(code, {
          lang,
          theme: IDE_SYNTAX_THEME,
        });
        if (active) {
          setHtml(out);
          setFailed(false);
        }
      } catch {
        if (active) {
          setFailed(true);
          setHtml(null);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [code, lang]);

  const onDownload = () => {
    if (!downloadFileName || !code) return;
    downloadFile(code, downloadFileName);
  };

  if (failed) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-md border border-border bg-muted/30 shadow-inner ring-1 ring-white/5",
          className
        )}
      >
        {showToolbar && (
          <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
            {fileLabel ? (
              <span className="truncate font-mono text-xs text-muted-foreground">{fileLabel}</span>
            ) : (
              <span />
            )}
            {downloadFileName ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 cursor-pointer gap-1.5 px-2 text-xs transition-colors"
                onClick={onDownload}
              >
                <Download className="size-3.5" aria-hidden />
                Download
              </Button>
            ) : null}
          </div>
        )}
        <div className="flex max-h-[480px] overflow-auto">
          {showLineNumbers && (
            <div
              className="sticky left-0 shrink-0 select-none border-r border-border/70 bg-muted/20 py-4 pr-3 text-right font-mono text-xs leading-relaxed text-muted-foreground"
              aria-hidden
            >
              {lines.map((_, index) => (
                <div key={index} className="min-h-[1.125rem]">
                  {index + 1}
                </div>
              ))}
            </div>
          )}
          <pre
            className={cn(
              "min-w-0 flex-1 overflow-visible p-4 text-left font-mono text-xs leading-relaxed text-foreground",
              !showLineNumbers && "max-h-[480px] overflow-auto"
            )}
          >
            <code>{code}</code>
          </pre>
        </div>
      </div>
    );
  }

  if (html === null) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-md border border-border bg-muted/25 shadow-inner ring-1 ring-white/5",
          className
        )}
      >
        {showToolbar && (
          <div className="flex h-10 items-center border-b border-border bg-muted/30 px-3" aria-hidden />
        )}
        <div
          className={cn(
            "max-h-[480px] min-h-[12rem] animate-pulse bg-muted/20 motion-reduce:animate-none",
            showLineNumbers && "min-h-[14rem]"
          )}
          aria-busy
          aria-label="Loading syntax highlighting"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border shadow-inner ring-1 ring-white/5",
        className
      )}
    >
      {showToolbar && (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
          {fileLabel ? (
            <span className="truncate font-mono text-xs text-muted-foreground">{fileLabel}</span>
          ) : (
            <span />
          )}
          {downloadFileName ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 cursor-pointer gap-1.5 px-2 text-xs transition-colors focus-visible:ring-1"
              onClick={onDownload}
            >
              <Download className="size-3.5" aria-hidden />
              Download
            </Button>
          ) : null}
        </div>
      )}
      <div className="flex max-h-[480px] overflow-auto">
        {showLineNumbers && (
          <div
            className="sticky left-0 shrink-0 select-none border-r border-border/70 bg-zinc-950/95 py-4 pr-3 text-right font-mono text-xs leading-relaxed text-zinc-500"
            aria-hidden
          >
            {lines.map((_, index) => (
              <div key={index} className="min-h-[1.125rem]">
                {index + 1}
              </div>
            ))}
          </div>
        )}
        <div
          className={cn(
            "min-w-0 flex-1 [&_pre]:m-0 [&_pre]:rounded-none [&_pre]:bg-transparent [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-relaxed [&_code]:font-mono",
            !showLineNumbers && "[&_pre]:rounded-md"
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

// Made with Bob
