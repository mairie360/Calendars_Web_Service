import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CalendarHeader } from '@/app/calendar/_page/CalendarHeader';
import { CalendarStatusBar } from '@/app/calendar/_page/CalendarStatusBar';
import { CalendarLoadingCard } from '@/app/calendar/_page/CalendarLoadingCard';

describe('calendar page parts (MAIR-608)', () => {
  it('shows the title and the create action only when the data is ready', () => {
    const onCreate = vi.fn();
    const { rerender } = render(<CalendarHeader />);
    expect(screen.getByRole('heading', { level: 1, name: 'Calendrier & Événements' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nouvel événement' })).toBeNull();
    rerender(<CalendarHeader onCreate={onCreate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nouvel événement' })); expect(onCreate).toHaveBeenCalled();
  });
  it('renders nothing when idle, then errors, progress and the read retry', () => {
    const onRetry = vi.fn();
    const { container, rerender } = render(<CalendarStatusBar readError={null} mutationError={null} loading={false} saving={false} onRetry={onRetry} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<CalendarStatusBar readError="API indisponible" mutationError="Refus" loading={false} saving onRetry={onRetry} />);
    expect(screen.getAllByRole('alert').map((node) => node.textContent)).toEqual(['Calendrier : API indisponible', 'Enregistrement : Refus']);
    expect(screen.getByRole('status')).toHaveTextContent('Enregistrement en cours…');
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' })); expect(onRetry).toHaveBeenCalled();
  });
  it('shows the loading card with a skeleton, or the read error without it', () => {
    const { container, rerender } = render(<CalendarLoadingCard />);
    expect(screen.getByRole('status')).toHaveTextContent('Chargement des données du calendrier…'); expect(container.querySelector('.mairie-skeleton')).not.toBeNull();
    rerender(<CalendarLoadingCard readError="API indisponible" />);
    expect(screen.getByRole('alert')).toHaveTextContent('API indisponible'); expect(container.querySelector('.mairie-skeleton')).toBeNull();
  });
});
