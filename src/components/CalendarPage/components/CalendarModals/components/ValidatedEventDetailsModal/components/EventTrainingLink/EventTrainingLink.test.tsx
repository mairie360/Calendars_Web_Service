import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { EventTrainingLink, trainingDestination } from './EventTrainingLink';

describe('EventTrainingLink', () => {
  it('shows nothing without a source, the training link once found, an alert on failure', async () => {
    const { container, rerender } = render(<EventTrainingLink eventId="5" baseUrl="https://training.example/" />);
    expect(container).toBeEmptyDOMElement();
    rerender(<EventTrainingLink eventId="5" baseUrl="https://training.example/" source={{ find: async () => ({ id: 'c1', title: 'RGPD' }) }} />);
    await waitFor(() => expect(screen.getByRole('link', { name: 'Ouvrir la formation' })).toHaveAttribute('href', 'https://training.example/?course=c1'));
    rerender(<EventTrainingLink eventId="6" baseUrl="https://training.example/" source={{ find: async () => { throw new Error('Indisponible'); } }} />);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Indisponible'));
    expect(trainingDestination(undefined, { id: 'c1', title: 'RGPD' })).toBeUndefined();
  });
});
