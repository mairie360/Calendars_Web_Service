import { it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CalendarSidebar } from './CalendarSidebar';
it('MAIR-918: shows the supplied occurrences and month statistics, « À venir » first', () => {
  render(<CalendarSidebar today={new Date(2026, 9, 15)} upcoming={[{ event: { id: 1, title: 'Conseil', date: '2026-10-16' }, date: new Date(2026, 9, 16) }]}
    stats={{ month: 'octobre', total: 4, items: [{ category: 'meeting', label: 'Réunions', value: 4 }] }} />);
  const headings = screen.getAllByRole('heading').map(heading => heading.textContent);
  expect(headings).toEqual(['À venir', 'Statistiques']);
  expect(screen.getByRole('button', { name: /Conseil/ })).toHaveTextContent('Demain');
  expect(screen.getByRole('region', { name: 'Réunions' })).toHaveTextContent('4');
});
