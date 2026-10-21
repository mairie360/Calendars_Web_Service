import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CalendarHeader } from './CalendarHeader';

describe('CalendarHeader', () => {
  it('shows the title and the create action only when the data is ready', () => {
    const onCreate = vi.fn();
    const { rerender } = render(<CalendarHeader />);
    expect(screen.getByRole('heading', { level: 1, name: 'Calendrier & Événements' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nouvel événement' })).toBeNull();
    rerender(<CalendarHeader onCreate={onCreate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nouvel événement' })); expect(onCreate).toHaveBeenCalled();
  });
});
