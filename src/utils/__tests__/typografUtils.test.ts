import { describe, it, expect } from 'vitest';
import { applyTypograf, getAvailableTypografRules } from '../typografUtils';

describe('Typograf utils functionality', () => {
  it('returns available rules for Russian and English', () => {
    const ruRules = getAvailableTypografRules('ru');
    const enRules = getAvailableTypografRules('en');

    expect(ruRules.length).toBeGreaterThan(0);
    expect(enRules.length).toBeGreaterThan(0);
  });

  it('correctly applies quotes and dashes in Russian text', () => {
    const raw = '"Привет" - сказал он.';
    const rulesState: Record<string, boolean> = {
      'common/punctuation/quote': true,
      'ru/dash/main': true,
      'ru/dash/directSpeech': true,
    };

    const result = applyTypograf(raw, rulesState, 'ru');
    // Typograf should convert straight quotes to russian «ёлочки» and hyphen to em-dash
    expect(result).toContain('«Привет»');
    expect(result).toContain('—');
  });

  it('restores the letter Ё when eyo rule is active', () => {
    const raw = 'Ежик сидит под елкой.';
    const rulesState: Record<string, boolean> = {
      'ru/symbols/eyo': true,
    };

    const result = applyTypograf(raw, rulesState, 'ru');
    expect(result).toContain('Ёжик');
    expect(result).toContain('ёлкой');
  });

  it('returns empty or untransformed string if text is empty', () => {
    expect(applyTypograf('', {}, 'ru')).toBe('');
  });
});
