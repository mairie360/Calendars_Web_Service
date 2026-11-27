import { it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsPanel, statIconOf } from './StatsPanel';
const stats = { month: 'novembre', total: 5, items: [
  { category: 'meeting', label: 'Réunions', value: 3 }, { category: 'activity', label: 'Animations', value: 1 },
  { category: 'ceremony', label: 'Cérémonies', value: 1 }, { category: 'other', label: 'Autres', value: 0 },
] };
it('MAIR-918: one MetricCard per category with « N événements en <mois> » and the « En <mois> » trend', () => {
  render(<StatsPanel stats={stats} />);
  expect(screen.getByText('5 événements en novembre')).toBeVisible();
  for (const item of stats.items) {
    const card = screen.getByRole('group', { name: item.label });
    expect(card).toHaveTextContent(String(item.value));
    expect(card).toHaveTextContent('En novembre');
  }
  render(<StatsPanel stats={{ month: 'décembre', total: 1, items: [] }} />);
  expect(screen.getByText('1 événement en décembre')).toBeVisible();
});
it('MAIR-911: is a busy skeleton while loading and « Statistiques indisponibles. » after a failed read', () => {
  const { container, rerender } = render(<StatsPanel stats={stats} state="loading" />);
  // MAIR-484: a busy, decorative skeleton; no status inserted with its text (RGAA 7.5).
  expect(container.querySelector('[data-calendar-skeleton][aria-busy="true"]')).not.toBeNull();
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.queryByText('Réunions')).toBeNull();
  rerender(<StatsPanel stats={stats} state="unavailable" />);
  expect(screen.getByText('Statistiques indisponibles.')).toBeVisible();
  expect(screen.queryByText('Réunions')).toBeNull();
});

it('MAIR-1222 each statistics card shows its icon and its label in sentence case', () => {
  const { container } = render(<StatsPanel stats={stats} />);
  expect(container.querySelector('.calendar-stats')).not.toBeNull();
  for (const item of stats.items) {
    const card = screen.getByRole('group', { name: item.label });
    expect(card.querySelector('svg')).not.toBeNull();
  }
});

it('MAIR-1256 each type has its own icon: Réunions, Animations, Cérémonies, Autres (any other type: the calendar)', () => {
  render(<StatsPanel stats={stats} />);
  const icons = { Réunions: 'lucide-users', Animations: 'lucide-party-popper', Cérémonies: 'lucide-landmark', Autres: 'lucide-calendar' };
  for (const [label, icon] of Object.entries(icons)) {
    const card = screen.getByRole('group', { name: label });
    expect(card.querySelector('svg')).toHaveClass(icon);
  }
  expect(statIconOf('meeting')).not.toBe(statIconOf('ceremony'));
  expect(statIconOf('unknown')).toBe(statIconOf('other'));
});

it('MAIR-1256 each card carries its type for the calendar-coloured icon chip', () => {
  const { container } = render(<StatsPanel stats={stats} />);
  const cards = [...container.querySelectorAll('[data-category]')];
  expect(cards.map((card) => card.getAttribute('data-category'))).toEqual(['meeting', 'activity', 'ceremony', 'other']);
  // The chip rule of app-overrides.css targets the icon wrapper of the shared card: keep it on the real DOM.
  for (const card of cards) expect(card.querySelector(':scope > span:first-child > span:last-child svg')).not.toBeNull();
});
