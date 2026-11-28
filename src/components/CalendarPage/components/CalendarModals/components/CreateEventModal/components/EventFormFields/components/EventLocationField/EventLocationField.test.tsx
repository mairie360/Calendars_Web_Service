import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EventLocationField } from './EventLocationField';

describe('EventLocationField', () => {
  it('reports the place with its historical id', () => {
    const onChange = vi.fn();
    render(<EventLocationField value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Lieu'), { target: { value: 'Salle' } });
    expect(onChange).toHaveBeenCalledWith('Salle'); expect(document.getElementById('event-location')).not.toBeNull();
  });

  it('MAIR-1256 suggests « Salle du conseil » as the place, as the artifact', () => {
    render(<EventLocationField value="" onChange={() => undefined} />);
    expect(screen.getByLabelText('Lieu')).toHaveAttribute('placeholder', 'Salle du conseil');
  });
});
