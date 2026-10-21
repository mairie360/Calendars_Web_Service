import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { CalendarViews } from './CalendarViews';

const calendar = { periodTitle: 'Octobre 2026', view: 'month', currentDate: new Date(2026, 9, 21), selectedDate: new Date(2026, 9, 21), events: [], handlePrevious: vi.fn(), handleNext: vi.fn(), setView: vi.fn(), handleSelectDate: vi.fn(), handleSelectSlot: vi.fn(), handleEventClick: vi.fn() } as never;

describe('CalendarViews', () => {
  it('renders the toolbar and the month grid of the current view', () => {
    const { container } = render(<CalendarViews calendar={calendar} gridRef={React.createRef()} />);
    expect(screen.getByText('Octobre 2026')).toBeInTheDocument();
    expect(container.querySelector('.calendar-month-grid')).not.toBeNull();
    expect(screen.getByRole('button', { name: /précédent/i })).toBeInTheDocument();
  });
});
