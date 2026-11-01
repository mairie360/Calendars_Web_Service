import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { categoryChoices, defaultEventValues, submittedEventValues, timeOptions, toggleDay } from './event-form-values';

describe('event form values (MAIR-608)', () => {
  it('builds a normalised draft, submits the start as default end and drops a disallowed recurrence', () => {
    const draft = defaultEventValues({ title: 'Conseil', date: '2026-10-21' }, 'meeting');
    expect(draft).toMatchObject({ title: 'Conseil', category: 'meeting', assigneeIds: [], recurrence: { frequency: 'none', interval: 1 } });
    const recurring = { ...draft, recurrence: { frequency: 'weekly' as const, interval: 2, daysOfWeek: [1], endsOn: '2026-12-01' } };
    expect(submittedEventValues(recurring, true)).toMatchObject({ endDate: draft.date, recurrence: { frequency: 'weekly', interval: 2 } });
    expect(submittedEventValues(recurring, false).recurrence.frequency).toBe('none');
  });
  it('lists 96 quarter-hour times, sorts toggled days and treats an empty first category as the placeholder', () => {
    expect(timeOptions).toHaveLength(96); expect(timeOptions[33]).toEqual({ value: '08:15', label: '08 h 15' });
    expect(toggleDay([3, 1], 2)).toEqual([3, 1, 2].sort((a, b) => a - b)); expect(toggleDay([1, 2], 1)).toEqual([2]);
    expect(categoryChoices([{ value: '', label: 'Sélectionner une catégorie' }, { value: 'meeting', label: 'Réunion' }])).toEqual({ placeholder: 'Sélectionner une catégorie', options: [{ value: 'meeting', label: 'Réunion' }] });
    expect(categoryChoices([{ value: 'meeting', label: 'Réunion' }]).placeholder).toBeNull();
  });
});
