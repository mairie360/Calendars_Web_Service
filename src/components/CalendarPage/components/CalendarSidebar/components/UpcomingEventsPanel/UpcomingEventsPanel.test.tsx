import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpcomingEventsPanel, upcomingDayLabel } from './UpcomingEventsPanel';
import { axe } from 'jest-axe';
const today = new Date(2026, 10, 18);
const categories = [{ value: 'meeting', label: 'Réunion' }, { value: 'ceremony', label: 'Cérémonie' }];
const event = { id: 'e1', title: 'Conseil', date: '2026-11-18', startTime: '09:00', endTime: '10:00', category: 'meeting', description: 'Salle 1', assignees: [{ id: 1, name: 'Anne Martin' }, { id: 2, name: 'Paul Roux' }] };
it('MAIR-918: a row shows the title, the category pill, the day and hours and the participants, and opens the event', async () => {
  const user = userEvent.setup(); const onEventClick = vi.fn();
  const { container } = render(<UpcomingEventsPanel today={today} categories={categories} onEventClick={onEventClick} items={[{ event, date: today }]} />);
  expect(screen.getByRole('heading', { name: 'À venir' })).toBeVisible();
  expect(screen.getByText('Les 3 prochains événements')).toBeVisible();
  const row = screen.getByRole('button', { name: /Conseil/ });
  expect(row).toHaveTextContent('Réunion'); expect(row).toHaveTextContent('Aujourd’hui · 09:00 – 10:00');
  expect(within(row).getByRole('list', { name: 'Participants' })).toBeInTheDocument();
  expect(row).not.toHaveTextContent('Salle 1');
  row.focus(); await user.keyboard('{Enter}'); expect(onEventClick).toHaveBeenCalledWith(event);
  expect((await axe(container)).violations).toEqual([]);
});
it('MAIR-918: names the day as Aujourd’hui, Demain or its short date, and shows an empty state', () => {
  expect(upcomingDayLabel(today, today)).toBe('Aujourd’hui');
  expect(upcomingDayLabel(new Date(2026, 10, 19), today)).toBe('Demain');
  expect(upcomingDayLabel(new Date(2026, 10, 20), today)).toBe('ven. 20 nov.');
  render(<UpcomingEventsPanel items={[]} />);
  expect(screen.getByText('Aucun événement à venir.')).toBeVisible();
});
it('MAIR-911: shows a skeleton while loading and an unavailable alert whose retry reloads', async () => {
  const onRetry = vi.fn(); const items = [{ event, date: today }];
  const { container, rerender } = render(<UpcomingEventsPanel items={items} state="loading" onRetry={onRetry} />);
  // MAIR-484: a busy, decorative skeleton; no status inserted with its text (RGAA 7.5).
  expect(container.querySelector('[data-calendar-skeleton][aria-busy="true"]')).not.toBeNull();
  expect(screen.queryByRole('status')).toBeNull(); expect(screen.queryByText('Conseil')).toBeNull();
  rerender(<UpcomingEventsPanel items={items} state="unavailable" onRetry={onRetry} />);
  expect(screen.getByText('Service indisponible')).toBeVisible(); expect(screen.queryByText('Conseil')).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Réessayer' })); expect(onRetry).toHaveBeenCalledTimes(1);
});
it('MAIR-1180: under active filters the panel says its events are filtered, also when none is left', () => {
  render(<UpcomingEventsPanel today={today} categories={categories} filtered items={[]} />);
  expect(screen.getByText('Les 3 prochains événements filtrés')).toBeVisible();
  expect(screen.getByText('Aucun événement à venir ne correspond aux filtres.')).toBeVisible();
});
it('MAIR-1179: a private upcoming event shows a lock and reads « (privé) »', () => {
  const { container } = render(<UpcomingEventsPanel today={today} categories={categories} onEventClick={vi.fn()} items={[{ event: { ...event, visibility: 'private' as const }, date: today }, { event: { ...event, id: 'e2', title: 'Fête' }, date: today }]} />);
  expect(screen.getByRole('button', { name: /Conseil\s*\(privé\)/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Fête/ })).not.toHaveTextContent('privé');
  expect(container.querySelectorAll('svg.lucide-lock')).toHaveLength(1);
});
