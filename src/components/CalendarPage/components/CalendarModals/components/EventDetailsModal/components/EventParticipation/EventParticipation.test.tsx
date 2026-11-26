import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { EventParticipation } from './EventParticipation';

const meeting = { id: 7, title: 'Conseil', date: '2026-10-15', category: 'meeting', canRespond: true, myParticipation: 'pending' as const };

it('MAIR-1122: an invited user answers a meeting from « Ma participation »', async () => {
  const user = userEvent.setup(); const onRespond = vi.fn();
  const { container } = render(<EventParticipation event={meeting} onRespond={onRespond} />);
  const block = screen.getByRole('region', { name: 'Ma participation' });
  expect(block).toHaveTextContent('Vous n’avez pas encore répondu.');
  expect(screen.getByRole('button', { name: 'Je participe' })).toHaveAttribute('aria-pressed', 'false');
  await user.click(screen.getByRole('button', { name: 'Je participe' }));
  expect(onRespond).toHaveBeenCalledWith(meeting, 'accepted');
  screen.getByRole('button', { name: 'Je décline' }).focus(); await user.keyboard('{Enter}');
  expect(onRespond).toHaveBeenLastCalledWith(meeting, 'declined');
  expect((await axe(container)).violations).toEqual([]);
});

it('MAIR-1122: the given answer is the pressed button and is announced', () => {
  const { rerender } = render(<EventParticipation event={{ ...meeting, myParticipation: 'declined' }} onRespond={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Je décline' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Vous avez décliné cette réunion.')).toBeInTheDocument();
  rerender(<EventParticipation event={{ ...meeting, myParticipation: 'accepted' }} onRespond={vi.fn()} busy />);
  expect(screen.getByRole('button', { name: 'Je participe' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'Je participe' })).toBeDisabled();
  expect(screen.getByText('Vous participez à cette réunion.')).toBeInTheDocument();
});

it('MAIR-1122: no block for another category nor for a user who cannot answer', () => {
  const { container, rerender } = render(<EventParticipation event={{ ...meeting, category: 'ceremony' }} onRespond={vi.fn()} />);
  expect(container).toBeEmptyDOMElement();
  rerender(<EventParticipation event={{ ...meeting, canRespond: false }} onRespond={vi.fn()} />);
  expect(container).toBeEmptyDOMElement();
});

it('MAIR-1222 the answer status exists before its text, so the text is announced (RGAA 7.5)', async () => {
  const { renderToStaticMarkup } = await import('react-dom/server');
  // First render (server or first client pass): the status is there, still empty.
  expect(renderToStaticMarkup(<EventParticipation event={meeting} onRespond={vi.fn()} />)).toMatch(/<p[^>]*role="status"[^>]*><\/p>/);
  render(<EventParticipation event={meeting} onRespond={vi.fn()} />);
  expect(screen.getByRole('status')).toHaveTextContent('Vous n’avez pas encore répondu.');
});
