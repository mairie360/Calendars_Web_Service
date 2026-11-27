import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
vi.mock('@/lib/auth-session', () => ({ useAuthSession: () => ({ user: { name: 'Agent' }, isAdmin: false }), logoutAndReload: vi.fn() }));
vi.mock('@/app/navigation', () => ({ getActiveFrontHrefs: () => ({ calendar: '/', projects: 'https://projects.example/' }) }));

import { AppShell } from './AppShell';

const searchAnswer = {
  groups: [
    { module: 'calendar', items: [{ kind: 'event', id: 4, title: 'Conseil municipal', excerpt: 'Salle du conseil', parent_id: null, updated_at: '2026-12-03T18:00:00' }] },
    { module: 'projects', items: [{ kind: 'project', id: 7, title: 'Conseil des jeunes', excerpt: null, parent_id: null, updated_at: '2026-11-20T10:00:00Z' }] },
  ],
  unavailable: [],
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('AppShell', () => {
  it('binds the session to the shared shell around the page content', () => {
    render(<AppShell activeItem="calendar"><p>Contenu</p></AppShell>);
    expect(screen.getByText('Contenu')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('MAIR-1230: the header searches every module through the same-origin /search and links the results', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(searchAnswer), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    const onChange = vi.fn();
    render(<AppShell activeItem="calendar" search={{ value: 'conseil', onChange }}><p>Contenu</p></AppShell>);

    const field = screen.getByRole('combobox', { name: 'Rechercher' });
    fireEvent.focus(field);
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toBe('/search?q=conseil');
    const event = screen.getByRole('option', { name: /Conseil municipal/ });
    expect(event).toHaveAttribute('data-href', '/?date=2026-12-03&event=4');
    expect(screen.getByRole('option', { name: /Conseil des jeunes/ })).toHaveAttribute('data-href', 'https://projects.example/?project=7');
    // The calendar's own search stays the first option and keeps the typed filter.
    fireEvent.click(screen.getByRole('option', { name: 'Rechercher « conseil » dans Calendrier' }));
    expect(onChange).toHaveBeenCalledWith('conseil');
  });

  it('MAIR-1230: the global search is offered even on a page without the calendar search', () => {
    render(<AppShell activeItem="calendar"><p>Contenu</p></AppShell>);
    expect(screen.getByRole('combobox', { name: 'Rechercher' })).toBeInTheDocument();
  });
});
