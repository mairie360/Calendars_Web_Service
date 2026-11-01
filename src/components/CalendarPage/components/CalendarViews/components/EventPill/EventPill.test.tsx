import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { EventPill } from './EventPill';

it('exposes an event as a keyboard action only when an owner can handle selection', async () => {
  const event = { id: 1, title: 'Conseil', date: '2026-10-15', startTime: '09:00', endTime: '10:00' }; const onClick = vi.fn();
  const { container, rerender } = render(<EventPill event={event} onClick={onClick} />);
  screen.getByRole('button', { name: /Conseil/ }).focus(); await userEvent.keyboard('{Enter} '); expect(onClick).toHaveBeenCalledTimes(2); expect(onClick).toHaveBeenLastCalledWith(event); expect((await axe(container)).violations).toEqual([]);
  rerender(<EventPill event={event} showTime={false} />); expect(screen.queryByRole('button')).not.toBeInTheDocument(); expect(screen.getByText('Conseil')).toBeVisible();
});
