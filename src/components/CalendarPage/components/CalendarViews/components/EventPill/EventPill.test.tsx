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

it('MAIR-905 / MAIR-1121: the pill takes the tone of its category (no grey) and an inline start time', () => {
  const tones = { meeting: 'secondary-strong', activity: 'success', ceremony: 'warning', other: 'purple' } as const;
  for (const [category, tone] of Object.entries(tones)) {
    const { container, unmount } = render(<EventPill event={{ id: 1, title: 'Conseil', date: '2026-10-15', startTime: '09:00', endTime: '10:00', category }} inline />);
    const pill = container.firstElementChild as HTMLElement;
    expect(pill).toHaveAttribute('data-tone', tone);
    expect(pill).toHaveTextContent('09:00Conseil');
    expect(pill.textContent).not.toContain('10:00');
    unmount();
  }
});

it('MAIR-935: an event outside the search fades to 30 % and stays clickable', async () => {
  const onClick = vi.fn();
  const event = { id: 2, title: 'Marché', date: '2026-10-15', searchDimmed: true };
  render(<EventPill event={event} onClick={onClick} />);
  const pill = screen.getByRole('button', { name: /Marché/ });
  expect(pill).toHaveAttribute('data-dimmed', 'true');
  expect(pill).toHaveClass('opacity-30');
  await userEvent.click(pill);
  expect(onClick).toHaveBeenCalledWith(event);
});

it('MAIR-1122: a meeting shows and announces my answer, struck through once declined; other categories do not', () => {
  const meeting = { id: 'm', title: 'Conseil', date: '2026-10-15', startTime: '09:00', endTime: '10:00', category: 'meeting' };
  const { rerender } = render(<EventPill event={{ ...meeting, myParticipation: 'declined' }} onClick={() => undefined} />);
  const pill = screen.getByRole('button', { name: /Conseil/ });
  expect(pill).toHaveAttribute('data-participation', 'declined');
  expect(screen.getByText('Conseil')).toHaveClass('line-through');
  expect(pill).toHaveAccessibleName(expect.stringContaining('(déclinée)'));
  rerender(<EventPill event={{ ...meeting, myParticipation: 'pending' }} onClick={() => undefined} />);
  expect(screen.getByRole('button', { name: /Conseil/ })).toHaveAccessibleName(expect.stringContaining('(en attente de ma réponse)'));
  expect(screen.getByText('Conseil')).not.toHaveClass('line-through');
  rerender(<EventPill event={{ ...meeting, category: 'ceremony', myParticipation: 'declined' }} onClick={() => undefined} />);
  expect(screen.getByRole('button', { name: /Conseil/ })).not.toHaveAttribute('data-participation');
  expect(screen.queryByText(/déclinée/)).not.toBeInTheDocument();
});

it('MAIR-1179: a private event shows a lock before its title and reads « (privé) », a public one neither', async () => {
  const event = { id: 1, title: 'Planification', date: '2026-10-15', startTime: '09:00', endTime: '10:00', visibility: 'private' as const };
  const { container, rerender } = render(<EventPill event={event} onClick={vi.fn()} />);
  expect(screen.getByRole('button', { name: /Planification\s*\(privé\)/ })).toBeInTheDocument();
  expect(container.querySelector('svg.lucide-lock')).not.toBeNull();
  expect(container.firstElementChild).toHaveAttribute('data-visibility', 'private');
  expect((await axe(container)).violations).toEqual([]);
  rerender(<EventPill event={{ ...event, visibility: 'public' }} onClick={vi.fn()} />);
  expect(container.querySelector('svg.lucide-lock')).toBeNull();
  expect(screen.queryByText(/privé/)).not.toBeInTheDocument();
});
