/**
 * Renders source with Shiki (VS Code–style token colors) for the builder output.
 */

"use client";

import { useEffect, useState } from "react";
import { IDE_SYNTAX_THEME } from "@/lib/syntax-highlight";
import { cn } from "@/lib/utils";

export type IdeCodeLang = "tsx" | "typescript" | "jsx" | "javascript" | "vue" | "html";

interface IdeCodeBlockProps {
  code: string;
  lang: IdeCodeLang;
  className?: string;
}

/**
 * Async highlighter: shows a short loading state, then colored HTML; falls back to plain monospace on error.
 */
export function IdeCodeBlock({ code, lang, className }: IdeCodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

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

  if (failed) {
    return (
      <pre
        className={cn(
          "max-h-[480px] overflow-auto rounded-md border border-border bg-muted/40 p-4 text-left font-mono text-xs leading-relaxed text-foreground",
          className
        )}
      >
        <code>{code}</code>
      </pre>
    );
  }

  if (html === null) {
    return (
      <div
        className={cn(
          "max-h-[480px] min-h-[12rem] animate-pulse rounded-md border border-border bg-muted/25",
          className
        )}
        aria-busy
        aria-label="Loading syntax highlighting"
      />
    );
  }

  return (
    <div
      className={cn(
        "max-h-[480px] overflow-auto rounded-md border border-border shadow-inner ring-1 ring-white/5",
        "[&_pre]:m-0 [&_pre]:rounded-md [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-relaxed [&_code]:font-mono",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Made with Bob
