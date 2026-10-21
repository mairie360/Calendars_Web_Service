import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { EventPill } from '@/components/CalendarPage/components/CalendarViews/components/EventPill';
import { formatTimeLabel, getEventTimeLabel } from '@/components/CalendarPage';

const event = {
  id: 'event-1',
  title: 'Réunion',
  date: '2026-09-27',
  startTime: '09:00',
  endTime: '10:30',
};

describe('calendar time labels', () => {
  it('renders a complete event range in HH:mm in a compact pill', () => {
    render(<EventPill event={event} />);

    expect(screen.getByText('09:00 – 10:30')).toBeInTheDocument();
  });

  it('normalizes a single valid time without changing the event', () => {
    const startOnlyEvent = { ...event, startTime: '9:5', endTime: '' };

    expect(getEventTimeLabel(startOnlyEvent)).toBe('09:05');
    expect(startOnlyEvent.startTime).toBe('9:5');
    expect(getEventTimeLabel({ ...event, startTime: '', endTime: '10:30' })).toBe('10:30');
  });

  it('omits missing and invalid times instead of inventing labels', () => {
    expect(getEventTimeLabel({ ...event, startTime: '', endTime: '' })).toBeNull();
    expect(getEventTimeLabel({ ...event, startTime: '25:99', endTime: '' })).toBeNull();
    expect(formatTimeLabel('09:xx')).toBeNull();
    expect(formatTimeLabel('09:00:00')).toBeNull();
    expect(getEventTimeLabel({ ...event, startTime: '25:99' })).toBe('10:30');
  });
});
