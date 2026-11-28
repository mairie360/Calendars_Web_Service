import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EventVisibilityField } from './EventVisibilityField';

describe('EventVisibilityField', () => {
  it('MAIR-1179 offers Public and Privé with their hints, Public checked for a public event', () => {
    render(<EventVisibilityField value="public" onChange={vi.fn()} />);
    expect(screen.getByRole('group', { name: 'Visibilité' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Public/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Privé/ })).not.toBeChecked();
    expect(screen.getByText('Visible par tous les agents')).toBeInTheDocument();
    expect(screen.getByText('Visible seulement par vous et les invités')).toBeInTheDocument();
  });

  it('MAIR-1179 reports private when « Privé » is picked', () => {
    const onChange = vi.fn();
    render(<EventVisibilityField value="public" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: /Privé/ }));
    expect(onChange).toHaveBeenCalledWith('private');
  });

  it('MAIR-1179 shows the stored choice of a private event', () => {
    render(<EventVisibilityField value="private" onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: /Privé/ })).toBeChecked();
  });

  it('MAIR-1256 the two cards share the row equally', async () => {
    const { readFileSync } = await import('node:fs');
    render(<EventVisibilityField value="public" onChange={vi.fn()} />);
    expect(screen.getByRole('group', { name: 'Visibilité' })).toHaveClass('calendar-visibility');
    expect(document.querySelectorAll('.calendar-visibility [data-card]')).toHaveLength(2);
    expect(readFileSync('src/app/app-overrides.css', 'utf8')).toMatch(/\.calendar-visibility \[data-card\] \{ flex: 1 1 0; min-width: 12rem; \}/);
  });
});
