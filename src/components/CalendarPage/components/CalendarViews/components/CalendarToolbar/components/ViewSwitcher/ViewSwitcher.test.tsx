import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewSwitcher } from './ViewSwitcher';
it('exposes the current view and requests a keyboard-activated alternative', async () => { const onChange = vi.fn(); render(<ViewSwitcher value="month" options={[{ value: 'month', label: 'Mois' }, { value: 'week', label: 'Semaine' }]} onChange={onChange} />); expect(screen.getByRole('tab', { name: 'Mois' })).toHaveAttribute('aria-selected', 'true'); screen.getByRole('tab', { name: 'Semaine' }).focus(); await userEvent.keyboard('{Enter}'); expect(onChange).toHaveBeenCalledWith('week'); });
