import { describe, it, expect } from 'vitest';
import { isValidRegex, compileSafeRegex } from '../validation';

describe('validation utilities', () => {
  it('identifies valid regex patterns correctly', () => {
    expect(isValidRegex('^#.*')).toBe(true);
    expect(isValidRegex('^\\d+\\.\\s*')).toBe(true);
    expect(isValidRegex('^(Анна|Марк):')).toBe(true);
  });

  it('identifies invalid regex patterns and prevents syntax errors', () => {
    expect(isValidRegex('[invalid(')).toBe(false);
    expect(isValidRegex('(?<')).toBe(false);
    expect(isValidRegex('*starts-with-quantifier')).toBe(false);
  });

  it('handles empty or whitespace patterns safely', () => {
    expect(isValidRegex('')).toBe(false);
    expect(isValidRegex('   ')).toBe(false);
  });

  it('safely compiles regex and returns null on failure', () => {
    const valid = compileSafeRegex('^Hello');
    expect(valid).not.toBeNull();
    expect(valid?.test('Hello world')).toBe(true);

    const invalid = compileSafeRegex('[broken(');
    expect(invalid).toBeNull();
  });
});
