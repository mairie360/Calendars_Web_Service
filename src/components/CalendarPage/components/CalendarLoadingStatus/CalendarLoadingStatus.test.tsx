import { it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { CalendarLoadingStatus } from './CalendarLoadingStatus';

it('MAIR-484: the status region is mounted empty and only its text changes while loading (RGAA 7.5)', () => {
  const { rerender } = render(<CalendarLoadingStatus state="default" />);
  const region = screen.getByRole('status');
  expect(region).toHaveTextContent('');
  expect(region).toHaveAttribute('aria-live', 'polite');
  rerender(<CalendarLoadingStatus state="loading" />);
  expect(screen.getByRole('status')).toBe(region);
  expect(region).toHaveTextContent('Chargement des données du calendrier…');
  rerender(<CalendarLoadingStatus state="unavailable" />);
  expect(screen.getByRole('status')).toBe(region);
  expect(region).toHaveTextContent('');
});
