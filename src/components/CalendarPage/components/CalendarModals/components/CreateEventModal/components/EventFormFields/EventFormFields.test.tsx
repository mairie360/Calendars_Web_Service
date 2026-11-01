import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render } from '@testing-library/react';

import { EventFormFields } from './EventFormFields';
import { defaultEventValues } from '../../event-form-values';

describe('EventFormFields', () => {
  it('composes every field in the Figma order', () => {
    const values = defaultEventValues({ date: '2026-10-21' }, 'meeting');
    render(<EventFormFields values={values} people={[]} categories={[{ value: 'meeting', label: 'Réunion' }]} canRecur update={vi.fn()} updateRecurrence={vi.fn()} />);
    const ids = Array.from(document.querySelectorAll('[id^="event-"]')).map((node) => node.id);
    expect(ids.indexOf('event-title')).toBeLessThan(ids.indexOf('event-date'));
    expect(ids.indexOf('event-category')).toBeLessThan(ids.indexOf('event-recurrence'));
    expect(ids.indexOf('event-start-time')).toBeLessThan(ids.indexOf('event-location'));
  });
});
