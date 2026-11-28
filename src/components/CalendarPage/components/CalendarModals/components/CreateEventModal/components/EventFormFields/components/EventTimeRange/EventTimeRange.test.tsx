import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EventTimeRange } from './EventTimeRange';

describe('EventTimeRange', () => {
  it('picks the start and end times', () => {
    const onStart = vi.fn();
    render(<EventTimeRange startTime="" endTime="" onStart={onStart} onEnd={() => undefined} />);
    fireEvent.change(screen.getByLabelText('Heure de début'), { target: { value: '09:30' } });
    expect(onStart).toHaveBeenCalledWith('09:30'); expect(document.getElementById('event-end-time')).not.toBeNull();
  });

  it('MAIR-1256 uses the lib time field (« 09:00 », clock icon) by quarter hour', () => {
    render(<EventTimeRange startTime="09:00" endTime="10:30" onStart={() => undefined} onEnd={() => undefined} />);
    for (const [label, value] of [['Heure de début', '09:00'], ['Heure de fin', '10:30']]) {
      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute('type', 'time'); expect(input).toHaveAttribute('step', '900'); expect(input).toHaveValue(value);
      expect(input.closest('[data-m360-component~="TimeField"]')?.querySelector('svg')).not.toBeNull();
    }
    expect(screen.queryByRole('combobox')).toBeNull();
  });
});
