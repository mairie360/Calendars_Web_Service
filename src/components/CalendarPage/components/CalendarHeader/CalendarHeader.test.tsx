import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CalendarHeader } from './CalendarHeader';

describe('CalendarHeader', () => {
  it('MAIR-884: shows the title, the subtitle and « Créer » only when the data is ready', () => {
    const onCreate = vi.fn();
    const { rerender } = render(<CalendarHeader />);
    expect(screen.getByRole('heading', { level: 1, name: 'Calendrier & Événements' })).toBeInTheDocument();
    expect(screen.getByText('Planifiez et organisez les activités de la mairie')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Créer' })).toBeNull();
    rerender(<CalendarHeader onCreate={onCreate} onRefresh={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Créer' })); expect(onCreate).toHaveBeenCalled();
  });

  it('MAIR-884: « Actualiser » comes before « Créer », reloads, and is disabled while a read runs', () => {
    const onRefresh = vi.fn();
    const { rerender } = render(<CalendarHeader onCreate={vi.fn()} onRefresh={onRefresh} />);
    const buttons = screen.getAllByRole('button').map(button => button.textContent);
    expect(buttons).toEqual(['Actualiser', 'Créer']);
    fireEvent.click(screen.getByRole('button', { name: 'Actualiser' })); expect(onRefresh).toHaveBeenCalledTimes(1);
    rerender(<CalendarHeader onCreate={vi.fn()} onRefresh={onRefresh} loading />);
    expect(screen.getByRole('button', { name: 'Actualiser' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Actualiser' })); expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
