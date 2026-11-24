import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarToolbar } from './CalendarToolbar';
import { axe } from 'jest-axe';
it('MAIR-893: delegates the period and view choices through the lib controls', async () => {
  const onPrevious = vi.fn(); const onNext = vi.fn(); const onToday = vi.fn(); const onViewChange = vi.fn();
  const { container } = render(<CalendarToolbar title="Octobre 2026" view="month" onPrevious={onPrevious} onNext={onNext} onToday={onToday} onViewChange={onViewChange} />);
  expect(screen.queryByRole('heading')).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Période précédente' }));
  await userEvent.click(screen.getByRole('button', { name: 'Période suivante' }));
  await userEvent.click(screen.getByRole('button', { name: 'Aujourd’hui' }));
  await userEvent.click(screen.getByRole('radio', { name: 'Semaine' }));
  expect(onPrevious).toHaveBeenCalledTimes(1); expect(onNext).toHaveBeenCalledTimes(1); expect(onToday).toHaveBeenCalledTimes(1);
  expect(onViewChange).toHaveBeenCalledWith('week');
  expect((await axe(container)).violations).toEqual([]);
});
it('MAIR-893: the view choice follows the keyboard arrows', async () => {
  const onViewChange = vi.fn();
  render(<CalendarToolbar view="week" onViewChange={onViewChange} />);
  screen.getByRole('radio', { name: 'Semaine' }).focus();
  await userEvent.keyboard('{ArrowRight}');
  expect(onViewChange).toHaveBeenCalledWith('day');
});
