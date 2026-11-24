import React from 'react';
import { Clock, Lock } from 'lucide-react';

import { AvatarStack, Icon, Panel, StatusPill, UnavailableAlert } from '@mairie360/lib-components/primitives';
import { getEventTone } from '@/app/calendar/constants';
import { addDays, getEventTimeLabel, isSameDay } from '@/components/CalendarPage/calendar-date';
import { joinClasses } from '@/components/CalendarPage/calendar-style';
import { CalendarLoadingSkeleton } from '@/components/CalendarPage/components/CalendarLoadingSkeleton';
import type { UpcomingEventsPanelProps } from '@/components/CalendarPage/calendar-types';

export type { CalendarUpcomingItem, UpcomingEventsPanelProps } from '@/components/CalendarPage/calendar-types';

/** « Aujourd’hui », « Demain » or « jeu. 20 nov. ». */
export function upcomingDayLabel(date: Date, today: Date) {
  if (isSameDay(date, today)) return 'Aujourd’hui';
  if (isSameDay(date, addDays(today, 1))) return 'Demain';
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
}

/**
 * MAIR-918 C2: « À venir » — the next three occurrences from now: title, category pill, day and hours,
 * participants. A row opens the event details (F5).
 * MAIR-911: skeleton while the calendar loads, an unavailable alert with « Réessayer » after a failed read.
 */
export const UpcomingEventsPanel = ({
  state = 'default',
  onRetry,
  items = [],
  categories = [],
  today = new Date(),
  filtered = false,
  emptyLabel = filtered ? 'Aucun événement à venir ne correspond aux filtres.' : 'Aucun événement à venir.',
  onEventClick,
  className = '',
  ...props
}: UpcomingEventsPanelProps) => (
  <Panel title="À venir" description={filtered ? 'Les 3 prochains événements filtrés' : 'Les 3 prochains événements'} className={className}
    {...props}>
    <div>
      {/* Decorative skeleton, the page's permanent status region announces the load. */}
      {state === 'loading' ? (
        <CalendarLoadingSkeleton padding="0" />
      ) : state === 'unavailable' ? (
        <UnavailableAlert size="s" onAction={onRetry} />
      ) : items.length > 0 ? (
        <ul className="space-y-2">
          {items.map(({ event, date }) => {
            const time = getEventTimeLabel(event);
            const category = categories.find((option) => option.value === event.category)?.label ?? event.category;
            const people = (event.assignees ?? []).map((person) => ({ name: String(person.name) }));
            return (
              <li key={`${event.id}-${date.getTime()}`}>
                <button type="button" onClick={() => onEventClick?.(event)} disabled={!onEventClick}
                  className={joinClasses('calendar-upcoming-item flex w-full flex-col gap-1.5 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-3 text-left transition-colors',
                    'hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/30 disabled:cursor-default')}>
                  <span className="flex min-w-0 items-start justify-between gap-2">
                    <span className="min-w-0 truncate text-sm font-semibold leading-5 text-[var(--mairie-text)]">
                      {event.visibility === 'private' && <Icon icon={Lock} size="xs" className="calendar-upcoming-private mr-1 inline-block align-[-1px] text-[var(--mairie-muted)]" />}
                      {event.title}
                      {event.visibility === 'private' && <span className="sr-only"> (privé)</span>}
                    </span>
                    {category && <StatusPill size="s" dot tone={getEventTone(event.category)} label={String(category)} />}
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs leading-5 text-[var(--mairie-muted)]">
                      <Icon icon={Clock} size="xs" />
                      {upcomingDayLabel(date, today)}{time && ` · ${time}`}
                    </span>
                    {people.length > 0 && <AvatarStack size="s" max={3} label="Participants" people={people} />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm leading-6 text-[var(--mairie-muted)]">{emptyLabel}</p>
      )}
    </div>
  </Panel>
);
