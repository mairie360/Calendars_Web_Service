import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarCell } from './CalendarCell';
import { axe } from 'jest-axe';
it('provides a keyboard-activatable day and respects its disabled state', async () => { const onClick = vi.fn(); const { container, rerender } = render(<CalendarCell selected onClick={onClick}>15 Octobre</CalendarCell>); await userEvent.tab(); await userEvent.keyboard('{Enter}'); expect(onClick).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]); rerender(<CalendarCell disabled onClick={onClick}>15 Octobre</CalendarCell>); expect(screen.getByRole('button')).toBeDisabled(); });

it('MAIR-1222 a month day keeps its number at the top, above the events', () => {
  render(<CalendarCell day={26} aria-label="Sélectionner le lundi 26 octobre 2026" />);
  const cell = screen.getByRole('button', { name: 'Sélectionner le lundi 26 octobre 2026' });
  // A button centres its content vertically: the cell is a column aligned on its top edge instead.
  expect(cell).toHaveClass('flex', 'flex-col', 'items-start', 'justify-start');
  expect(cell.firstElementChild).toHaveClass('calendar-day-number');
  expect(cell.firstElementChild).toHaveTextContent('26');
});
