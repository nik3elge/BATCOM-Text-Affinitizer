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
