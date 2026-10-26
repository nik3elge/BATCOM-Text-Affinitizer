import { describe, it, expect } from 'vitest';
import { applyTypograf, getAvailableTypografRules } from '../typografUtils';

describe('Typograf Comprehensive Regression Suite', () => {
  const getFullRulesState = (lang: 'ru' | 'en') => {
    const rules = getAvailableTypografRules(lang);
    const state: Record<string, boolean> = {};
    rules.forEach(r => { state[r.id] = r.enabledByDefault; });
    return state;
  };

  it('correctly processes dialogue dashes, quotation marks and non-breaking spaces in Russian', () => {
    const raw = '- Привет! - сказал он, войдя в "дом" номер 10.';
    const state = getFullRulesState('ru');
    // Enable quote rule explicitly (as quote replacement is user-toggleable)
    state['common/punctuation/quote'] = true;

    const result = applyTypograf(raw, state, 'ru');

    // Dialogue dash should be transformed to em-dash with non-breaking space
    expect(result).toContain('— Привет!');
    // Quotes should be transformed to russian guillemets
    expect(result).toContain('«дом»');
    // Number and preposition should have non-breaking spaces
    expect(result).toContain('номер 10');
  });

  it('handles English smart quotes and em-dashes without breaking', () => {
    const raw = '"Hello" - she said - "welcome to step 2."';
    const state = getFullRulesState('en');
    state['common/punctuation/quote'] = true;
    state['en-US/dash/main'] = true;

    const result = applyTypograf(raw, state, 'en');

    // English curly quotes
    expect(result).toContain('“Hello”');
    expect(result).toMatch(/“welcome to[\s\u00A0]step 2\.”/);
    expect(result).toContain('—');
  });

  it('restores letter Ё strictly from safe dictionary', () => {
    const raw = 'Все еще шел теплый дождь. Ежики бежали по траве.';
    const state = getFullRulesState('ru');
    state['ru/symbols/eyo'] = true;
    const result = applyTypograf(raw, state, 'ru');

    // Safe dictionary restores unambiguous words
    expect(result).toContain('ещё');
    expect(result).toContain('шёл');
    expect(result).toContain('тёплый');
    expect(result).toContain('Ёжики');
  });

  it('leaves text intact when all rules are disabled', () => {
    const raw = 'Тест "без изменений" - останется как есть.';
    const state = getFullRulesState('ru');
    Object.keys(state).forEach(k => { state[k] = false; });
    const result = applyTypograf(raw, state, 'ru');

    expect(result).toBe(raw);
  });
});
