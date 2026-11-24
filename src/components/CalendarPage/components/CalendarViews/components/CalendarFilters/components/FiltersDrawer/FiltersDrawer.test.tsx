import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { FiltersDrawer } from './FiltersDrawer';

it('MAIR-1180: « Filtres » shows the active count and opens a drawer with « Effacer les filtres » and « Voir N événements »', async () => {
  const onClear = vi.fn();
  const { baseElement } = render(<FiltersDrawer activeCount={2} shownCount={4} onClear={onClear}><p>Champs</p></FiltersDrawer>);
  fireEvent.click(screen.getByRole('button', { name: 'Filtres, 2 actifs' }));
  const drawer = screen.getByRole('dialog', { name: 'Filtres' });
  expect(within(drawer).getByText('Champs')).toBeInTheDocument();
  fireEvent.click(within(drawer).getByRole('button', { name: 'Effacer les filtres' }));
  expect(onClear).toHaveBeenCalled();
  expect((await axe(baseElement)).violations).toEqual([]);
  fireEvent.click(within(drawer).getByRole('button', { name: 'Voir 4 événements' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('MAIR-1180: without active filter the button has no count and « Effacer les filtres » is disabled', () => {
  render(<FiltersDrawer activeCount={0} shownCount={1} onClear={vi.fn()}><p>Champs</p></FiltersDrawer>);
  fireEvent.click(screen.getByRole('button', { name: 'Filtres' }));
  const drawer = screen.getByRole('dialog', { name: 'Filtres' });
  expect(within(drawer).getByRole('button', { name: 'Effacer les filtres' })).toBeDisabled();
  expect(within(drawer).getByRole('button', { name: 'Voir 1 événement' })).toBeInTheDocument();
});
