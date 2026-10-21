import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { ValidatedCreateEventModal } from './ValidatedCreateEventModal';
import { defaultEventValues } from '../CreateEventModal';

describe('ValidatedCreateEventModal', () => {
  it('stays closed, then opens the creation dialog with the page feedback', () => {
    const props = { people: [], categories: [{ value: 'meeting', label: 'Réunion' }], initialValues: defaultEventValues({ date: '2026-10-21' }, 'meeting'), title: 'Nouvel événement', subtitle: 'Ajoutez une date.', cancelLabel: 'Annuler', submitLabel: 'Créer', onCancel: vi.fn(), onCreate: vi.fn() };
    const { container, rerender } = render(<ValidatedCreateEventModal isOpen={false} {...props} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ValidatedCreateEventModal isOpen {...props} saving />);
    expect(screen.getByRole('dialog', { name: 'Nouvel événement' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Enregistrement en cours…');
  });
});
