/**
 * Export Component dialog: format, options, generate, preview, and download — themed for the app shell.
 */

"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CodeViewer } from "./code-viewer";
import { downloadZip, formatFileSize } from "@/lib/export";
import { cn } from "@/lib/utils";
import { EXPORT_MODAL_THEME } from "@/config/export-modal-theme";
import type { ComponentSchema } from "@/lib/watsonx/types";
import type { TuningState } from "@/types/tuning";
import type { ExportFormat, ExportOptions, ExportResponse } from "@/types/export";
import { FORMAT_LABELS, FORMAT_DESCRIPTIONS } from "@/types/export";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: ComponentSchema;
  tuningState?: TuningState;
}

type ExportPhase = "config" | "generating" | "preview" | "error";

/**
 * Modal: pick format and options, call /api/export, preview files, download ZIP or single file.
 */
export function ExportModal({ isOpen, onClose, schema, tuningState }: ExportModalProps) {
  const [phase, setPhase] = useState<ExportPhase>("config");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("react-ts");
  const [options, setOptions] = useState<ExportOptions>({
    includeTypes: true,
    includeTests: false,
    includeStorybook: false,
    bundled: false,
    includePackageJson: true,
    includeReadme: true,
    includeComments: true,
  });
  const [exportResult, setExportResult] = useState<ExportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhase("config");
      setExportResult(null);
      setError(null);
    }
  }, [isOpen]);

  const handleExport = async () => {
    setPhase("generating");
    setError(null);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema,
          format: selectedFormat,
          options,
          tuningState,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Export failed");
      }

      const result: ExportResponse = await response.json();
      setExportResult(result);
      setPhase("preview");
      toast.success("Export generated successfully!", {
        description: `${result.metadata.fileCount} file(s) ready to download`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Export failed";
      setError(errorMsg);
      setPhase("error");
      toast.error("Export failed", {
        description: errorMsg,
      });
    }
  };

  const handleDownload = () => {
    if (!exportResult) return;

    try {
      if (exportResult.files.length === 1) {
        const file = exportResult.files[0];
        const blob = new Blob([file.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("File downloaded successfully!");
      } else if (exportResult.zipData) {
        const filename = `${exportResult.metadata.componentName.toLowerCase()}-${selectedFormat}.zip`;
        downloadZip(exportResult.zipData, filename);
        toast.success("ZIP file downloaded successfully!", {
          description: `${exportResult.metadata.fileCount} files included`,
        });
      }
    } catch {
      toast.error("Download failed", {
        description: "Please try again",
      });
    }
  };

  const handleClose = () => {
    setPhase("config");
    setExportResult(null);
    setError(null);
    onClose();
  };

  const updateOption = (key: keyof ExportOptions, value: boolean) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const isOptionApplicable = (option: keyof ExportOptions): boolean => {
    const applicability: Record<keyof ExportOptions, ExportFormat[]> = {
      includeTypes: ["react-ts", "vue"],
      includeTests: ["react-ts", "react-js", "vue"],
      includeStorybook: ["react-ts", "react-js", "vue"],
      bundled: ["html"],
      includePackageJson: ["react-ts", "react-js", "vue"],
      includeReadme: ["react-ts", "react-js", "vue", "html"],
      includeComments: ["react-ts", "react-js", "vue", "html"],
      componentName: ["react-ts", "react-js", "vue", "html"],
    };

    return applicability[option]?.includes(selectedFormat) ?? true;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        className={cn(EXPORT_MODAL_THEME.dialogContent, EXPORT_MODAL_THEME.hideRadixClose)}
      >
        <DialogDescription className={EXPORT_MODAL_THEME.subtitle}>
          Choose export format and options, then generate a downloadable bundle.
        </DialogDescription>

        <div className={EXPORT_MODAL_THEME.header}>
          <DialogTitle className={EXPORT_MODAL_THEME.title}>Export Component</DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground focus-visible:ring-sidebar-ring"
            onClick={handleClose}
            aria-label="Close export dialog"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className={EXPORT_MODAL_THEME.body}>
          {phase === "config" && (
            <div className="space-y-8">
              <div>
                <Label className={EXPORT_MODAL_THEME.sectionHeading}>Export format</Label>
                <div className={EXPORT_MODAL_THEME.formatGrid}>
                  {(["react-ts", "react-js", "vue", "html"] as ExportFormat[]).map((format) => {
                    const selected = selectedFormat === format;
                    return (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setSelectedFormat(format)}
                        className={cn(
                          EXPORT_MODAL_THEME.formatCardBase,
                          selected
                            ? EXPORT_MODAL_THEME.formatCardSelected
                            : EXPORT_MODAL_THEME.formatCardIdle
                        )}
                      >
                        <div className={EXPORT_MODAL_THEME.formatLabel}>{FORMAT_LABELS[format]}</div>
                        <div className={EXPORT_MODAL_THEME.formatDescription}>
                          {FORMAT_DESCRIPTIONS[format]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className={EXPORT_MODAL_THEME.sectionHeading}>Export options</Label>
                <div className="space-y-3">
                  {isOptionApplicable("includeTypes") && (
                    <div className={EXPORT_MODAL_THEME.optionRow}>
                      <div>
                        <div className={EXPORT_MODAL_THEME.optionTitle}>Include type definitions</div>
                        <div className={EXPORT_MODAL_THEME.optionDescription}>
                          Generate TypeScript type files
                        </div>
                      </div>
                      <Switch
                        checked={options.includeTypes ?? true}
                        onCheckedChange={(checked) => updateOption("includeTypes", checked)}
                      />
                    </div>
                  )}

                  {isOptionApplicable("includeTests") && (
                    <div className={EXPORT_MODAL_THEME.optionRow}>
                      <div>
                        <div className={EXPORT_MODAL_THEME.optionTitle}>Include tests</div>
                        <div className={EXPORT_MODAL_THEME.optionDescription}>Generate test files</div>
                      </div>
                      <Switch
                        checked={options.includeTests ?? false}
                        onCheckedChange={(checked) => updateOption("includeTests", checked)}
                      />
                    </div>
                  )}

                  {isOptionApplicable("includeStorybook") && (
                    <div className={EXPORT_MODAL_THEME.optionRow}>
                      <div>
                        <div className={EXPORT_MODAL_THEME.optionTitle}>Include Storybook</div>
                        <div className={EXPORT_MODAL_THEME.optionDescription}>
                          Generate Storybook stories
                        </div>
                      </div>
                      <Switch
                        checked={options.includeStorybook ?? false}
                        onCheckedChange={(checked) => updateOption("includeStorybook", checked)}
                      />
                    </div>
                  )}

                  {isOptionApplicable("bundled") && (
                    <div className={EXPORT_MODAL_THEME.optionRow}>
                      <div>
                        <div className={EXPORT_MODAL_THEME.optionTitle}>Single file</div>
                        <div className={EXPORT_MODAL_THEME.optionDescription}>
                          Bundle everything in one file
                        </div>
                      </div>
                      <Switch
                        checked={options.bundled ?? false}
                        onCheckedChange={(checked) => updateOption("bundled", checked)}
                      />
                    </div>
                  )}

                  {isOptionApplicable("includePackageJson") && (
                    <div className={EXPORT_MODAL_THEME.optionRow}>
                      <div>
                        <div className={EXPORT_MODAL_THEME.optionTitle}>Include package.json</div>
                        <div className={EXPORT_MODAL_THEME.optionDescription}>
                          Add package.json with dependencies
                        </div>
                      </div>
                      <Switch
                        checked={options.includePackageJson ?? true}
                        onCheckedChange={(checked) => updateOption("includePackageJson", checked)}
                      />
                    </div>
                  )}

                  {isOptionApplicable("includeReadme") && (
                    <div className={EXPORT_MODAL_THEME.optionRow}>
                      <div>
                        <div className={EXPORT_MODAL_THEME.optionTitle}>Include README</div>
                        <div className={EXPORT_MODAL_THEME.optionDescription}>
                          Add README with usage instructions
                        </div>
                      </div>
                      <Switch
                        checked={options.includeReadme ?? true}
                        onCheckedChange={(checked) => updateOption("includeReadme", checked)}
                      />
                    </div>
                  )}

                  {isOptionApplicable("includeComments") && (
                    <div className={EXPORT_MODAL_THEME.optionRow}>
                      <div>
                        <div className={EXPORT_MODAL_THEME.optionTitle}>Include comments</div>
                        <div className={EXPORT_MODAL_THEME.optionDescription}>
                          Add code comments and JSDoc
                        </div>
                      </div>
                      <Switch
                        checked={options.includeComments ?? true}
                        onCheckedChange={(checked) => updateOption("includeComments", checked)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {phase === "generating" && (
            <div className={EXPORT_MODAL_THEME.stateStack}>
              <Loader2 className="mb-4 size-12 animate-spin text-sidebar-primary" aria-hidden />
              <p className={EXPORT_MODAL_THEME.stateTitle}>Generating files</p>
              <p className={cn(EXPORT_MODAL_THEME.stateCaption, "mt-2 max-w-sm")}>
                This may take a moment.
              </p>
            </div>
          )}

          {phase === "preview" && exportResult && (
            <div className="space-y-4">
              <div className={EXPORT_MODAL_THEME.successBanner}>
                <CheckCircle className={EXPORT_MODAL_THEME.successIcon} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className={EXPORT_MODAL_THEME.successHeading}>Export ready</div>
                  <div className={EXPORT_MODAL_THEME.successMeta}>
                    {exportResult.metadata.fileCount} file
                    {exportResult.metadata.fileCount !== 1 ? "s" : ""} ·{" "}
                    {formatFileSize(exportResult.metadata.totalSize)}
                  </div>
                </div>
              </div>

              <CodeViewer
                files={exportResult.files}
                title="Generated files"
                maxHeightClassName="max-h-[min(28rem,50vh)]"
                shell="sidebar"
              />
            </div>
          )}

          {phase === "error" && (
            <div className={EXPORT_MODAL_THEME.stateStack}>
              <AlertCircle className={EXPORT_MODAL_THEME.errorIcon} aria-hidden />
              <p className={EXPORT_MODAL_THEME.stateTitle}>Export failed</p>
              <p className={cn(EXPORT_MODAL_THEME.stateCaption, "mt-2 max-w-md")}>{error}</p>
            </div>
          )}
        </div>

        <div className={EXPORT_MODAL_THEME.footer}>
          <Button type="button" variant="ghost" className={EXPORT_MODAL_THEME.footerGhost} onClick={handleClose}>
            {phase === "preview" ? "Close" : "Cancel"}
          </Button>

          {phase === "config" && (
            <Button type="button" className={EXPORT_MODAL_THEME.footerPrimary} onClick={handleExport}>
              Generate export
            </Button>
          )}

          {phase === "preview" && (
            <Button type="button" className={EXPORT_MODAL_THEME.footerPrimary} onClick={handleDownload}>
              <Download className="mr-2 size-4" />
              Download {exportResult && exportResult.files.length > 1 ? "ZIP" : "file"}
            </Button>
          )}

          {phase === "error" && (
            <Button type="button" className={EXPORT_MODAL_THEME.footerPrimary} onClick={() => setPhase("config")}>
              Try again
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Made with Bob
