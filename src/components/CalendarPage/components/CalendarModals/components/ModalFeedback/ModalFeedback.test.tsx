import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { ModalFeedback } from './ModalFeedback';

describe('ModalFeedback', () => {
  it('keeps the subtitle and announces a pending save or a refusal', () => {
    const { rerender } = render(<ModalFeedback subtitle="Sous-titre" />);
    expect(screen.getByText('Sous-titre')).toBeInTheDocument(); expect(screen.queryByRole('status')).toBeNull();
    rerender(<ModalFeedback subtitle="Sous-titre" saving />); expect(screen.getByRole('status')).toHaveTextContent('Enregistrement en cours…');
    rerender(<ModalFeedback subtitle="Sous-titre" error="Refusé" />); expect(screen.getByRole('alert')).toHaveTextContent('Refusé');
  });
});
