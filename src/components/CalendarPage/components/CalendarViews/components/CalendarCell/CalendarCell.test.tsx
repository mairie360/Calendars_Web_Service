import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarCell } from './CalendarCell';
import { axe } from 'jest-axe';
it('provides a keyboard-activatable day and respects its disabled state', async () => { const onClick = vi.fn(); const { container, rerender } = render(<CalendarCell selected onClick={onClick}>15 Octobre</CalendarCell>); await userEvent.tab(); await userEvent.keyboard('{Enter}'); expect(onClick).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]); rerender(<CalendarCell disabled onClick={onClick}>15 Octobre</CalendarCell>); expect(screen.getByRole('button')).toBeDisabled(); });
