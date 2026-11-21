import React from 'react';
import { Users } from 'lucide-react';

import { Panel, UnavailableAlert } from '@mairie360/lib-components/primitives';
import { formatFullDate, getEventTimeLabel } from '@/components/CalendarPage/calendar-date';
import { joinClasses } from '@/components/CalendarPage/calendar-style';
import type { UpcomingEventsPanelProps } from '@/components/CalendarPage/calendar-types';

export type { CalendarEvent, UpcomingEventsPanelProps } from '@/components/CalendarPage/calendar-types';

/** Upcoming events; MAIR-911: skeleton while the calendar loads, an unavailable alert with « Réessayer » after a failed read. */
export const UpcomingEventsPanel = ({
  state = 'default',
  onRetry,
  events = [],
  title = 'Événements à venir',
  emptyLabel = 'Aucun événement à venir',
  showEmptyState = false,
  onEventClick,
  className = '',
  ...props
}: UpcomingEventsPanelProps) => (
  <Panel title={title} className={joinClasses('min-h-[22rem]', className)} state={state === 'loading' ? 'loading' : 'default'}
    stateProps={{ title: 'Chargement des événements à venir…' }} {...props}>
    <div>
      {state === 'unavailable' ? (
        <UnavailableAlert size="s" onAction={onRetry} />
      ) : events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              role={onEventClick ? 'button' : undefined}
              tabIndex={onEventClick ? 0 : undefined}
              className={joinClasses(
                'rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] p-3',
                onEventClick &&
                  'cursor-pointer transition-colors hover:border-[var(--mairie-border)] hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25'
              )}
              onClick={() => onEventClick?.(event)}
              onKeyDown={(keyEvent) => {
                if (!onEventClick) return;
                if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                  keyEvent.preventDefault();
                  onEventClick(event);
                }
              }}
            >
              <div className="text-sm font-semibold leading-5 text-[var(--mairie-text)]">{event.title}</div>
              <div className="mt-1 text-xs leading-5 text-[var(--mairie-muted)]">
                {formatFullDate(event.date)}
                {getEventTimeLabel(event) && ` · ${getEventTimeLabel(event)}`}
              </div>
              {event.description && (
                <div className="mt-2 text-sm leading-5 text-[var(--mairie-muted)]">{event.description}</div>
              )}
              {event.assignees && event.assignees.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-[var(--mairie-muted)]">
                  <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                  <span className="truncate">{event.assignees.map((assignee) => assignee.name).join(', ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        showEmptyState && <p className="text-sm leading-6 text-[var(--mairie-muted)]">{emptyLabel}</p>
      )}
    </div>
  </Panel>
);
