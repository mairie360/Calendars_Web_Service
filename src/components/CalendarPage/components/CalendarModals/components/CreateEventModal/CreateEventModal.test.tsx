import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CreateEventModal } from './CreateEventModal';

const people = [
  { id: 'alice', name: 'Alice Dupont', role: 'Communication' },
  { id: 'karim', name: 'Karim Payet', role: 'Logistique' },
];

describe('CreateEventModal component', () => {
  it('does not render when closed', () => {
    render(<CreateEventModal isOpen={false} people={people} onCancel={vi.fn()} onCreate={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('selects assignees and submits the event values', () => {
    const handleCreate = vi.fn();

    render(<CreateEventModal isOpen people={people} onCancel={vi.fn()} onCreate={handleCreate} />);

    fireEvent.change(screen.getByLabelText('Titre'), {
      target: { value: 'Conseil municipal' },
    });
    fireEvent.change(screen.getByLabelText('Date de début'), {
      target: { value: '15-06-2026' },
    });
    expect(screen.getByLabelText('Date de début')).toHaveValue('15-06-2026');
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le calendrier pour Date de début' }));
    expect(screen.getByText('Juin 2026')).toBeInTheDocument();
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Dim')).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: '09 h 00' })).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Heure de début'), {
      target: { value: '09:00' },
    });
    fireEvent.change(screen.getByLabelText('Lieu'), {
      target: { value: 'Salle du conseil' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sélectionner des personnes/i }));
    fireEvent.click(screen.getByRole('option', { name: /Alice Dupont/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(handleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Conseil municipal',
        date: '15-06-2026',
        endDate: '15-06-2026',
        startTime: '09:00',
        location: 'Salle du conseil',
        assigneeIds: ['alice'],
      })
    );
  });

  it('MAIR-926: loads « Enregistrer » while saving, never submits twice and shows a refusal on top of the kept entries', () => {
    const handleCreate = vi.fn();
    const { rerender } = render(<CreateEventModal isOpen people={people} saving onCancel={vi.fn()} onCreate={handleCreate} />);
    expect(screen.queryByText(/Ajouter un nouvel/)).toBeNull();
    const save = screen.getByRole('button', { name: /Enregistrer/ });
    expect(save).toBeDisabled();
    expect(save).toHaveAttribute('aria-busy', 'true');
    fireEvent.submit(save.closest('[role="dialog"]')!.querySelector('form')!);
    expect(handleCreate).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Brouillon gardé' } });
    rerender(<CreateEventModal isOpen people={people} error="Service indisponible" onCancel={vi.fn()} onCreate={handleCreate} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Impossible d’enregistrer');
    expect(screen.getByRole('alert')).toHaveTextContent('Service indisponible');
    expect(screen.getByLabelText('Titre')).toHaveValue('Brouillon gardé');
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeEnabled();
  });

  it('MAIR-926: shows each validation error under its field', () => {
    render(<CreateEventModal isOpen people={people} fieldErrors={{ 'event-title': 'Donnez un titre à l’événement.', 'event-end-time': 'L’heure de fin doit suivre l’heure de début.' }} onCancel={vi.fn()} onCreate={vi.fn()} />);
    expect(screen.getByLabelText('Titre')).toHaveAccessibleDescription('Donnez un titre à l’événement.');
    expect(screen.getByLabelText('Heure de fin')).toHaveAccessibleDescription('L’heure de fin doit suivre l’heure de début.');
    expect(screen.getByText('Les participants reçoivent l’événement dans leur calendrier.')).toBeInTheDocument();
  });

  it('calls onCancel from the close button', () => {
    const handleCancel = vi.fn();

    render(<CreateEventModal isOpen people={people} onCancel={handleCancel} onCreate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
