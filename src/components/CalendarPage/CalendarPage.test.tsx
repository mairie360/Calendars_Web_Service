import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
vi.mock('@/lib/auth-session', () => ({ useAuthSession: () => ({ user: { name: 'Agent' }, isAdmin: false }), logoutAndReload: vi.fn() }));
vi.mock('@/app/navigation', () => ({ getActiveFrontHrefs: () => ({ calendar: '/' }) }));
vi.mock('@/app/calendar/use-calendar-page', () => ({ useCalendarPage: () => ({ ready: false, readError: null, view: 'month', currentDate: new Date(2026, 9, 21) }) }));

import CalendarPage from './CalendarPage';

describe('CalendarPage', () => {
  it('renders the shell, the header and the loading card until the data is ready', () => {
    render(<CalendarPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Calendrier & Événements' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Chargement des données du calendrier…');
  });
});
