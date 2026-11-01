import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
const event = { id: 5, title: 'Conseil municipal', date: '2026-10-21', startTime: '18:00', endTime: '20:00', location: 'Salle du conseil', category: 'meeting', approvalStatus: 'pending' as const, assigneeIds: ['alice'] };

import { EventDetailsActions } from './EventDetailsActions';

const labels = { close: 'Fermer', edit: 'Modifier', delete: 'Supprimer', approve: 'Valider', reject: 'Refuser' };

describe('EventDetailsActions', () => {
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
