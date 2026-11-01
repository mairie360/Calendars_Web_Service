import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { RecurrenceDayPicker } from './RecurrenceDayPicker';

describe('RecurrenceDayPicker', () => {
  it('marks the picked recurrence days as pressed', () => {
    const onToggle = vi.fn();
    render(<RecurrenceDayPicker selected={[0]} onToggle={onToggle} />);
    expect(screen.getByRole('button', { name: 'Dim' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Ven' })); expect(onToggle).toHaveBeenCalledWith(5);
  });
});
