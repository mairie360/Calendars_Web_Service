import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
const event = { id: 5, title: 'Conseil municipal', date: '2026-10-21', startTime: '18:00', endTime: '20:00', location: 'Salle du conseil', category: 'meeting', approvalStatus: 'pending' as const, assigneeIds: ['alice'] };

import { ValidatedEventDetailsModal } from './ValidatedEventDetailsModal';

describe('ValidatedEventDetailsModal', () => {
  it('MAIR-929: stays closed without an event, then shows the event titled by it, the page error going to the toasts', () => {
    const props = { people: [], categories: [], closeLabel: 'Fermer', editLabel: 'Modifier', deleteLabel: 'Supprimer', cancelLabel: 'Annuler', saveLabel: 'Enregistrer', onClose: vi.fn() } as unknown as Omit<React.ComponentProps<typeof ValidatedEventDetailsModal>, 'isOpen' | 'event' | 'error'>;
    const { container, rerender } = render(<ValidatedEventDetailsModal isOpen={false} event={null as never} {...props} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ValidatedEventDetailsModal isOpen event={event as never} error="Refusé" {...props} />);
    expect(screen.getByRole('dialog', { name: 'Conseil municipal' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull(); expect(screen.queryByText('Refusé')).toBeNull();
    rerender(<ValidatedEventDetailsModal isOpen event={event as never} saving {...props} />);
    expect(screen.queryByText('Enregistrement en cours…')).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Conseil municipal' }).closest('fieldset')).toHaveAttribute('aria-busy', 'true');
  });
});
