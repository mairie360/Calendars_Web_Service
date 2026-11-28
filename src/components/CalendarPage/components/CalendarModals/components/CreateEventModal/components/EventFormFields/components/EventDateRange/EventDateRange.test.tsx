import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EventDateRange, fromIsoDate, toIsoDate } from './EventDateRange';
import { pickDate } from '@tests/component/pick-date';

describe('EventDateRange', () => {
  it('offers the start and end dates', () => {
    render(<EventDateRange date="2026-10-21" endDate="" onDate={() => undefined} onEndDate={() => undefined} />);
    expect(document.getElementById('event-date')).not.toBeNull(); expect(document.getElementById('event-end-date')).not.toBeNull();
  });

  it('MAIR-1256 shows the dates written in full on the lib DatePicker, the start marked required, with a clear button', () => {
    render(<EventDateRange date="12-11-2026" endDate="13-11-2026" onDate={() => undefined} onEndDate={() => undefined} />);
    expect(document.getElementById('event-date')).toHaveAccessibleName('Date de début (obligatoire), jeudi 12 novembre 2026');
    expect(document.getElementById('event-end-date')).toHaveAccessibleName('Date de fin, vendredi 13 novembre 2026');
    expect(screen.getByText('jeudi 12 novembre 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Effacer la date « Date de début »' })).toBeInTheDocument();
    // The validated wrapper reads the server values from the hidden fields.
    expect(document.querySelector('input[data-field="event-date"]')).toHaveValue('12-11-2026');
    expect(document.querySelector('input[data-field="event-end-date"]')).toHaveValue('13-11-2026');
  });

  it('MAIR-1256 a picked start fills an empty end, and moves an earlier end, with the same day', () => {
    const onDate = vi.fn(); const onEndDate = vi.fn();
    const { rerender } = render(<EventDateRange date="" endDate="" onDate={onDate} onEndDate={onEndDate} />);
    pickDate('event-date', '2026-11-12');
    expect(onDate).toHaveBeenCalledWith('12-11-2026'); expect(onEndDate).toHaveBeenCalledWith('12-11-2026');
    onDate.mockClear(); onEndDate.mockClear();
    rerender(<EventDateRange date="12-11-2026" endDate="10-11-2026" onDate={onDate} onEndDate={onEndDate} />);
    pickDate('event-date', '2026-11-14');
    expect(onEndDate).toHaveBeenCalledWith('14-11-2026');
  });

  it('MAIR-1256 a picked start keeps a later end, and clearing the start empties it', () => {
    const onDate = vi.fn(); const onEndDate = vi.fn();
    render(<EventDateRange date="12-11-2026" endDate="20-11-2026" onDate={onDate} onEndDate={onEndDate} />);
    pickDate('event-date', '2026-11-13');
    expect(onDate).toHaveBeenCalledWith('13-11-2026'); expect(onEndDate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Effacer la date « Date de début »' }));
    expect(onDate).toHaveBeenLastCalledWith('');
  });

  it('MAIR-1256 converts between the server « DD-MM-YYYY » and the picker ISO day', () => {
    expect(toIsoDate('12-11-2026')).toBe('2026-11-12'); expect(toIsoDate('2026-11-12')).toBe('2026-11-12');
    expect(toIsoDate('')).toBeNull(); expect(toIsoDate('12/11/2026')).toBeNull();
    expect(fromIsoDate('2026-11-12')).toBe('12-11-2026'); expect(fromIsoDate(null)).toBe(''); expect(fromIsoDate('bientôt')).toBe('');
  });
});
