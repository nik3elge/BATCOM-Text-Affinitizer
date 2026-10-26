import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(onToast).toHaveBeenCalled();
    });
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

    expect(screen.getByText(/Введите или вставьте текст в Блоке А для предпросмотра/i)).toBeDefined();
  });
});
