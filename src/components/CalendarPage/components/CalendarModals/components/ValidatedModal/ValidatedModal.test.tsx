import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { ValidatedModal } from './ValidatedModal';

describe('ValidatedModal', () => {
  it('blocks an invalid submission of the wrapped form and announces the first error', () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(<ValidatedModal isOpen resetKey="k"><form onSubmit={onSubmit}><input id="event-title" defaultValue="" /><input id="event-date" defaultValue="" /><button type="submit">Créer</button></form></ValidatedModal>);
    fireEvent.submit(screen.getByRole('button', { name: 'Créer' }).closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled(); expect(screen.getByRole('alert')).toBeInTheDocument();
  });
  it('renders nothing while closed', () => {
    const { container } = render(<ValidatedModal isOpen={false} resetKey="k"><p>x</p></ValidatedModal>);
    expect(container).toBeEmptyDOMElement();
  });
});
