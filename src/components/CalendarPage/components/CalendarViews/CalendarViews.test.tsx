import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CalendarViews } from './CalendarViews';

const make = (overrides: Record<string, unknown> = {}) => ({ ready: true, readError: null, refreshData: vi.fn(), periodTitle: 'Octobre 2026', view: 'month', currentDate: new Date(2026, 9, 21), selectedDate: new Date(2026, 9, 21), events: [], handlePrevious: vi.fn(), handleNext: vi.fn(), setView: vi.fn(), handleSelectDate: vi.fn(), handleSelectSlot: vi.fn(), handleEventClick: vi.fn(), ...overrides }) as never;

describe('CalendarViews', () => {
  it('renders the toolbar and the month grid of the current view', () => {
    const { container } = render(<CalendarViews calendar={make()} gridRef={React.createRef()} />);
    expect(screen.getByText('Octobre 2026')).toBeInTheDocument();
    expect(container.querySelector('.calendar-month-grid')).not.toBeNull();
    expect(screen.getByRole('button', { name: /précédent/i })).toBeInTheDocument();
  });

  it('MAIR-911: keeps the toolbar and shows a skeleton while the calendar loads', () => {
    const { container } = render(<CalendarViews calendar={make()} gridRef={React.createRef()} state="loading" />);
    expect(screen.getByRole('status')).toHaveTextContent('Chargement des données du calendrier…');
    expect(screen.getByRole('button', { name: /précédent/i })).toBeInTheDocument();
    expect(container.querySelector('.calendar-month-grid')).toBeNull();
  });

  it('MAIR-911: a failed read shows the unavailable state whose retry reloads the calendar', async () => {
    const calendar = make({ readError: 'Calendar API unavailable' });
    const { container } = render(<CalendarViews calendar={calendar} gridRef={React.createRef()} state="unavailable" />);
    expect(screen.getByText('Calendrier indisponible.')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Calendrier : Calendar API unavailable');
    expect(container.querySelector('.calendar-month-grid')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect((calendar as unknown as { refreshData: ReturnType<typeof vi.fn> }).refreshData).toHaveBeenCalledTimes(1);
  });

  it('does not render a server-dated toolbar before the browser initialisation', () => {
    render(<CalendarViews calendar={make({ ready: false })} gridRef={React.createRef()} state="loading" />);
    expect(screen.queryByText('Octobre 2026')).toBeNull();
  });
});
