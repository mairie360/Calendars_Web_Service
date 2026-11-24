import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpcomingEventsPanel } from './UpcomingEventsPanel';
import { axe } from 'jest-axe';
it('activates an actual event with keyboard and exposes the requested empty state', async () => {
  const user = userEvent.setup(); const onEventClick = vi.fn(); const event = { id: 'e1', title: 'Conseil', date: '2026-10-15', startTime: '09:00', description: 'Salle 1', assignees: [{ id: 1, name: 'Anne' }] }; const { container, rerender } = render(<UpcomingEventsPanel events={[event]} onEventClick={onEventClick} />);
  screen.getByRole('button', { name: /Conseil/ }).focus(); await user.keyboard('{Enter} '); expect(onEventClick).toHaveBeenCalledTimes(2); expect(onEventClick).toHaveBeenLastCalledWith(event); expect((await axe(container)).violations).toEqual([]); rerender(<UpcomingEventsPanel events={[]} showEmptyState />); expect(screen.getByText('Aucun événement à venir')).toBeVisible();
});
it('MAIR-911: shows a skeleton while loading and an unavailable alert whose retry reloads', async () => {
  const onRetry = vi.fn(); const event = { id: 'e1', title: 'Conseil', date: '2026-10-15' };
  const { rerender } = render(<UpcomingEventsPanel events={[event]} state="loading" onRetry={onRetry} />);
  expect(screen.getByRole('status')).toHaveTextContent('Chargement des événements à venir…'); expect(screen.queryByText('Conseil')).toBeNull();
  rerender(<UpcomingEventsPanel events={[event]} state="unavailable" onRetry={onRetry} />);
  expect(screen.getByText('Service indisponible')).toBeVisible(); expect(screen.queryByText('Conseil')).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Réessayer' })); expect(onRetry).toHaveBeenCalledTimes(1);
});
