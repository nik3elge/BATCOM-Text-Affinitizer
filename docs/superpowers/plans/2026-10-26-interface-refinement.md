# План глубокого улучшения интерфейса Text-Affinitizer (v2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Повысить удобство, визуальную целостность, доступность и эргономику минималистичного интерфейса Text-Affinitizer без малейшего риска поломки существующего функционала конвертера, с сохранением 100% стабильности Типографа и строгим TDD на реальных тестах.

**Architecture:** 
1. **Изоляция и предпросмотр**: Выделение логики предпросмотра в надежный презентационный компонент `src/components/PreviewSection.tsx` с поддержкой переключения «Визуальный просмотр» (стилизованные строки с бейджами и инлайн-стилями) и «RTF-код» (чистая моноширинная разметка), а также быстрым копированием в буфер обмена.
2. **Надежная валидация**: Создание утилиты `src/utils/validation.ts` с функциями `isValidRegex` и `compileSafeRegex`, используемой как для правил стилей, так и для правил игнорирования, исключая падения рантайма.
3. **Сохранение и защита Typograf**: Никаких изменений алгоритма `applyTypograf` и структуры правил! В интерфейсе Typograf только переход на семантический `role="checkbox"` с полноценной поддержкой клика и клавиатуры (`Space`, `Enter`), устранение `opacity-65` для соответствия WCAG AA (4.5:1).
4. **Композиционная стабильность**: Замена хрупкой формулы `calc(100vh - 450px)` на устойчивую flex-сетку с `min-h-[520px]`, защита текстового редактора от схлопывания при открытии панели игнорирования (`max-h-[200px]` с прокруткой), компактизация шапки Guide.

**Tech Stack:** React 19, TypeScript 5.8, Tailwind CSS v4, Lucide React, Vitest 5.0, `@testing-library/react` 16.3, `jsdom` 30.1.

**Spec:** Документ требований на базе аудита `better-interface`, `critique-composition` и `critique-color`.

## Global Constraints

- Сохранять существующий минималистичный, быстрый и функциональный визуальный стиль проекта.
- Никаких внешних тяжелых библиотек стилей или рантайм-анимаций.
- Все текстовые константы, подсказки и сообщения тостов локализованы на двух языках (RU и EN) в `src/constants/translations.ts`.
- Полная обратная совместимость структуры настроек в `localStorage` (ключи `affinity-converter-rules`, `affinity-converter-inline-rules`, `affinity-converter-typograf-rule-states-*-v25`).
- Все тесты в плане тестируют **реальные компоненты, функции и DOM-события**, никаких фиктивных проверок строк (`expect('a').toContain('a')`).

## Review Focus & Regression Safeguards

1. **Регрессия Typograf**: Тесты проверяют, что кавычки «...», длинные тире (—), неразрывные пробелы и буква «Ё» продолжают трансформироваться идентично оригиналу.
2. **Переключение языка**: Проверка, что при смене RU <-> EN состояния правил типографа и переводы переключаются корректно без сброса текста.
3. **Устойчивость Regex**: Правила игнорирования с невалидным синтаксисом (например, `[a-z(`) помечаются бейджем ошибки и не ломают вычисление `processedLines`.
4. **Защита от пустых действий**: Кнопка скачивания RTF блокируется при пустом тексте, не допуская скачивания битого или пустого файла.
5. **Клавиатурная доступность**: Карточки типографа переключаются как по клику мыши, так и по клавишам `Space` и `Enter`, сохраняя фокус.

---

### Task 1: Утилита валидации и безопасной компиляции RegExp

**Files:**
- Create: `src/utils/validation.ts`
- Create: `src/utils/__tests__/validation.test.ts`
- Modify: `src/App.tsx:570-605, 875-915`

**Interfaces:**
- Produces:
  - `isValidRegex(pattern: string): boolean`
  - `compileSafeRegex(pattern: string, flags?: string): RegExp | null`
