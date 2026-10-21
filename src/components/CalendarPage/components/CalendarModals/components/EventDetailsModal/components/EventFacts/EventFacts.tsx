import { CalendarDays, Clock, MapPin, Repeat, ShieldCheck, Tag } from 'lucide-react';

import { getEventDateLabel, getEventTimeLabel, getRecurrenceLabel } from '@/components/CalendarPage/calendar-date';
import type { CalendarEvent } from '@/components/CalendarPage/calendar-types';
import { EventDetailRow } from './components/EventDetailRow';

export const approvalStatusLabels = { pending: 'En attente', approved: 'Validé', rejected: 'Refusé' } as const;

/** Date, time, category, validation, place and recurrence of an event. */
export const EventFacts = ({ event, categoryLabel }: { event: CalendarEvent; categoryLabel?: string }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    <EventDetailRow icon={CalendarDays} label="Date" value={getEventDateLabel(event)} />
    <EventDetailRow icon={Clock} label="Horaire" value={getEventTimeLabel(event)} />
    <EventDetailRow icon={Tag} label="Catégorie" value={categoryLabel} />
    {event.approvalStatus && <EventDetailRow icon={ShieldCheck} label="Validation" value={approvalStatusLabels[event.approvalStatus]} />}
    <EventDetailRow icon={MapPin} label="Lieu" value={event.location} />
    <EventDetailRow icon={Repeat} label="Récurrence" value={getRecurrenceLabel(event.recurrence)} className="sm:col-span-2" />
  </div>
);
