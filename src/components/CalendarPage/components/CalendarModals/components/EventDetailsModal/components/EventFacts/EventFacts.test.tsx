import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
const event = { id: 5, title: 'Conseil municipal', date: '2026-10-21', startTime: '18:00', endTime: '20:00', location: 'Salle du conseil', category: 'meeting', approvalStatus: 'pending' as const, assigneeIds: ['alice'] };

import { EventFacts, approvalStatusLabels } from './EventFacts';

describe('EventFacts', () => {
  it('lists date, time, category, validation, place and recurrence', () => {
    render(<EventFacts event={event as never} categoryLabel="Réunion" />);
    for (const label of ['Date', 'Horaire', 'Catégorie', 'Validation', 'Lieu', 'Récurrence']) expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(approvalStatusLabels.pending)).toBeInTheDocument(); expect(screen.getByText('Réunion')).toBeInTheDocument();
  });
});
