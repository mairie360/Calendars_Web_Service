import { CalendarDays, Clock, Globe, Lock, MapPin, Users } from 'lucide-react';

import { formatFullDate, getEventDateLabel, getEventTimeLabel, getRecurrenceLabel, isSameDay, parseDateInput } from '@/components/CalendarPage/calendar-date';
import type { CalendarAssignee, CalendarEvent } from '@/components/CalendarPage/calendar-types';
import { EventDetailRow } from './components/EventDetailRow';

export const approvalStatusLabels = { pending: 'En attente', approved: 'Validé', rejected: 'Refusé' } as const;

/** « Public · visible par tous les agents » / « Privé · visible seulement par vous et les invités »; an event without it is public. */
export const visibilityLabels = {
  public: 'Public · visible par tous les agents',
  private: 'Privé · visible seulement par vous et les invités',
} as const;
export const isPrivateEvent = (event: CalendarEvent) => event.visibility === 'private';

/** « Jeudi 12 novembre 2026 · tous les mois »: the day (or the span) and the recurrence in lower case. */
export function eventDateWithRecurrence(event: CalendarEvent) {
  const date = parseDateInput(event.date);
  const single = !event.endDate || isSameDay(event.date, event.endDate);
  const day = single
    ? `${new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date)} ${formatFullDate(date).toLocaleLowerCase('fr-FR')}`
    : getEventDateLabel(event);
  const label = day.charAt(0).toLocaleUpperCase('fr-FR') + day.slice(1);
  const repeats = event.recurrence && event.recurrence.frequency !== 'none';
  if (!repeats) return label;
  const recurrence = getRecurrenceLabel(event.recurrence);
  return `${label} · ${recurrence.charAt(0).toLocaleLowerCase('fr-FR')}${recurrence.slice(1)}`;
}

/** Date (with the recurrence), Horaire, Lieu, Participants and Visibilité, each with its icon. */
export const EventFacts = ({ event, assignees = event.assignees ?? [] }: { event: CalendarEvent; assignees?: CalendarAssignee[] }) => (
  <dl className="grid gap-2">
    <EventDetailRow icon={CalendarDays} label="Date" value={eventDateWithRecurrence(event)} />
    <EventDetailRow icon={Clock} label="Horaire" value={getEventTimeLabel(event)} />
    <EventDetailRow icon={MapPin} label="Lieu" value={event.location} />
    <EventDetailRow icon={Users} label="Participants" value={assignees.length ? assignees.map((person) => person.name).join(', ') : 'Aucun participant'} />
    <EventDetailRow icon={isPrivateEvent(event) ? Lock : Globe} label="Visibilité" value={visibilityLabels[isPrivateEvent(event) ? 'private' : 'public']} />
  </dl>
);
