import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ActiveFilterTags, dateRangeLabel } from './ActiveFilterTags';

const categories = [{ value: 'meeting', label: 'Réunion' }, { value: 'activity', label: 'Animation' }];
const services = [{ value: 'culture', label: 'Culture' }];

it('MAIR-1180: each active filter is a removable tag, with « Effacer les filtres » and the count of the period', async () => {
  const onChange = vi.fn();
  const onClear = vi.fn();
  const year = new Date().getFullYear();
  const { container } = render(<ActiveFilterTags filters={{ from: `${year}-11-24`, to: `${year}-11-30`, categories: ['meeting', 'activity'], service: 'culture' }}
    categories={categories} services={services} shownCount={3} totalCount={12} onChange={onChange} onClear={onClear} />);
  const tags = within(screen.getByRole('list', { name: 'Filtres actifs' })).getAllByRole('listitem');
  expect(tags.map((tag) => tag.textContent)).toEqual([`Du 24 nov. au 30 nov.`, 'Réunion', 'Animation', 'Culture'].map((label) => expect.stringContaining(label)));
  fireEvent.click(screen.getByRole('button', { name: 'Retirer le filtre Réunion' }));
  expect(onChange).toHaveBeenCalledWith({ categories: ['activity'] });
  fireEvent.click(screen.getByRole('button', { name: 'Retirer le filtre Culture' }));
  expect(onChange).toHaveBeenCalledWith({ service: '' });
  fireEvent.click(screen.getByRole('button', { name: /^Retirer le filtre Du/ }));
  expect(onChange).toHaveBeenCalledWith({ from: '', to: '' });
  fireEvent.click(screen.getByRole('button', { name: 'Effacer les filtres' }));
  expect(onClear).toHaveBeenCalled();
  expect(screen.getByText('3 événements sur 12 dans la période')).toBeInTheDocument();
  expect((await axe(container)).violations).toEqual([]);
});

it('MAIR-1180: nothing is shown without filter, and an open range reads « À partir du » / « Jusqu’au »', () => {
  const { container } = render(<ActiveFilterTags filters={{ from: '', to: '', categories: [], service: '' }} categories={categories} services={services}
    shownCount={0} totalCount={0} onChange={vi.fn()} onClear={vi.fn()} />);
  expect(container).toBeEmptyDOMElement();
  const today = new Date(2026, 0, 1);
  expect(dateRangeLabel('2026-11-24', '', today)).toBe('À partir du 24 nov.');
  expect(dateRangeLabel('', '2027-01-05', today)).toBe('Jusqu’au 5 janv. 2027');
});
