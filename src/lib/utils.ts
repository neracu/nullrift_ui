import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Turn schema identifiers (PascalCase, camelCase, snake_case, kebab-case) into spaced title text for preview labels.
 */
export function formatSchemaDisplayName(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return raw;
  let out = trimmed.replace(/[-_]+/g, ' ');
  out = out.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  out = out.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Made with Bob
