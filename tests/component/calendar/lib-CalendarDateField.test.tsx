import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarDateField } from '@/components/calendar/CalendarDateField';
import { axe } from 'jest-axe';
it('normalizes typed date separators, selects a real calendar date and dismisses its picker', async () => { const user = userEvent.setup(); const onChange = vi.fn(); const { container } = render(<CalendarDateField id="date" label="Date" value="15-10-2026" onChange={onChange} />); fireEvent.change(screen.getByLabelText('Date'), { target: { value: '16/10/2026' } }); expect(onChange).toHaveBeenLastCalledWith('16-10-2026'); await user.click(screen.getByRole('button', { name: 'Ouvrir le calendrier pour Date' })); await user.click(screen.getByRole('button', { name: 'Choisir le 16 Octobre 2026' })); expect(onChange).toHaveBeenLastCalledWith('16-10-2026'); expect(screen.queryByRole('button', { name: 'Choisir le 16 Octobre 2026' })).not.toBeInTheDocument(); expect((await axe(container)).violations).toEqual([]); });
