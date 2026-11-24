import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
const event = { id: 5, title: 'Conseil municipal', date: '2026-11-12', startTime: '18:00', endTime: '20:00', location: 'Salle du conseil', category: 'meeting', assignees: [{ id: 1, name: 'Alice Martin' }, { id: 2, name: 'Paul Roux' }] };

import { EventFacts, eventDateWithRecurrence } from './EventFacts';

describe('EventFacts', () => {
  it('MAIR-929: lists Date, Horaire, Lieu and Participants with their icons', () => {
    const { container } = render(<EventFacts event={event} />);
    expect(screen.getAllByRole('term').map(term => term.textContent)).toEqual(['Date', 'Horaire', 'Lieu', 'Participants']);
    expect(screen.getByText('Jeudi 12 novembre 2026')).toBeVisible();
    expect(screen.getByText('18:00 – 20:00')).toBeVisible();
    expect(screen.getByText('Salle du conseil')).toBeVisible();
    expect(screen.getByText('Alice Martin, Paul Roux')).toBeVisible();
    expect(container.querySelectorAll('svg')).toHaveLength(4);
  });
  it('MAIR-929: the date carries the recurrence and missing facts read « Non renseigné » / « Aucun participant »', () => {
    expect(eventDateWithRecurrence({ ...event, recurrence: { frequency: 'monthly', interval: 1 } })).toBe('Jeudi 12 novembre 2026 · chaque mois');
    render(<EventFacts event={{ id: 6, title: 'Vide', date: '2026-11-12' }} assignees={[]} />);
    expect(screen.getAllByText('Non renseigné')).toHaveLength(2);
    expect(screen.getByText('Aucun participant')).toBeVisible();
  });
});
