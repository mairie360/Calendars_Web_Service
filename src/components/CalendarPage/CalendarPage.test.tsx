import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
vi.mock('@/lib/auth-session', () => ({ useAuthSession: () => ({ user: { name: 'Agent' }, isAdmin: false }), logoutAndReload: vi.fn() }));
vi.mock('@/app/navigation', () => ({ getActiveFrontHrefs: () => ({ calendar: '/' }) }));
const page = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('@/app/calendar/use-calendar-page', () => ({ useCalendarPage: () => page.state }));
vi.mock('./components/CalendarViews', () => ({ CalendarViews: () => <div>grille</div> }));
vi.mock('./components/CalendarSidebar', () => ({ CalendarSidebar: () => <div>colonne</div> }));
vi.mock('./components/CalendarModals', () => ({ CalendarModals: () => null }));

import CalendarPage from './CalendarPage';

const loaded = (overrides: Record<string, unknown> = {}) => ({
  ready: true, readError: null, mutationError: null, loading: false, saving: false, feedback: null,
  dismissFeedback: vi.fn(), refreshData: vi.fn(), openCreateModal: vi.fn(), view: 'month',
  currentDate: new Date(2026, 9, 21), selectedDate: new Date(2026, 9, 21), events: [], stats: {}, ...overrides,
});

describe('CalendarPage', () => {
  beforeEach(() => { page.state = { ready: false, readError: null, view: 'month', currentDate: new Date(2026, 9, 21) }; });

  it('renders the shell, the header and the loading card until the data is ready', () => {
    render(<CalendarPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Calendrier & Événements' })).toBeInTheDocument();
    expect(screen.getByText('Chargement des données du calendrier…')).toBeInTheDocument();
  });

  it('MAIR-879: announces a confirmed action in a success toast and acknowledges it', () => {
    const dismissFeedback = vi.fn();
    page.state = loaded({ feedback: 'Événement « Conseil » créé.', dismissFeedback });
    render(<CalendarPage />);
    const region = screen.getByRole('region', { name: 'Notifications du calendrier' });
    expect(region).toHaveAttribute('data-placement', 'top-end');
    expect(within(region).getByText('Événement « Conseil » créé.')).toBeInTheDocument();
    expect(dismissFeedback).toHaveBeenCalledTimes(1);
  });

  it('MAIR-879: a refused write stays in an error toast, announced once', () => {
    page.state = loaded({ mutationError: 'Calendrier : Modification refusée' });
    const { rerender } = render(<CalendarPage />);
    rerender(<CalendarPage />);
    const region = screen.getByRole('region', { name: 'Notifications du calendrier' });
    expect(within(region).getAllByText('Calendrier : Modification refusée')).toHaveLength(1);
  });
});
