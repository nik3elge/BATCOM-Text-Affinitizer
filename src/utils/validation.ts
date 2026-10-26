/**
 * Safe regular expression compilation and validation utilities
 */

export const isValidRegex = (pattern: string): boolean => {
  if (!pattern || !pattern.trim()) return false;
  try {
    new RegExp(pattern.trim());
    return true;
  } catch {
    return false;
  }
};

export const compileSafeRegex = (pattern: string, flags?: string): RegExp | null => {
  if (!pattern || !pattern.trim()) return null;
  try {
    return new RegExp(pattern.trim(), flags);
  } catch {
    return null;
  }
};
