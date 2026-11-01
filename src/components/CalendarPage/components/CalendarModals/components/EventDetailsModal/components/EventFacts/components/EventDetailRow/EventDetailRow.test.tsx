import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CalendarDays } from 'lucide-react';

import { EventDetailRow } from './EventDetailRow';

describe('EventDetailRow', () => {
  it('shows a fact or « Non renseigné »', () => {
    const { rerender } = render(<EventDetailRow icon={CalendarDays} label="Lieu" value="Mairie" />);
    expect(screen.getByText('Mairie')).toBeInTheDocument();
    rerender(<EventDetailRow icon={CalendarDays} label="Lieu" />); expect(screen.getByText('Non renseigné')).toBeInTheDocument();
  });
});
