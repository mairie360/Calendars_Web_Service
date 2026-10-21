import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EventDetailsModal } from '@/components/calendar/EventDetailsModal';

const people = [
  { id: 'alice', name: 'Alice Dupont', role: 'Communication' },
  { id: 'karim', name: 'Karim Payet', role: 'Logistique' },
];

const event = {
  id: 'event-1',
  title: 'Conseil municipal',
  description: 'Préparer la séance',
  date: '2026-06-15',
  category: 'meeting',
  startTime: '09:00',
  endTime: '10:30',
  location: 'Salle du conseil',
  assigneeIds: ['alice'],
};

describe('EventDetailsModal component', () => {
  it('displays event details', () => {
    render(<EventDetailsModal isOpen event={event} people={people} onClose={vi.fn()} />);

    expect(screen.getByText('Conseil municipal')).toBeInTheDocument();
    expect(screen.getByText('Préparer la séance')).toBeInTheDocument();
    expect(screen.getByText('Salle du conseil')).toBeInTheDocument();
    expect(screen.getByText('09:00 – 10:30')).toBeInTheDocument();
    expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
  });

  it('displays full recurrence labels without shortening the text', () => {
    render(
      <EventDetailsModal
        isOpen
        event={{
          ...event,
          recurrence: {
            frequency: 'weekly',
            interval: 1,
            daysOfWeek: [1, 2, 3, 4, 5],
            endsOn: '2026-07-15',
          },
        }}
        people={people}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Chaque semaine (Lun, Mar, Mer, Jeu, Ven) jusqu’au 15 Juillet 2026')).toBeInTheDocument();
  });

  it('edits and saves event details', () => {
    const handleSave = vi.fn();

    render(<EventDetailsModal isOpen event={event} people={people} onClose={vi.fn()} onSave={handleSave} />);

    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));

    expect(screen.getByRole('heading', { name: 'Modifier l’événement' })).toBeInTheDocument();
    expect(screen.getByLabelText('Titre')).toHaveValue('Conseil municipal');
    expect(screen.getByLabelText('Date de début')).toHaveValue('15-06-2026');

    fireEvent.change(screen.getByLabelText('Titre'), {
      target: { value: 'Conseil municipal modifié' },
    });
    fireEvent.change(screen.getByLabelText('Lieu'), {
      target: { value: 'Grande salle' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'event-1',
        title: 'Conseil municipal modifié',
        date: '15-06-2026',
        endDate: '15-06-2026',
        location: 'Grande salle',
        assigneeIds: ['alice'],
      })
    );
  });

  it('keeps the edit form open when the selected event object is recreated', () => {
    const handleSave = vi.fn();
    const { rerender } = render(
      <EventDetailsModal isOpen event={event} people={people} onClose={vi.fn()} onSave={handleSave} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument();

    rerender(
      <EventDetailsModal isOpen event={{ ...event }} people={people} onClose={vi.fn()} onSave={handleSave} />
    );

    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument();
    expect(screen.getByLabelText('Titre')).toHaveValue('Conseil municipal');
  });

  it('edits event assignees from the details modal', () => {
    const handleSave = vi.fn();

    render(<EventDetailsModal isOpen event={event} people={people} onClose={vi.fn()} onSave={handleSave} />);

    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    fireEvent.click(screen.getByRole('button', { name: /1 personne sélectionnée/i }));
    fireEvent.click(screen.getByRole('option', { name: /Karim Payet/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        assigneeIds: ['alice', 'karim'],
        assignees: [people[0], people[1]],
      })
    );
  });
});
