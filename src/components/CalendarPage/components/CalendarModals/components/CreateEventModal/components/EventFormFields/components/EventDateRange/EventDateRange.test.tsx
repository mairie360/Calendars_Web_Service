import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render } from '@testing-library/react';

import { EventDateRange } from './EventDateRange';

describe('EventDateRange', () => {
  it('offers the start and end dates', () => {
    render(<EventDateRange date="2026-10-21" endDate="" onDate={() => undefined} onEndDate={() => undefined} />);
    expect(document.getElementById('event-date')).not.toBeNull(); expect(document.getElementById('event-end-date')).not.toBeNull();
  });
});
