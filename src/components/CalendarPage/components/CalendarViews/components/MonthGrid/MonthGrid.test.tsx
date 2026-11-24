import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthGrid } from './MonthGrid';
it('selects the named calendar date without confusing an event activation for a date choice', async () => { const event = { id: 1, title: 'Conseil', date: '2026-10-15' }; const onSelectDate = vi.fn(); const onEventClick = vi.fn(); render(<MonthGrid currentDate="2026-10-15" events={[event]} onSelectDate={onSelectDate} onEventClick={onEventClick} />); await userEvent.click(screen.getByRole('button', { name: 'Sélectionner le 16 Octobre 2026' })); expect(onSelectDate).toHaveBeenCalledWith(new Date(2026, 9, 16)); await userEvent.click(screen.getByRole('button', { name: /Conseil/ })); expect(onEventClick).toHaveBeenCalledWith(event); expect(onSelectDate).toHaveBeenCalledTimes(1); });

it('MAIR-905: days of the adjacent months fill the weeks as inert Outside cells', () => {
  const { container } = render(<MonthGrid currentDate="2026-10-15" onSelectDate={vi.fn()} />);
  // October 2026 starts on a Thursday and ends on a Saturday: 28, 29, 30 September and 1 November.
  const outside = [...container.querySelectorAll('[data-state="outside"]')];
  expect(outside.map(cell => cell.textContent)).toEqual(['28', '29', '30', '1']);
  outside.forEach(cell => expect(cell).toHaveAttribute('aria-hidden', 'true'));
  expect(screen.getAllByRole('button', { name: /^Sélectionner le/ })).toHaveLength(31);
});

it('MAIR-905: a day is a keyboard command announcing the creation dialog', async () => {
  const onSelectDate = vi.fn();
  render(<MonthGrid currentDate="2026-10-15" onSelectDate={onSelectDate} />);
  const day = screen.getByRole('button', { name: 'Sélectionner le 20 Octobre 2026' });
  expect(day).toHaveAttribute('aria-haspopup', 'dialog');
  expect(day).toHaveTextContent('20');
  day.focus(); await userEvent.keyboard('{Enter}'); await userEvent.keyboard(' ');
  expect(onSelectDate).toHaveBeenCalledTimes(2); expect(onSelectDate).toHaveBeenLastCalledWith(new Date(2026, 9, 20));
});

it('MAIR-905: a pill shows its start time only while its day holds a single event', () => {
  const events = [
    { id: 1, title: 'Seul', date: '2026-10-14', startTime: '14:00', endTime: '15:00', category: 'meeting' },
    { id: 2, title: 'Premier', date: '2026-10-15', startTime: '09:00', endTime: '10:00', category: 'activity' },
    { id: 3, title: 'Second', date: '2026-10-15', startTime: '11:00', endTime: '12:00', category: 'ceremony' },
  ];
  render(<MonthGrid currentDate="2026-10-15" events={events} onEventClick={vi.fn()} />);
  expect(screen.getByRole('button', { name: /Seul/ })).toHaveTextContent('14:00Seul');
  expect(screen.getByRole('button', { name: /Premier/ })).toHaveTextContent(/^Premier$/);
  expect(screen.getByRole('button', { name: /Second/ })).toHaveTextContent(/^Second$/);
  expect(screen.getByRole('button', { name: /Premier/ })).toHaveAttribute('data-tone', 'success');
  expect(screen.getByRole('button', { name: /Second/ })).toHaveAttribute('data-tone', 'warning');
});
