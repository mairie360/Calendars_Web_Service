import { it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { CalendarLegend } from './CalendarLegend';
import { getEventColor } from '@/app/calendar/constants';

it('MAIR-1121: the legend lists every category with the exact colours of the event pills', async () => {
  const { container } = render(<CalendarLegend />);
  const legend = screen.getByRole('list', { name: 'Légende du calendrier' });
  const items = within(legend).getAllByRole('listitem');
  expect(items.map((item) => item.textContent)).toEqual(['Réunion', 'Animation', 'Cérémonie', 'Autre']);
  const swatches = items.map((item) => item.querySelector('.calendar-legend-swatch')!);
  expect(swatches.map((swatch) => swatch.getAttribute('data-tone'))).toEqual(['secondary-strong', 'success', 'warning', 'purple']);
  ['meeting', 'activity', 'ceremony', 'other'].forEach((category, index) => {
    for (const name of getEventColor(category).split(' ')) expect(swatches[index]).toHaveClass(name);
  });
  expect((await axe(container)).violations).toEqual([]);
});
