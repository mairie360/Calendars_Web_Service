import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CalendarStatusBar } from './CalendarStatusBar';

describe('CalendarStatusBar', () => {
  it('renders nothing when idle, then errors, progress and the read retry', () => {
    const onRetry = vi.fn();
    const { container, rerender } = render(<CalendarStatusBar readError={null} mutationError={null} loading={false} saving={false} onRetry={onRetry} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<CalendarStatusBar readError="API indisponible" mutationError="Refus" loading={false} saving onRetry={onRetry} />);
    expect(screen.getAllByRole('alert').map((node) => node.textContent)).toEqual(['Calendrier : API indisponible', 'Enregistrement : Refus']);
    expect(screen.getByRole('status')).toHaveTextContent('Enregistrement en cours…');
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' })); expect(onRetry).toHaveBeenCalled();
  });
});
