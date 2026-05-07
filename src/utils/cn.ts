/**
 * Simple className utility - merges class names, filters falsy values.
 * No external dependencies.
 */
export function cn(...classes: (string | undefined | null | false | 0)[]): string {
  return classes.filter(Boolean).join(' ');
}
