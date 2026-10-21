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
});
