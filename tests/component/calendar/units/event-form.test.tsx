import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import {
  EventTitleFields, EventLocationField, EventDateRange, EventTimeRange, EventCategoryField, EventRecurrenceFields, RecurrenceDayPicker, EventFormFields,
  categoryChoices, defaultEventValues, submittedEventValues, timeOptions, toggleDay,
} from '@/components/calendar';

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

describe('event form field groups', () => {
  it('reports each text field with its historical id', () => {
    const onTitle = vi.fn(); const onDescription = vi.fn(); const onLocation = vi.fn();
    render(<><EventTitleFields title="" description="" onTitle={onTitle} onDescription={onDescription} /><EventLocationField value="" onChange={onLocation} /></>);
    fireEvent.change(screen.getByLabelText(/Titre/), { target: { value: 'Conseil' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Ordre du jour' } });
    fireEvent.change(screen.getByLabelText('Lieu'), { target: { value: 'Salle' } });
    expect([onTitle.mock.calls[0][0], onDescription.mock.calls[0][0], onLocation.mock.calls[0][0]]).toEqual(['Conseil', 'Ordre du jour', 'Salle']);
    expect(document.getElementById('event-title')).toBeRequired();
  });
  it('picks start / end dates and times', () => {
    const onStart = vi.fn();
    render(<><EventDateRange date="2026-10-21" endDate="" onDate={() => undefined} onEndDate={() => undefined} /><EventTimeRange startTime="" endTime="" onStart={onStart} onEnd={() => undefined} /></>);
    expect(document.getElementById('event-date')).not.toBeNull(); expect(document.getElementById('event-end-date')).not.toBeNull();
    fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '09:30' } });
    expect(onStart).toHaveBeenCalledWith('09:30');
  });
  it('offers the categories and the recurrence controls by frequency', () => {
    const onCategory = vi.fn(); const onRecurrence = vi.fn();
    const { rerender } = render(<EventCategoryField categories={[{ value: '', label: 'Choisir' }, { value: 'meeting', label: 'Réunion' }]} value="" onChange={onCategory} />);
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: 'meeting' } }); expect(onCategory).toHaveBeenCalledWith('meeting');
    rerender(<EventRecurrenceFields recurrence={{ frequency: 'none', interval: 1, daysOfWeek: [], endsOn: '' }} onChange={onRecurrence} />);
    expect(within(screen.getByLabelText('Récurrence')).getAllByRole('option')).toHaveLength(4);
    expect(screen.queryByLabelText('Intervalle')).toBeNull();
    rerender(<EventRecurrenceFields recurrence={{ frequency: 'weekly', interval: 1, daysOfWeek: [1], endsOn: '' }} onChange={onRecurrence} />);
    expect(screen.getByLabelText('Intervalle')).toBeInTheDocument(); expect(document.getElementById('event-recurrence-end')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mar' }));
    expect(onRecurrence).toHaveBeenCalledWith('daysOfWeek', [1, 2]);
  });
  it('marks the picked recurrence days as pressed', () => {
    const onToggle = vi.fn();
    render(<RecurrenceDayPicker selected={[0]} onToggle={onToggle} />);
    expect(screen.getByRole('button', { name: 'Dim' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Ven' })); expect(onToggle).toHaveBeenCalledWith(5);
  });
  it('composes every field in the Figma order', () => {
    const values = defaultEventValues({ date: '2026-10-21' }, 'meeting');
    render(<EventFormFields values={values} people={[]} categories={[{ value: 'meeting', label: 'Réunion' }]} canRecur update={vi.fn()} updateRecurrence={vi.fn()} />);
    const ids = Array.from(document.querySelectorAll('[id^="event-"]')).map((node) => node.id);
    expect(ids.indexOf('event-title')).toBeLessThan(ids.indexOf('event-date'));
    expect(ids.indexOf('event-category')).toBeLessThan(ids.indexOf('event-recurrence'));
    expect(ids.indexOf('event-start-time')).toBeLessThan(ids.indexOf('event-location'));
  });
});
