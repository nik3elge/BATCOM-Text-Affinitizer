import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BoostyIcon } from '../../components/BoostyIcon';

describe('BoostyIcon component', () => {
  it('renders svg element with proper class', () => {
    const { container } = render(<BoostyIcon className="w-5 h-5 text-orange-500" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('class')).toContain('w-5 h-5 text-orange-500');
  });
});
