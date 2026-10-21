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

    fireEvent.click(screen.getByRole('button', { name: 'Créer l’événement' }));

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

  it('calls onCancel from the close button', () => {
    const handleCancel = vi.fn();

    render(<CreateEventModal isOpen people={people} onCancel={handleCancel} onCreate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
