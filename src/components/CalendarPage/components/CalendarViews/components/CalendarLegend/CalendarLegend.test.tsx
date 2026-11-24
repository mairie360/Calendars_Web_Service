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
  expect(items.map((item) => item.textContent)).toEqual([
    'Réunion', 'Animation', 'Cérémonie', 'Autre',
    'Réunion · Je participe', 'Réunion · En attente de ma réponse', 'Réunion · Déclinée',
  ]);
  const swatches = items.map((item) => item.querySelector('.calendar-legend-swatch')!);
  expect(swatches.slice(0, 4).map((swatch) => swatch.getAttribute('data-tone'))).toEqual(['secondary-strong', 'success', 'warning', 'purple']);
  // MAIR-1122: the three looks of a meeting by participation, with the classes of the pills.
  (['accepted', 'pending', 'declined'] as const).forEach((state, index) => {
    for (const name of getEventColor('meeting', state).split(' ')) expect(swatches[4 + index]).toHaveClass(name);
  });
  ['meeting', 'activity', 'ceremony', 'other'].forEach((category, index) => {
    for (const name of getEventColor(category).split(' ')) expect(swatches[index]).toHaveClass(name);
  });
  expect((await axe(container)).violations).toEqual([]);
});
