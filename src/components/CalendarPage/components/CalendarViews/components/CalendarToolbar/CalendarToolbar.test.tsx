import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarToolbar } from './CalendarToolbar';
import { axe } from 'jest-axe';
it('delegates calendar-period and view choices through named controls', async () => { const onPrevious = vi.fn(); const onNext = vi.fn(); const onViewChange = vi.fn(); const { container } = render(<CalendarToolbar title="Octobre 2026" view="month" onPrevious={onPrevious} onNext={onNext} onViewChange={onViewChange} />); await userEvent.click(screen.getByRole('button', { name: 'Période précédente' })); await userEvent.click(screen.getByRole('button', { name: 'Période suivante' })); await userEvent.click(screen.getByRole('tab', { name: 'Semaine' })); expect(onPrevious).toHaveBeenCalledTimes(1); expect(onNext).toHaveBeenCalledTimes(1); expect(onViewChange).toHaveBeenCalledWith('week'); expect((await axe(container)).violations).toEqual([]); });
