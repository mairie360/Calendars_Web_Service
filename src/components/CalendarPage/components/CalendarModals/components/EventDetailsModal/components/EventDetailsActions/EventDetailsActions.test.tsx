import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
const event = { id: 5, title: 'Conseil municipal', date: '2026-10-21', startTime: '18:00', endTime: '20:00', location: 'Salle du conseil', category: 'meeting', approvalStatus: 'pending' as const, assigneeIds: ['alice'] };

import { EventApprovalActions, EventDetailsActions } from './EventDetailsActions';

const labels = { close: 'Fermer', edit: 'Modifier', delete: 'Supprimer', approve: 'Valider', reject: 'Refuser' };

describe('EventDetailsActions', () => {
  it('MAIR-929: « Supprimer » on the left, « Fermer » then « Modifier » on the right, only when allowed', () => {
    const handlers = { onClose: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() };
    const { container, rerender } = render(<EventDetailsActions event={event} labels={labels} showValidation canDelete canEdit {...handlers} />);
    const [left, right] = [...container.firstElementChild!.children];
    expect([...left.querySelectorAll('button')].map(button => button.textContent)).toEqual(['Supprimer']);
    expect([...right.querySelectorAll('button')].map(button => button.textContent)).toEqual(['Fermer', 'Modifier']);
    for (const name of ['Fermer', 'Supprimer', 'Modifier']) fireEvent.click(screen.getByRole('button', { name }));
    expect(handlers.onClose).toHaveBeenCalled(); expect(handlers.onEdit).toHaveBeenCalled(); expect(handlers.onDelete).toHaveBeenCalledWith(event);
    rerender(<EventDetailsActions event={event} labels={labels} showValidation={false} canDelete={false} canEdit={false} {...handlers} />);
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['Fermer']);
  });
  it('keeps approve / reject for pending events, outside the footer', () => {
    const onApprove = vi.fn(); const onReject = vi.fn();
    const { rerender } = render(<EventApprovalActions event={event} labels={labels} showValidation onApprove={onApprove} onReject={onReject} />);
    expect(screen.getByRole('group', { name: 'Validation de l’événement' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Refuser' })); fireEvent.click(screen.getByRole('button', { name: 'Valider' }));
    expect(onReject).toHaveBeenCalledWith(event); expect(onApprove).toHaveBeenCalledWith(event);
    rerender(<EventApprovalActions event={event} labels={labels} showValidation={false} onApprove={onApprove} onReject={onReject} />);
    expect(screen.queryByRole('group')).toBeNull();
  });
});
