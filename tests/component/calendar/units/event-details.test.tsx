import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { CalendarDays } from 'lucide-react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EventDetailRow, EventFacts, EventAssigneesList, EventDetailsActions, approvalStatusLabels, eventValues, selectedAssignees } from '@/components/calendar';

const event = { id: 5, title: 'Conseil municipal', date: '2026-10-21', startTime: '18:00', endTime: '20:00', location: 'Salle du conseil', category: 'meeting', approvalStatus: 'pending' as const, assigneeIds: ['alice'] };
const labels = { close: 'Fermer', edit: 'Modifier', delete: 'Supprimer', approve: 'Valider', reject: 'Refuser' };

describe('event details parts (MAIR-608)', () => {
  it('shows a fact or « Non renseigné »', () => {
    const { rerender } = render(<EventDetailRow icon={CalendarDays} label="Lieu" value="Mairie" />);
    expect(screen.getByText('Mairie')).toBeInTheDocument();
    rerender(<EventDetailRow icon={CalendarDays} label="Lieu" />); expect(screen.getByText('Non renseigné')).toBeInTheDocument();
  });
  it('lists date, time, category, validation, place and recurrence', () => {
    render(<EventFacts event={event as never} categoryLabel="Réunion" />);
    for (const label of ['Date', 'Horaire', 'Catégorie', 'Validation', 'Lieu', 'Récurrence']) expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(approvalStatusLabels.pending)).toBeInTheDocument(); expect(screen.getByText('Réunion')).toBeInTheDocument();
  });
  it('lists the assignees or says nobody is assigned', () => {
    const people = [{ id: 'alice', name: 'Alice Dupont' }, { id: 'karim', name: 'Karim Payet' }];
    expect(selectedAssignees(people as never, ['alice', 'nobody'])).toEqual([people[0]]);
    expect(eventValues(event as never).assigneeIds).toEqual(['alice']);
    const { rerender } = render(<EventAssigneesList assignees={[people[0]] as never} />);
    expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
    rerender(<EventAssigneesList assignees={[]} />); expect(screen.getByText('Aucune personne assignée')).toBeInTheDocument();
  });
  it('shows only the allowed actions and delegates them', () => {
    const handlers = { onClose: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), onApprove: vi.fn(), onReject: vi.fn() };
    const { rerender } = render(<EventDetailsActions event={event as never} labels={labels} showValidation canDelete canEdit {...handlers} />);
    for (const name of ['Fermer', 'Refuser', 'Valider', 'Supprimer', 'Modifier']) fireEvent.click(screen.getByRole('button', { name }));
    expect(handlers.onClose).toHaveBeenCalled(); expect(handlers.onEdit).toHaveBeenCalled();
    expect(handlers.onApprove).toHaveBeenCalledWith(event); expect(handlers.onReject).toHaveBeenCalledWith(event); expect(handlers.onDelete).toHaveBeenCalledWith(event);
    rerender(<EventDetailsActions event={event as never} labels={labels} showValidation={false} canDelete={false} canEdit={false} {...handlers} />);
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['Fermer']);
  });
});