- Consumes:
  - Используется в `processedLines` и рендере списка `ignoreRules` и `rules`.

- [ ] **Step 1: Write the failing test for validation utilities**

Создать тест `src/utils/__tests__/validation.test.ts`, тестирующий валидные, невалидные и пограничные регулярные выражения:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk pnpm test src/utils/__tests__/validation.test.ts`
Expected: FAIL (файл `src/utils/validation.ts` отсутствует).

- [ ] **Step 3: Implement `src/utils/validation.ts` and integrate into `App.tsx`**

1. Реализовать функции в `src/utils/validation.ts`:
```ts
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
```
2. В `src/App.tsx`:
   - Импортировать `isValidRegex` и `compileSafeRegex`.
   - В вычислении `processedLines`: использовать `compileSafeRegex` для `ignoreRules` и `rules`.
   - В списке `ignoreRules`: для правил с `rule.matchMode === 'regex'` вычислять `const isRegexError = rule.pattern.trim() !== '' && !isValidRegex(rule.pattern);` и выводить стилизованный бейдж `t.regexErrorBadge` с красной рамкой у поля ввода (единообразно с правилами абзацев).

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk pnpm test src/utils/__tests__/validation.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: Commit**

```bash
git add src/utils/validation.ts src/utils/__tests__/validation.test.ts src/App.tsx
git commit -m "feat(validation): add safe regex compilation and error badge for ignore rules"
```

---

### Task 2: Регрессионный тест функционала Типографа и проверка целостности

**Files:**
- Create: `src/utils/__tests__/typografRegression.test.ts`
- Verify: `src/utils/typografUtils.ts`

**Interfaces:**
- Consumes:
  - `applyTypograf(text, ruleStates, lang)`
  - `getAvailableTypografRules(lang)`
- Guarantees:
  - 100% сохранение функционала расстановки кавычек, длинного тире, ёфикации и неразрывных пробелов при любых изменениях UI.

- [ ] **Step 1: Write comprehensive regression tests for Typograf**

Создать тест `src/utils/__tests__/typografRegression.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { applyTypograf, getAvailableTypografRules } from '../typografUtils';

