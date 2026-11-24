import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { FilterFields } from './FilterFields';

const categories = [{ value: 'meeting', label: 'Réunion' }, { value: 'activity', label: 'Animation' }];
const services = [{ value: 'direction', label: 'Direction générale' }, { value: 'culture', label: 'Culture' }];
const noFilter = { from: '', to: '', categories: [], service: '' };

it('MAIR-1180: the bar holds « Du », « Au », « Type » and « Service » starting with « Tous les services »', async () => {
  const onChange = vi.fn();
  const { container } = render(<FilterFields idPrefix="f" filters={noFilter} categories={categories} services={services} onChange={onChange} />);
  expect(screen.getByText('Du')).toBeInTheDocument();
  expect(screen.getByText('Au')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Type : Tous les types' })).toBeInTheDocument();
  const service = screen.getByRole('combobox', { name: 'Service' });
  expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Tous les services', 'Direction générale', 'Culture']);
  fireEvent.change(service, { target: { value: 'culture' } });
  expect(onChange).toHaveBeenCalledWith({ service: 'culture' });
  expect((await axe(container)).violations).toEqual([]);
});

it('MAIR-1180: the drawer layout lists the type checkboxes', () => {
  const onChange = vi.fn();
  render(<FilterFields idPrefix="d" layout="drawer" filters={{ ...noFilter, categories: ['meeting'] }} categories={categories} services={services} onChange={onChange} />);
  expect(screen.getByRole('checkbox', { name: 'Réunion' })).toBeChecked();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Animation' }));
  expect(onChange).toHaveBeenCalledWith({ categories: ['meeting', 'activity'] });
});
