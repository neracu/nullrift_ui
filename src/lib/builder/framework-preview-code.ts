/**
 * Client-side preview of Vue / HTML export output for the builder code panel.
 */

import type { ComponentSchema } from '@/lib/watsonx/types';
import { exportManager } from '@/lib/export';
import type { ExportFile } from '@/types/export';

const PREVIEW_EXPORT_OPTIONS = {
  bundled: true,
  includeTypes: false,
  includePackageJson: false,
  includeReadme: false,
  includeComments: true,
  includeTests: false,
  includeStorybook: false,
} as const;

/** Match ExportManager file basename for consistent download names. */
export function componentNameToKebabCase(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Returns the first export file (bundled SFC or single HTML) for read-only preview.
 */
export async function getFrameworkPreview(
  schema: ComponentSchema,
  format: 'vue' | 'html'
): Promise<{ file: ExportFile } | { error: string }> {
  try {
    const res = await exportManager.export({
      schema,
      format,
      options: { ...PREVIEW_EXPORT_OPTIONS },
    });
    const file = res.files[0];
    if (!file?.content) {
      return { error: 'No preview file was generated.' };
    }
    return { file };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Preview generation failed.' };
  }
}

// Made with Bob
