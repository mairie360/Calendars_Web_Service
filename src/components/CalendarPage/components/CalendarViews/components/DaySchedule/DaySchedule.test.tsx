import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DaySchedule } from './DaySchedule';
import { axe } from 'jest-axe';
it('keeps selection of a day slot separate from selection of its event', async () => { const event = { id: 1, title: 'Conseil', date: '2026-10-15', startTime: '09:00', endTime: '10:00' }; const onSelectSlot = vi.fn(); const onEventClick = vi.fn(); const { container } = render(<DaySchedule currentDate="2026-10-15" hours={['08:00', '09:00']} events={[event]} onSelectSlot={onSelectSlot} onEventClick={onEventClick} />); await userEvent.click(screen.getByRole('button', { name: '15 Octobre 2026 à 08:00' })); expect(onSelectSlot).toHaveBeenCalledWith(new Date(2026, 9, 15), '08:00'); await userEvent.click(screen.getByRole('button', { name: /Conseil/ })); expect(onEventClick).toHaveBeenCalledWith(event); expect(onSelectSlot).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]); });
