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
    marker: '****',
    styleName: 'Bold'
  },
  {
    id: 'inline-italic',
    marker: '**',
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
    name: 'Номер страницы (Page Number)',
    pattern: '^#\\d+',
    matchMode: 'regex',
    styleName: 'Page_Number'
  },
  {
    id: 'rule-char-m',
    name: 'Реплика персонажа М+ (Character M)',
    pattern: 'М+',
    matchMode: 'starts-with',
    styleName: 'Char_M'
  },
  {
    id: 'rule-system',
    name: 'Системное сообщение (System Alert)',
    pattern: 'Система+',
    matchMode: 'starts-with',
    styleName: 'System_Alert'
  }
];

export const SAMPLE_TEXT = `#01
Место+ Готэм.
Закадровый+ В Хиэрон проник *неизвестный пользователь*. Уровень угрозы: Оранжевый.
Обычный текст без какого-либо маркера, представляющий описание сцены или авторские ремарки.

#02
Кто здесь? **Покажись!**
Система+ Сканирование местности... *Цель не обнаружена*.
Обычный текст повествования продолжается здесь.`;
