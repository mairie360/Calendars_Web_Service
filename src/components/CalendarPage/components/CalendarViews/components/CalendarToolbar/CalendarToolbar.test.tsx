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
  expect(screen.getByRole('heading', { level: 2, name: 'Octobre 2026' })).toBeInTheDocument();
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
it('MAIR-1256: one line « ‹ › <period> [Aujourd’hui] » then the views, the period naming the card', () => {
  const { container } = render(<CalendarToolbar title="Novembre 2026" titleId="period" view="month" />);
  const heading = screen.getByRole('heading', { level: 2, name: 'Novembre 2026' });
  expect(heading).toHaveAttribute('id', 'period');
  expect(heading).toHaveAttribute('aria-live', 'polite');
  const controls = [
    screen.getByRole('button', { name: 'Période précédente' }), screen.getByRole('button', { name: 'Période suivante' }),
    heading, screen.getByRole('button', { name: 'Aujourd’hui' }), screen.getByRole('radiogroup', { name: 'Changer de vue' }),
  ];
  const all = [...container.querySelectorAll('*')];
  const positions = controls.map((element) => all.indexOf(element));
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  // The arrows, the period and « Aujourd’hui » share one row; the views sit on its right.
  expect(heading.parentElement).toBe(controls[0].closest('.calendar-period-nav'));
  expect(controls[3].closest('.calendar-period-nav')).toBe(heading.parentElement);
  expect(controls[4].closest('.calendar-period-nav')).toBeNull();
});
it('MAIR-1256: « Aujourd’hui » is an outline button', () => {
  render(<CalendarToolbar title="Novembre 2026" view="month" />);
  const today = screen.getByRole('button', { name: 'Aujourd’hui' });
  expect(today).toHaveAttribute('data-variant', 'outline');
  expect(today).toHaveAttribute('data-tone', 'neutral');
});
