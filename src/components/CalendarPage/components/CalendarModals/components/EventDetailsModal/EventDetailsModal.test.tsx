import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EventDetailsModal } from './EventDetailsModal';

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
  it('MAIR-929: is titled with the event, shows its category pill, description and facts', () => {
    render(<EventDetailsModal isOpen event={event} people={people} categories={[{ value: 'meeting', label: 'Réunion' }]} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Conseil municipal' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Conseil municipal' })).toBeInTheDocument();
    expect(screen.getByText('Réunion').closest('[data-tone]')).toHaveAttribute('data-tone', 'secondary-strong');
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

    expect(screen.getByText('Lundi 15 juin 2026 · chaque semaine (Lun, Mar, Mer, Jeu, Ven) jusqu’au 15 Juillet 2026')).toBeInTheDocument();
  });

  it('edits and saves event details', () => {
    const handleSave = vi.fn();

    render(<EventDetailsModal isOpen event={event} people={people} onClose={vi.fn()} onSave={handleSave} />);

    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));

    expect(screen.getByRole('heading', { name: 'Modifier l’événement' })).toBeInTheDocument();
    expect(screen.getByLabelText('Titre')).toHaveValue('Conseil municipal');
    expect(document.getElementById('event-date')).toHaveAccessibleName('Date de début (obligatoire), lundi 15 juin 2026');

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

  it('MAIR-931: never deletes without confirmation, and a refused deletion comes back to the details', async () => {
    const onDelete = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(<EventDetailsModal isOpen event={event} people={people} canDelete onClose={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
    expect(onDelete).not.toHaveBeenCalled();
    const confirm = screen.getByRole('alertdialog', { name: 'Supprimer cet événement ?' });
    expect(confirm).toHaveTextContent('« Conseil municipal » sera retiré du calendrier. Cette action est définitive.');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la suppression' }));
    expect(onDelete).toHaveBeenCalledWith(event);
    await vi.waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Supprimer' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la suppression' }));
    expect(onDelete).toHaveBeenCalledTimes(2);
  });

  it('MAIR-931: the confirm button loads while the deletion runs', () => {
    const { rerender } = render(<EventDetailsModal isOpen event={event} people={people} canDelete onClose={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
    rerender(<EventDetailsModal isOpen event={event} people={people} canDelete saving onClose={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Confirmer la suppression/ })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
  });
  it('MAIR-1179: a private event shows the « Privé » badge and its visibility line, a public one only the line', () => {
    const { rerender } = render(<EventDetailsModal isOpen event={{ ...event, visibility: 'private' as const }} people={people} categories={[{ value: 'meeting', label: 'Réunion' }]} onClose={vi.fn()} />);
    expect(screen.getByText('Privé')).toBeInTheDocument();
    expect(screen.getByText('Privé · visible seulement par vous et les invités')).toBeInTheDocument();
    rerender(<EventDetailsModal isOpen event={{ ...event, visibility: 'public' as const }} people={people} categories={[{ value: 'meeting', label: 'Réunion' }]} onClose={vi.fn()} />);
    expect(screen.queryByText('Privé')).not.toBeInTheDocument();
    expect(screen.getByText('Public · visible par tous les agents')).toBeInTheDocument();
  });

  it('MAIR-1179: editing keeps the visibility of a private event and saves the new choice', () => {
    const handleSave = vi.fn();
    render(<EventDetailsModal isOpen event={{ ...event, visibility: 'private' as const }} people={people} onClose={vi.fn()} onSave={handleSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    expect(screen.getByRole('radio', { name: /Privé/ })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(handleSave).toHaveBeenLastCalledWith(expect.objectContaining({ visibility: 'private' }));
  });

  it('MAIR-1179: switching a private event to public saves « public »', () => {
    const handleSave = vi.fn();
    render(<EventDetailsModal isOpen event={{ ...event, visibility: 'private' as const }} people={people} onClose={vi.fn()} onSave={handleSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    fireEvent.click(screen.getByRole('radio', { name: /Public/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(handleSave).toHaveBeenLastCalledWith(expect.objectContaining({ visibility: 'public' }));
  });
  it('MAIR-1179: editing an event read without its visibility sends none unless « Privé » is picked', () => {
    const handleSave = vi.fn();
    render(<EventDetailsModal isOpen event={event} people={people} onClose={vi.fn()} onSave={handleSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Conseil municipal modifié' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(handleSave).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Conseil municipal modifié', visibility: undefined }));

    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    fireEvent.click(screen.getByRole('radio', { name: /Privé/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(handleSave).toHaveBeenLastCalledWith(expect.objectContaining({ visibility: 'private' }));
  });
});
