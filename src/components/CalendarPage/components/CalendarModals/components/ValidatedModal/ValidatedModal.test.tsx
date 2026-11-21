import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { ValidatedModal } from './ValidatedModal';

const Form = ({ errors, onSubmit }: { errors: Record<string, string>; onSubmit: (event: React.FormEvent) => void }) => (
  <form onSubmit={onSubmit}>
    <input id="event-title" aria-label="Titre" defaultValue="" />
    <input id="event-date" aria-label="Date de début" defaultValue="16-09-2026" />
    <input id="event-end-date" aria-label="Date de fin" defaultValue="15-09-2026" />
    {Object.entries(errors).map(([id, message]) => <p key={id} data-field={id}>{message}</p>)}
    <button type="submit">Enregistrer</button>
  </form>
);

describe('ValidatedModal', () => {
  it('MAIR-926: blocks an invalid submission, hands every error to its field and focuses the first one', () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    const { container } = render(<ValidatedModal isOpen resetKey="k">{(errors) => <Form errors={errors} onSubmit={onSubmit} />}</ValidatedModal>);
    fireEvent.submit(screen.getByRole('button', { name: 'Enregistrer' }).closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(container.querySelector('[data-field="event-title"]')).toHaveTextContent('Donnez un titre à l’événement.');
    expect(container.querySelector('[data-field="event-end-date"]')).toHaveTextContent('La date de fin doit suivre la date de début.');
    expect(screen.getByLabelText('Titre')).toHaveFocus();

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Conseil' } });
    expect(container.querySelector('[data-field="event-title"]')).toBeNull();
    expect(container.querySelector('[data-field="event-end-date"]')).not.toBeNull();
  });
  it('renders nothing while closed', () => {
    const { container } = render(<ValidatedModal isOpen={false} resetKey="k"><p>x</p></ValidatedModal>);
    expect(container).toBeEmptyDOMElement();
  });
});
