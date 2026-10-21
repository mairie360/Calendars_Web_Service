import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeekGrid } from '@/components/calendar/WeekGrid';
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
