import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { EventRecurrenceFields, RecurrenceFrequencyField } from './EventRecurrenceFields';

describe('EventRecurrenceFields', () => {
  it('offers the recurrence controls by frequency', () => {
    const onRecurrence = vi.fn();
    const none = { frequency: 'none' as const, interval: 1, daysOfWeek: [], endsOn: '' };
    const { container, rerender } = render(<><RecurrenceFrequencyField recurrence={none} onChange={onRecurrence} /><EventRecurrenceFields recurrence={none} onChange={onRecurrence} /></>);
    expect(within(screen.getByLabelText('Récurrence')).getAllByRole('option')).toHaveLength(4);
    expect(screen.queryByLabelText('Intervalle')).toBeNull();
    fireEvent.change(screen.getByLabelText('Récurrence'), { target: { value: 'weekly' } });
    expect(onRecurrence).toHaveBeenCalledWith('frequency', 'weekly');
    const weekly = { frequency: 'weekly' as const, interval: 1, daysOfWeek: [1], endsOn: '' };
    rerender(<><RecurrenceFrequencyField recurrence={weekly} onChange={onRecurrence} /><EventRecurrenceFields recurrence={weekly} onChange={onRecurrence} /></>);
    expect(screen.getByLabelText('Intervalle')).toBeInTheDocument(); expect(container.querySelector('#event-recurrence-end')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mar' }));
    expect(onRecurrence).toHaveBeenCalledWith('daysOfWeek', [1, 2]);
  });
});
