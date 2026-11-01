import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthGrid } from './MonthGrid';
it('selects the named calendar date without confusing an event activation for a date choice', async () => { const event = { id: 1, title: 'Conseil', date: '2026-10-15' }; const onSelectDate = vi.fn(); const onEventClick = vi.fn(); render(<MonthGrid currentDate="2026-10-15" events={[event]} onSelectDate={onSelectDate} onEventClick={onEventClick} />); await userEvent.click(screen.getByRole('button', { name: 'Sélectionner le 16 Octobre 2026' })); expect(onSelectDate).toHaveBeenCalledWith(new Date(2026, 9, 16)); await userEvent.click(screen.getByRole('button', { name: /Conseil/ })); expect(onEventClick).toHaveBeenCalledWith(event); expect(onSelectDate).toHaveBeenCalledTimes(1); });
