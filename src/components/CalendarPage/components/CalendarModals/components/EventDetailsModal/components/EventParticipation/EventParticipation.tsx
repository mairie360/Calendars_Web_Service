import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@mairie360/lib-components/primitives';

import type { CalendarEvent, CalendarParticipation } from '@/components/CalendarPage/calendar-types';

const stateLabels: Record<CalendarParticipation, string> = {
  accepted: 'Vous participez à cette réunion.',
  pending: 'Vous n’avez pas encore répondu.',
  declined: 'Vous avez décliné cette réunion.',
};

interface EventParticipationProps {
  event: CalendarEvent;
  /** A write is in flight: both answers wait for it. */
  busy?: boolean;
  onRespond: (event: CalendarEvent, status: 'accepted' | 'declined') => void;
}

/**
 * MAIR-1122: « Ma participation » block of a meeting's details, for an assigned user (`canRespond`): the current
 * answer, then « Je décline » / « Je participe ». The answer given is the pressed button; it can be changed.
 */
export const EventParticipation = ({ event, busy = false, onRespond }: EventParticipationProps) => {
  const headingId = React.useId();
  if (event.category !== 'meeting' || !event.canRespond) return null;
  const state = event.myParticipation ?? 'pending';

  return (
    <section aria-labelledby={headingId} data-participation={state}
      className="calendar-participation flex flex-wrap items-center gap-3 rounded-lg border border-[var(--mairie-border)] p-3">
      <div className="mr-auto min-w-0">
        <h3 id={headingId} className="text-sm font-semibold text-[var(--mairie-text)]">Ma participation</h3>
        <p className="text-sm text-[var(--mairie-muted)]" aria-live="polite">{stateLabels[state]}</p>
      </div>
      <Button variant="outline" icon={X} label="Je décline" aria-pressed={state === 'declined'} disabled={busy}
        onClick={() => onRespond(event, 'declined')} />
      <Button icon={Check} label="Je participe" aria-pressed={state === 'accepted'} disabled={busy}
        onClick={() => onRespond(event, 'accepted')} />
    </section>
  );
};
