import { MarkerRule, InlineRule, IgnoreRule } from '../types';

export const RANDOM_COLORS = [
  '#dc2626', // Red-600
  '#ea580c', // Orange-600
  '#d97706', // Amber-600
  '#16a34a', // Green-600
  '#0d9488', // Teal-600
  '#2563eb', // Blue-600
  '#4f46e5', // Indigo-600
  '#7c3aed', // Violet-600
  '#c026d3', // Fuchsia-600
  '#db2777', // Pink-600
];

export const DEFAULT_INLINE_RULES: InlineRule[] = [
  {
    id: 'inline-bold',
    marker: '**',
    styleName: 'Bold'
  },
  {
    id: 'inline-italic',
    marker: '*',
    styleName: 'Italic'
  }
];

export const DEFAULT_IGNORE_RULES: IgnoreRule[] = [
  {
    id: 'ignore-hash',
    pattern: '#',
    matchMode: 'starts-with',
    enabled: true
  }
];

export const DEFAULT_RULES: MarkerRule[] = [
  {
    id: 'rule-page',
    name: 'Page Number',
    pattern: '^#\\d+',
    matchMode: 'regex',
    styleName: 'Page_Number'
  },
  {
    id: 'rule-char-m',
    name: 'Character M',
    pattern: 'Name:',
    matchMode: 'starts-with',
    styleName: 'Char_M'
  }
];

export const DEFAULT_RULES_EN: MarkerRule[] = DEFAULT_RULES;

export const SAMPLE_TEXT = `#01
M+ В Хиэрон проник **неизвестный пользователь**. Уровень угрозы: Оранжевый.
Обычный текст без какого-либо маркера, представляющий описание сцены или авторские ремарки.

#02
M+ Кто здесь? *Покажись!*
Обычный текст повествования продолжается здесь.`;

export const SAMPLE_TEXT_EN = `#01
M+ An **unknown user** entered Hieron. Threat level: Orange.
Regular text without any marker describing the scene or author notes.

#02
M+ Who is there? *Show yourself!*
Normal narrative continues here.`;
