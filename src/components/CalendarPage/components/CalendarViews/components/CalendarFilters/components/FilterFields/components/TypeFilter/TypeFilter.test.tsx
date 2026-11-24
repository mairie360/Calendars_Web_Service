import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { TypeFilter, typeFilterSummary } from './TypeFilter';

const options = [{ value: 'meeting', label: 'Réunion' }, { value: 'activity', label: 'Animation' }, { value: 'other', label: 'Autre' }];

it('MAIR-1180: the type menu opens a checkbox list with the category dots and keeps the option order', async () => {
  const onChange = vi.fn();
  const { container } = render(<TypeFilter id="type" options={options} value={['other']} onChange={onChange} />);
  const trigger = screen.getByRole('button', { name: 'Type : Autre' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const group = screen.getByRole('group', { name: 'Types d’événement' });
  expect(group.querySelectorAll('[data-tone]')).toHaveLength(3);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Réunion' }));
  expect(onChange).toHaveBeenCalledWith(['meeting', 'other']);
  expect((await axe(container)).violations).toEqual([]);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(trigger).toHaveFocus();
});

it('MAIR-1180: the list variant shows the types in a fieldset and the summary names the choice', async () => {
  const onChange = vi.fn();
  const { container } = render(<TypeFilter id="type" variant="list" options={options} value={['meeting', 'activity']} onChange={onChange} />);
  expect(screen.getByRole('group', { name: 'Type' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Animation' }));
  expect(onChange).toHaveBeenCalledWith(['meeting']);
  expect(typeFilterSummary(options, [])).toBe('Tous les types');
  expect(typeFilterSummary(options, ['activity'])).toBe('Animation');
  expect(typeFilterSummary(options, ['activity', 'other'])).toBe('2 types');
  expect((await axe(container)).violations).toEqual([]);
});
