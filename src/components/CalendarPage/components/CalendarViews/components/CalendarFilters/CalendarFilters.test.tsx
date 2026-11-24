import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { CalendarFilters } from './CalendarFilters';

const categories = [{ value: 'meeting', label: 'Réunion' }];
const services = [{ value: 'culture', label: 'Culture' }];

it('MAIR-1180: the filter bar is a search region with the fields, the mobile « Filtres » button and the active tags', async () => {
  const { container } = render(<CalendarFilters filters={{ from: '', to: '', categories: ['meeting'], service: '' }} categories={categories} services={services}
    activeCount={1} shownCount={2} totalCount={5} onChange={vi.fn()} onClear={vi.fn()} />);
  expect(screen.getByRole('search', { name: 'Filtrer les événements' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Type : Réunion' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Filtres, 1 actif' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Retirer le filtre Réunion' })).toBeInTheDocument();
  expect(screen.getByText('2 événements sur 5 dans la période')).toBeInTheDocument();
  expect((await axe(container)).violations).toEqual([]);
});
