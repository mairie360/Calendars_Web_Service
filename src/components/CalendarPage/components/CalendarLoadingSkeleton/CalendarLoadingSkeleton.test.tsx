import { it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { CalendarLoadingSkeleton } from './CalendarLoadingSkeleton';

it('MAIR-484: the skeleton is busy and decorative, it announces no status of its own', () => {
  const { container } = render(<CalendarLoadingSkeleton className="mt-9" />);
  expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
  expect(container.firstElementChild).toHaveClass('mt-9');
  expect(screen.queryByRole('status')).toBeNull();
  expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
});