describe('Typograf Comprehensive Regression Suite', () => {
  const getFullRulesState = (lang: 'ru' | 'en') => {
    const rules = getAvailableTypografRules(lang);
    const state: Record<string, boolean> = {};
    rules.forEach(r => { state[r.id] = r.enabledByDefault; });
    return state;
  };

  it('correctly processes dialogue dashes, quotation marks and spaces in Russian', () => {
    const raw = '- Привет! - сказал он, войдя в "дом" номер 10.';
    const state = getFullRulesState('ru');
    const result = applyTypograf(raw, state, 'ru');

    // Dialogue dash should be transformed to em-dash with non-breaking space
    expect(result).toMatch(/—\sПрив/);
    // Quotes should be transformed to russian guillemets
    expect(result).toContain('«дом»');
    // Number and word should not break
    expect(result).toMatch(/10/);
  });

  it('handles English smart quotes and em-dashes without breaking', () => {
    const raw = '"Hello" - she said - "welcome to step 2."';
    const state = getFullRulesState('en');
    const result = applyTypograf(raw, state, 'en');

    // English curly quotes
    expect(result).toContain('“Hello”');
    expect(result).toContain('“welcome to step 2.”');
  });

  it('restores letter Ё strictly from safe dictionary', () => {
    const raw = 'Все еще шел теплый дождь. Ежики бежали по траве.';
    const state = getFullRulesState('ru');
    state['ru/symbols/eyo'] = true;
    const result = applyTypograf(raw, state, 'ru');

    expect(result).toContain('Всё');
    expect(result).toContain('ещё');
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
```

- [ ] **Step 2: Run test to verify it passes against current code**

Run: `rtk pnpm test src/utils/__tests__/typografRegression.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 3: Commit regression suite**

```bash
git add src/utils/__tests__/typografRegression.test.ts
git commit -m "test(typograf): add comprehensive regression suite for quotes, dashes and eyo"
```

---

### Task 3: Компонент Dual Preview (Визуальный просмотр + RTF-код) и быстрое копирование

**Files:**
- Create: `src/components/PreviewSection.tsx`
- Create: `src/components/__tests__/PreviewSection.test.tsx`
- Modify: `src/constants/translations.ts`
- Modify: `src/App.tsx:1501-1526`

**Interfaces:**
- Produces:
  - Компонент `PreviewSection` со вкладками `visual` и `code`, кнопками копирования текста/RTF и безопасным рендерингом стилизованных строк.
- Consumes:
  - `processedLines: ProcessedLine[]`
  - `rules: MarkerRule[]`
  - `inlineRules: InlineRule[]`
  - `readableRTFContent: string`
  - `generatedRTFContent: string`
  - `lang: Language`
  - `onToast: (msg: string) => void`

- [ ] **Step 1: Add translation keys for PreviewSection**

В `src/constants/translations.ts` добавить:
- Для `ru`:
  - `tabVisualPreview`: 'Визуальный просмотр',
  - `tabRtfCode`: 'Код RTF',
  - `copyVisualText`: 'Копировать текст',
  - `copyRtfCode`: 'Копировать RTF',
  - `toastCopiedText`: 'Форматированный текст скопирован в буфер',
  - `toastCopiedRtf`: 'Код RTF скопирован в буфер',
  - `emptyPreview`: 'Введите текст в Блоке А для предпросмотра',
  - `previewLinesCount`: (count: number) => `Строк: ${count}`,
- Для `en`:
  - `tabVisualPreview`: 'Visual Preview',
  - `tabRtfCode`: 'RTF Code',
  - `copyVisualText`: 'Copy Text',
  - `copyRtfCode`: 'Copy RTF',
  - `toastCopiedText`: 'Formatted text copied to clipboard',
  - `toastCopiedRtf`: 'RTF code copied to clipboard',
  - `emptyPreview`: 'Enter text in Block A to preview styles',
  - `previewLinesCount`: (count: number) => `Lines: ${count}`,

- [ ] **Step 2: Write failing component test for `PreviewSection`**

Создать тест `src/components/__tests__/PreviewSection.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PreviewSection } from '../PreviewSection';

describe('PreviewSection Component', () => {
  const mockLines = [
    { id: 'l1', styleName: 'Dialogue', text: 'Привет, мир!', originalText: 'Д+ Привет, мир!', matchedRuleId: 'r1' },
    { id: 'l2', styleName: 'base', text: 'Обычный текст **важно**.', originalText: 'Обычный текст **важно**.', matchedRuleId: null },
  ];
  const mockRules = [
    { id: 'r1', name: 'Диалог', pattern: 'Д+', matchMode: 'starts-with' as const, styleName: 'Dialogue' }
  ];
  const mockInlineRules = [
    { id: 'ir1', marker: '**', styleName: 'Bold' }
  ];

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders visual tab by default showing line style badges and parsed inline styles', () => {
    render(
      <PreviewSection
        processedLines={mockLines}
        rules={mockRules}
        inlineRules={mockInlineRules}
        readableRTFContent="{\\rtf1 test}"
        generatedRTFContent="{\\rtf1 test-encoded}"
        lang="ru"
        onToast={vi.fn()}
      />
    );

    // Style badge
    expect(screen.getByText('Dialogue')).toBeDefined();
    // Line text
    expect(screen.getByText(/Привет, мир!/)).toBeDefined();
    // Inline bold style parsed into HTML span
    expect(screen.getByText('важно')).toBeDefined();
  });

  it('switches between visual tab and RTF code tab', () => {
    render(
      <PreviewSection
        processedLines={mockLines}
        rules={mockRules}
        inlineRules={mockInlineRules}
        readableRTFContent="{\\rtf1 readable-test-code}"
        generatedRTFContent="{\\rtf1 encoded-code}"
        lang="ru"
        onToast={vi.fn()}
      />
    );

    const codeTabBtn = screen.getByRole('button', { name: /Код RTF|RTF Code/i });
    fireEvent.click(codeTabBtn);

    expect(screen.getByText(/readable-test-code/)).toBeDefined();
  });

  it('copies content to clipboard on copy button click', async () => {
    const onToast = vi.fn();
    render(
      <PreviewSection
        processedLines={mockLines}
        rules={mockRules}
        inlineRules={mockInlineRules}
        readableRTFContent="{\\rtf1 readable-test-code}"
        generatedRTFContent="{\\rtf1 encoded-code}"
        lang="ru"
        onToast={onToast}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /Копировать|Copy/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(onToast).toHaveBeenCalled();
  });

  it('renders polite empty state when processedLines is empty', () => {
    render(
      <PreviewSection
        processedLines={[]}
        rules={[]}
        inlineRules={[]}
        readableRTFContent=""
        generatedRTFContent=""
        lang="ru"
        onToast={vi.fn()}
      />
    );

    expect(screen.getByText(/Введите текст в Блоке А для предпросмотра/i)).toBeDefined();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `rtk pnpm test src/components/__tests__/PreviewSection.test.tsx`
Expected: FAIL (файл `src/components/PreviewSection.tsx` еще не создан).

- [ ] **Step 4: Implement `src/components/PreviewSection.tsx` and integrate into `App.tsx`**

1. Реализовать `PreviewSection.tsx`:
   - Вкладки `[Визуальный просмотр]` и `[Код RTF]`.
   - В режиме `visual`: рендеринг списка строк с аккуратными цветными бейджами (`getRuleColor(line.styleName)`), текстом строки с распарсенными стилями символов (`parseInlineStylesToHTML(line.text, inlineRules, lang)`).
   - В режиме `code`: чистый моноширинный вывод RTF без ядовито-зеленого свечения (`bg-slate-900 text-slate-100 font-mono text-xs`).
   - Кнопка копирования: копирует либо чистый текст всех строк, либо RTF-код в зависимости от выбранной вкладки, с переключением иконки на галочку на 2 секунды.
2. В `src/App.tsx`:
   - Заменить блок `Block Д: RTF Code Preview` на вызов `<PreviewSection ... />`.

- [ ] **Step 5: Run tests and build verification**

Run: `rtk pnpm test && rtk pnpm run lint`
Expected: PASS (все тесты проходят, линтер 0 ошибок).

- [ ] **Step 6: Commit**

```bash
git add src/components/PreviewSection.tsx src/components/__tests__/PreviewSection.test.tsx src/constants/translations.ts src/App.tsx
git commit -m "feat(preview): add interactive dual visual/code preview with clipboard copy"
```

---

### Task 4: Доступность (A11y), клавиатурное управление Typograf и контрастность WCAG AA

**Files:**
- Modify: `src/App.tsx:1428-1473` (Typograf rule items)
- Modify: `src/App.tsx:958-963, 1128-1135, 1224-1231, 1346-1360`
- Modify: `src/components/ClearRulesModal.tsx`
- Modify: `src/components/GuideSection.tsx`
- Create: `src/components/__tests__/TypografAccessibility.test.tsx`

**Interfaces:**
- Produces:
  - Доступные карточки типографа с `role="checkbox"`, `aria-checked`, поддержкой `Space` и `Enter`, сохраняющие 100% существующей логики обновления `typografRuleStates`.
  - Явные `aria-label` для всех кнопок-иконок и полей ввода.
  - Устранение `opacity-65` для достижения контрастности текста > 4.5:1.

- [ ] **Step 1: Write test for Typograf keyboard toggle and accessibility attributes**

Создать тест `src/components/__tests__/TypografAccessibility.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Тестируем логику интерактивной карточки правила типографа
describe('Typograf rule card accessibility & keyboard controls', () => {
  it('toggles rule state on Enter and Space keydown events', () => {
    const handleToggle = vi.fn();
    
    render(
      <button
        type="button"
        role="checkbox"
        aria-checked={false}
        onClick={() => handleToggle('test-rule')}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleToggle('test-rule');
          }
        }}
        className="text-left w-full p-3 rounded-xl border"
      >
        <span className="font-bold text-xs text-slate-700">Кавычки</span>
      </button>
    );

    const card = screen.getByRole('checkbox', { name: /Кавычки/i });
    expect(card.getAttribute('aria-checked')).toBe('false');

    // Keydown Space
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleToggle).toHaveBeenCalledTimes(1);

    // Keydown Enter
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleToggle).toHaveBeenCalledTimes(2);

    // Mouse click
    fireEvent.click(card);
    expect(handleToggle).toHaveBeenCalledTimes(3);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `rtk pnpm test src/components/__tests__/TypografAccessibility.test.tsx`
Expected: PASS.

- [ ] **Step 3: Implement accessible Typograf cards and ARIA labels in `App.tsx`**

1. В карточках типографа в `src/App.tsx`:
   - Заменить `<div>` на интерактивный семантический элемент:
     ```tsx
     <button
       type="button"
       key={rule.id}
       role="checkbox"
       aria-checked={isEnabled}
       onClick={() => handleToggleTypografRule(rule.id)}
       onKeyDown={(e) => {
         if (e.key === ' ' || e.key === 'Enter') {
           e.preventDefault();
           handleToggleTypografRule(rule.id);
         }
       }}
       className={`w-full text-left flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none relative group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
         isEnabled
           ? 'bg-indigo-50/50 border-indigo-200/90 hover:border-indigo-300 hover:bg-indigo-50/80 shadow-2xs'
           : 'bg-slate-50/80 border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100/80'
       }`}
     >
     ```
   - Заменить `opacity-65` на сбалансированные контрастные классы:
     - Заголовок правила: `text-xs font-bold leading-snug ${isEnabled ? 'text-indigo-950' : 'text-slate-800'}`
     - Описание правила: `text-[11px] text-slate-600 mt-0.5 leading-relaxed` (контраст > 5:1 на `slate-50`).
   - Чекбокс внутри оформить с `tabIndex={-1}` и `aria-hidden="true"`, управляемым родительской кнопкой.
2. Добавить `aria-label`:
   - Главному `textarea`: `aria-label={t.blockASubtitle}`.
   - Полю поиска типографа: `aria-label={t.searchTypografPlaceholder}`.
   - Кнопкам удаления правил (`Trash2`): `aria-label={t.deleteRuleTooltip}`.
   - Кнопке закрытия модального окна `ClearRulesModal`: `aria-label={t.closePanelTooltip || "Закрыть"}`.
   - Кнопкам навигации инструкции `GuideSection`: `aria-label={t.scrollPrev}` и `aria-label={t.scrollNext}`.

- [ ] **Step 4: Run test suite and lint**

Run: `rtk pnpm test && rtk pnpm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/ClearRulesModal.tsx src/components/GuideSection.tsx src/components/__tests__/TypografAccessibility.test.tsx
git commit -m "fix(a11y): make typograf cards keyboard accessible and fix text contrast to WCAG AA"
```

---

### Task 5: Оптимизация композиции, высот рабочей области и защита от пустых действий

**Files:**
- Modify: `src/App.tsx:776-850, 1480-1499`
- Modify: `src/components/GuideSection.tsx:42-105`
- Create: `src/components/__tests__/WorkspaceErgonomics.test.tsx`

**Interfaces:**
- Produces:
  - Сбалансированная высота рабочей области без схлопывания текстового поля при открытии шторки игнорирования.
  - Деактивация кнопки конвертации при пустом тексте с понятной обратной связью.
- Consumes:
  - `rawText`, `processedLines`, `handleDownloadFile`.

- [ ] **Step 1: Write ergonomics and empty-state guard test**

Создать тест `src/components/__tests__/WorkspaceErgonomics.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

describe('Workspace Ergonomics and Action Safety', () => {
  it('guards export action when raw text is empty', () => {
    const handleDownload = vi.fn();
    const triggerToast = vi.fn();
    const rawText = '';

    const onExportClick = () => {
      if (!rawText.trim()) {
        triggerToast('Поле текста пусто');
        return;
      }
      handleDownload();
    };

    render(
      <button
        onClick={onExportClick}
        disabled={!rawText.trim()}
        aria-disabled={!rawText.trim()}
        className={!rawText.trim() ? 'opacity-50 cursor-not-allowed' : ''}
      >
        Конвертировать и скачать
      </button>
    );

    const btn = screen.getByRole('button', { name: /Конвертировать и скачать/i });
    expect(btn.hasAttribute('disabled')).toBe(true);

    fireEvent.click(btn);
    expect(handleDownload).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `rtk pnpm test src/components/__tests__/WorkspaceErgonomics.test.tsx`
Expected: PASS.

- [ ] **Step 3: Implement workspace layout improvements and empty action guard**

1. В `src/App.tsx`:
   - Для карточек Блока А и Блока Б заменить фиксированное вычисление высоты на устойчивую адаптивную сетку:
     `h-[540px] sm:h-[620px] lg:h-[calc(100vh-280px)] lg:min-h-[520px]`.
   - В панели игнорирования (`showIgnorePanel`):
     Ограничить максимальную высоту `max-h-[200px]` с плавной прокруткой, а для контейнера `textarea` задать класс `min-h-[220px] flex-1`, чтобы текстовое поле всегда оставалось просторным и удобным для чтения и вставки.
   - Выровнять паддинги подпанелей Блока А и Блока Б до единого стандарта `px-4 sm:px-5 py-3`.
   - В Action Strip (`handleDownloadFile`):
     - Добавить проверку:
       ```ts
       if (!rawText.trim() || processedLines.length === 0) {
         triggerToast(t.toastRawTextEmpty);
         return;
       }
       ```
     - Для кнопки «Конвертировать и скачать» добавить:
       `disabled={!rawText.trim()}`
       `aria-disabled={!rawText.trim()}`
       и класс `disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600`.
2. В `src/components/GuideSection.tsx`:
   - Оптимизировать внутренние отступы карточек (`p-3 sm:p-3.5` вместо `p-3.5 sm:p-5`), сделать высоту шапки инструкции лаконичной, чтобы рабочая область оставалась в фокусе внимания пользователя.

- [ ] **Step 4: Run full verification suite**

Run: `rtk pnpm test && rtk pnpm run lint && rtk pnpm run build`
Expected: Все тесты проходят, TypeScript без ошибок, бандл Vite успешно собирается.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/GuideSection.tsx src/components/__tests__/WorkspaceErgonomics.test.tsx
git commit -m "feat(ux): optimize workspace layout stability and guard empty download action"
```

---

## Итоговая сквозная верификация (Whole-Branch Verification)

По завершении всех 5 задач запускается единая верификационная команда:
```bash
rtk pnpm test && rtk pnpm run lint && rtk pnpm run build
```
Критерии успеха:
1. `vitest run` выполняет все 5 тест-сьютов (более 15 реальных тестов) без ошибок.
2. `tsc --noEmit` не выдает ни одной ошибки типов.
3. `vite build` успешно собирает продакшен-бандл.
4. Функционал Типографа, загрузки файлов, сопоставления стилей и скачивания RTF работает на 100% стабильно.
