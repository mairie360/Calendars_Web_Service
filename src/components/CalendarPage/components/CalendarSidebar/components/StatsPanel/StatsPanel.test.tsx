import { it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsPanel } from './StatsPanel';
it('keeps each supplied statistic associated with its value', () => {
  render(<StatsPanel stats={[{ label: 'Réunions', value: 8 }, { label: 'Participants', value: 24 }]} />); expect(screen.getByText('Réunions').closest('div')).toHaveTextContent('8'); expect(screen.getByText('Participants').closest('div')).toHaveTextContent('24');
});
it('MAIR-911: is a busy skeleton while loading and « Statistiques indisponibles. » after a failed read', () => {
  const { rerender } = render(<StatsPanel stats={[{ label: 'Réunions', value: 8 }]} state="loading" />);
  expect(screen.getByRole('region', { name: 'Statistiques' })).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('status')).toHaveTextContent('Chargement des statistiques…');
  expect(screen.queryByText('Réunions')).toBeNull();
  rerender(<StatsPanel stats={[{ label: 'Réunions', value: 8 }]} state="unavailable" />);
  expect(screen.getByText('Statistiques indisponibles.')).toBeVisible();
  expect(screen.queryByText('Réunions')).toBeNull();
});
