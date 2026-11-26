import { it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { CalendarLegend } from './CalendarLegend';
import { getEventColor } from '@/app/calendar/constants';

it('MAIR-1222 the legend shows the meeting looks only, as in the mockup, with the exact classes of the event pills', async () => {
  const { container } = render(<CalendarLegend />);
  expect(container.textContent).toMatch(/^Réunions :/);
  const legend = screen.getByRole('list', { name: 'Réunions :' });
  const items = within(legend).getAllByRole('listitem');
  expect(items.map((item) => item.textContent)).toEqual(['Je participe', 'En attente de ma réponse', 'Déclinée']);
  const swatches = items.map((item) => item.querySelector('.calendar-legend-swatch')!);
  // MAIR-1122: the three looks of a meeting by participation, with the classes of the pills.
  (['accepted', 'pending', 'declined'] as const).forEach((state, index) => {
    for (const name of getEventColor('meeting', state).split(' ')) expect(swatches[index]).toHaveClass(name);
  });
  expect((await axe(container)).violations).toEqual([]);
});
