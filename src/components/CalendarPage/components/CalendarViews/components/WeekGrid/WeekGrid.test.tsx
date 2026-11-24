import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeekGrid } from './WeekGrid';
import { axe } from 'jest-axe';

it('selects an actual day, time slot and event through distinct callbacks', async () => {
  const user = userEvent.setup(); const onSelectDate = vi.fn(); const onSelectSlot = vi.fn(); const onEventClick = vi.fn();
  const event = { id: 'e1', title: 'Conseil', date: '2026-10-15', startTime: '09:00', endTime: '10:00' };
  const { container } = render(<WeekGrid currentDate="2026-10-15" selectedDate="2026-10-16" hours={['08:00', '09:00', '10:00']} events={[event]} onSelectDate={onSelectDate} onSelectSlot={onSelectSlot} onEventClick={onEventClick} />);
  await user.click(screen.getByRole('button', { name: 'Sélectionner le 16 Octobre 2026' })); expect(onSelectDate).toHaveBeenCalledWith(new Date(2026, 9, 16));
  const slot = screen.getByRole('button', { name: '15 Octobre 2026 à 09:00' }); slot.focus(); await user.keyboard('{Enter}'); expect(onSelectSlot).toHaveBeenCalledWith(new Date(2026, 9, 15), '09:00');
  await user.click(screen.getByRole('button', { name: /Conseil/ })); expect(onEventClick).toHaveBeenCalledWith(event); expect(onSelectDate).toHaveBeenCalledTimes(1);
  expect((await axe(container)).violations).toEqual([]);
});
it('keeps a cross-day event visible and does not fabricate empty timeline hours', () => {
  const { rerender } = render(<WeekGrid currentDate="2026-10-15" hours={['08:00', '09:00']} events={[{ id: 'ongoing', title: 'Mission', date: '2026-10-14', endDate: '2026-10-16', startTime: '08:00', endTime: '10:00' }]} />);
  expect(screen.getAllByText('Mission').length).toBe(3);
  rerender(<WeekGrid currentDate="2026-10-15" hours={[]} />); expect(screen.queryByRole('button', { name: /à 08:00/ })).not.toBeInTheDocument();
});

const overlapping = [
  { id: 'a', title: 'Conseil municipal extraordinaire', date: '2026-10-15', startTime: '09:00', endTime: '10:00' },
  { id: 'b', title: 'Commission', date: '2026-10-15', startTime: '09:30', endTime: '11:00' },
  { id: 'c', title: 'Point presse', date: '2026-10-15', startTime: '10:00', endTime: '10:30' },
  { id: 'd', title: 'Déjeuner', date: '2026-10-15', startTime: '12:00', endTime: '13:00' },
];

it('MAIR-1123: overlapping meetings show one readable event at full width and a « +N » that opens the day', async () => {
  const user = userEvent.setup(); const onShowDay = vi.fn(); const onEventClick = vi.fn();
  const { container } = render(<WeekGrid currentDate="2026-10-15" hours={['08:00', '09:00', '10:00', '11:00', '12:00']} events={overlapping} onShowDay={onShowDay} onEventClick={onEventClick} />);
  const shown = screen.getByText('Conseil municipal extraordinaire');
  expect(shown).toHaveClass('calendar-event-title', 'line-clamp-2');
  expect(shown.parentElement).toHaveStyle({ left: '2px', right: '2px' });
  expect(shown.parentElement?.style.width).toBe('');
  expect(screen.getByText('09:00', { selector: '[role="button"] div' })).toBeInTheDocument();
  expect(screen.queryByText('Commission')).not.toBeInTheDocument();
  expect(screen.queryByText('Point presse')).not.toBeInTheDocument();
  const more = screen.getByRole('button', { name: '2 autres rendez-vous le 15 Octobre 2026, ouvrir la vue Jour' });
  expect(more).toHaveTextContent('+2');
  more.focus(); await user.keyboard('{Enter}');
  expect(onShowDay).toHaveBeenCalledWith(new Date(2026, 9, 15));
  expect(onEventClick).not.toHaveBeenCalled();
  expect((await axe(container)).violations).toEqual([]);
});

it('MAIR-1123: a meeting alone keeps the full width even when others overlap earlier in the column', () => {
  render(<WeekGrid currentDate="2026-10-15" hours={['08:00', '09:00', '10:00', '11:00', '12:00']} events={overlapping} />);
  const alone = screen.getByText('Déjeuner').parentElement;
  expect(alone).toHaveStyle({ left: '2px', right: '2px' });
  expect(alone?.style.width).toBe('');
  expect(screen.getAllByRole('button', { name: /autres? rendez-vous/ })).toHaveLength(1);
});

it('MAIR-1123: two overlapping meetings give « +1 » with a singular label, no « +N » without overlap', () => {
  const { rerender } = render(<WeekGrid currentDate="2026-10-15" hours={['09:00', '10:00']} events={overlapping.slice(0, 2)} />);
  expect(screen.getByRole('button', { name: '1 autre rendez-vous le 15 Octobre 2026, ouvrir la vue Jour' })).toHaveTextContent('+1');
  rerender(<WeekGrid currentDate="2026-10-15" hours={['09:00', '10:00']} events={overlapping.slice(3)} />);
  expect(screen.queryByRole('button', { name: /rendez-vous le/ })).not.toBeInTheDocument();
});
