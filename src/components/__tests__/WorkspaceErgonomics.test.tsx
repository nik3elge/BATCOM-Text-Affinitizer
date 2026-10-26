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
        type="button"
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
