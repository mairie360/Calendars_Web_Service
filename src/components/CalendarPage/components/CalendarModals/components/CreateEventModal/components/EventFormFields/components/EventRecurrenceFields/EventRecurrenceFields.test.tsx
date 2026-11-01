import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { EventRecurrenceFields } from './EventRecurrenceFields';

describe('EventRecurrenceFields', () => {
  it('offers the recurrence controls by frequency', () => {
    const onRecurrence = vi.fn();
    const { rerender } = render(<EventRecurrenceFields recurrence={{ frequency: 'none', interval: 1, daysOfWeek: [], endsOn: '' }} onChange={onRecurrence} />);
    expect(within(screen.getByLabelText('Récurrence')).getAllByRole('option')).toHaveLength(4);
    expect(screen.queryByLabelText('Intervalle')).toBeNull();
    rerender(<EventRecurrenceFields recurrence={{ frequency: 'weekly', interval: 1, daysOfWeek: [1], endsOn: '' }} onChange={onRecurrence} />);
    expect(screen.getByLabelText('Intervalle')).toBeInTheDocument(); expect(document.getElementById('event-recurrence-end')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mar' }));
    expect(onRecurrence).toHaveBeenCalledWith('daysOfWeek', [1, 2]);
  });
});
