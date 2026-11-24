import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { NoMatchingEvents } from './NoMatchingEvents';

it('MAIR-1180: the empty state of the filters offers « Effacer les filtres »', async () => {
  const onClear = vi.fn();
  const { container } = render(<NoMatchingEvents onClear={onClear} />);
  expect(screen.getByText('Aucun événement ne correspond aux filtres')).toBeInTheDocument();
  expect(screen.getByText(/Modifiez la date, le type ou le service/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Effacer les filtres' }));
  expect(onClear).toHaveBeenCalled();
  expect((await axe(container)).violations).toEqual([]);
});
