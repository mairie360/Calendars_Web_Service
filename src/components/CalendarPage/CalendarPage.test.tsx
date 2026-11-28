import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
const auth = vi.hoisted(() => ({ session: {} as Record<string, unknown> }));
vi.mock('@/lib/auth-session', () => ({ useAuthSession: () => auth.session, logoutAndReload: vi.fn() }));
vi.mock('@/app/navigation', () => ({ getActiveFrontHrefs: () => ({ calendar: '/', projects: 'https://projects.example/' }) }));
const page = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('@/app/calendar/use-calendar-page', () => ({ useCalendarPage: () => page.state }));
vi.mock('./components/CalendarViews', () => ({ CalendarViews: ({ state }: { state: string }) => <div>grille {state}</div> }));
vi.mock('./components/CalendarSidebar', () => ({ CalendarSidebar: ({ state }: { state: string }) => <div>colonne {state}</div> }));
vi.mock('./components/CalendarModals', () => ({ CalendarModals: () => null }));

import CalendarPage from './CalendarPage';

/** The shared shell header (the page title bar is the other `header`). */
const shellHeader = () => screen.getAllByRole('banner')[0];

const searchAnswer = {
  groups: [
    { module: 'calendar', items: [{ kind: 'event', id: 4, title: 'Conseil municipal', excerpt: 'Salle du conseil', parent_id: null, updated_at: '2026-12-03T18:00:00' }] },
    { module: 'projects', items: [{ kind: 'project', id: 7, title: 'Conseil des jeunes', excerpt: null, parent_id: null, updated_at: '2026-11-20T10:00:00Z' }] },
  ],
  unavailable: [],
};

const loaded = (overrides: Record<string, unknown> = {}) => ({
  ready: true, readError: null, mutationError: null, loading: false, saving: false, feedback: null,
  dismissFeedback: vi.fn(), refreshData: vi.fn(), openCreateModal: vi.fn(), view: 'month',
  currentDate: new Date(2026, 9, 21), selectedDate: new Date(2026, 9, 21), events: [], stats: {}, ...overrides,
});

describe('CalendarPage', () => {
  beforeEach(() => {
    page.state = { ready: false, readError: null, view: 'month', currentDate: new Date(2026, 9, 21) };
    auth.session = { user: { name: 'Agent', role: 'User' }, isAdmin: false, loading: false, error: null };
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('MAIR-911: renders the shell, the header and the three panel skeletons until the data is ready', () => {
    render(<CalendarPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Calendrier & Événements' })).toBeInTheDocument();
    expect(screen.getByText('grille loading')).toBeInTheDocument();
    expect(screen.getByText('colonne loading')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Créer' })).toBeNull();
  });

  it('MAIR-911: an explicit refresh shows skeletons, a failed read the unavailable states', () => {
    page.state = loaded({ panelsLoading: true, loading: true });
    const { rerender } = render(<CalendarPage />);
    expect(screen.getByText('grille loading')).toBeInTheDocument();
    page.state = loaded({ readError: 'Calendar API unavailable' });
    rerender(<CalendarPage />);
    expect(screen.getByText('grille unavailable')).toBeInTheDocument();
    expect(screen.getByText('colonne unavailable')).toBeInTheDocument();
    page.state = loaded({ loading: true, readError: 'Calendar API unavailable' }); // a period change keeps the state
    rerender(<CalendarPage />);
    expect(screen.getByText('grille unavailable')).toBeInTheDocument();
    page.state = loaded();
    rerender(<CalendarPage />);
    expect(screen.getByText('grille default')).toBeInTheDocument();
  });

  it('MAIR-484: one status region, mounted with the page, whose text alone follows the loading state (RGAA 7.5)', () => {
    page.state = loaded();
    const { rerender } = render(<CalendarPage />);
    // The header search keeps its own result-count region in its search form (MAIR-1230): the page's is the other one.
    const region = screen.getByText((_, element) => element?.tagName === 'P' && element.getAttribute('role') === 'status' && !element.closest('form[role="search"]'));
    expect(region).toHaveTextContent('');
    page.state = loaded({ panelsLoading: true, loading: true });
    rerender(<CalendarPage />);
    expect(region).toBeInTheDocument();
    expect(region).toHaveTextContent('Chargement des données du calendrier…');
    page.state = loaded();
    rerender(<CalendarPage />);
    expect(region).toBeInTheDocument();
    expect(region).toHaveTextContent('');
  });

  it('MAIR-879 / MAIR-1120: announces a confirmed action in a success toast at the bottom right and acknowledges it', () => {
    const dismissFeedback = vi.fn();
    page.state = loaded({ feedback: 'Événement « Conseil » créé.', dismissFeedback });
    render(<CalendarPage />);
    const region = screen.getByRole('region', { name: 'Notifications du calendrier' });
    expect(region).toHaveAttribute('data-placement', 'bottom-end');
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

  it('MAIR-1256: the library shell header names the signed-in agent from the session', () => {
    page.state = loaded({ currentUser: { id: 'user-1', name: 'Admin Mairie', email: 'admin@mairie.test', role: 'Admin', groupIds: [] } });
    render(<CalendarPage />);
    const header = shellHeader();
    expect(within(header).getByText('Agent')).toBeInTheDocument();
    expect(within(header).queryByText('Admin Mairie')).toBeNull();
  });

  it('MAIR-1256: while or when the session cannot be read, the header names the agent BFF_Calendar returned', () => {
    auth.session = { user: { name: 'Chargement…', role: 'Guest' }, isAdmin: false, loading: true, error: null };
    page.state = loaded({ currentUser: { id: 'user-1', name: 'Admin Mairie', email: 'admin@mairie.test', role: 'Admin', groupIds: [] } });
    const { rerender } = render(<CalendarPage />);
    expect(within(shellHeader()).getByText('Admin Mairie')).toBeInTheDocument();
    auth.session = { user: { name: 'Chargement…', role: 'Guest' }, isAdmin: false, loading: false, error: 'Les informations du profil sont indisponibles.' };
    rerender(<CalendarPage />);
    expect(within(shellHeader()).getByText('Admin Mairie')).toBeInTheDocument();
    expect(screen.queryByText('Chargement…')).toBeNull();
  });

  it('MAIR-1230: the header searches every module through the same-origin /search and links the results', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(searchAnswer), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    const setSearchQuery = vi.fn();
    page.state = loaded({ searchQuery: 'conseil', setSearchQuery });
    render(<CalendarPage />);

    const field = screen.getByRole('combobox', { name: 'Rechercher' });
    fireEvent.focus(field);
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toBe('/search?q=conseil');
    expect(screen.getByRole('option', { name: /Conseil municipal/ })).toHaveAttribute('data-href', '/?date=2026-12-03&event=4');
    expect(screen.getByRole('option', { name: /Conseil des jeunes/ })).toHaveAttribute('data-href', 'https://projects.example/?project=7');
    // The calendar's own search stays the first option and keeps the typed filter.
    fireEvent.click(screen.getByRole('option', { name: 'Rechercher « conseil » dans Calendrier' }));
    expect(setSearchQuery).toHaveBeenCalledWith('conseil');
  });
});
