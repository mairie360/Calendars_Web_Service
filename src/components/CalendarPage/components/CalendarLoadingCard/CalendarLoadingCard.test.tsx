import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { CalendarLoadingCard } from './CalendarLoadingCard';

describe('CalendarLoadingCard', () => {
  it('shows the loading card with a skeleton, or the read error without it', () => {
    const { container, rerender } = render(<CalendarLoadingCard />);
    expect(screen.getByRole('status')).toHaveTextContent('Chargement des données du calendrier…'); expect(container.querySelector('.mairie-skeleton')).not.toBeNull();
    rerender(<CalendarLoadingCard readError="API indisponible" />);
    expect(screen.getByRole('alert')).toHaveTextContent('API indisponible'); expect(container.querySelector('.mairie-skeleton')).toBeNull();
  });
});
