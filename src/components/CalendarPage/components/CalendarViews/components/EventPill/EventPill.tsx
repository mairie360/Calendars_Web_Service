import React from 'react';

import { getEventTone } from '@/app/calendar/constants';
import { getEventTimeLabel } from '@/components/CalendarPage/calendar-date';
import { joinClasses } from '@/components/CalendarPage/calendar-style';
import type { CalendarEvent } from '@/components/CalendarPage/calendar-types';

interface EventPillProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  showTime?: boolean;
  /** MAIR-905: one line « 09:00 Titre » (month cells) instead of the title above the time range. */
  inline?: boolean;
}

export const EventPill = ({ event, onClick, className, style, showTime = true, inline = false }: EventPillProps) => {
  const timeLabel = showTime ? getEventTimeLabel(event) : null;
  const startLabel = showTime && inline ? event.startTime || null : null;
  const clickableProps = onClick
    ? {
        role: 'button',
        tabIndex: 0,
        onClick: (clickEvent: React.MouseEvent<HTMLDivElement>) => {
          clickEvent.stopPropagation();
          onClick(event);
        },
        onKeyDown: (keyEvent: React.KeyboardEvent<HTMLDivElement>) => {
          if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
            keyEvent.preventDefault();
            keyEvent.stopPropagation();
            onClick(event);
          }
        },
      }
    : {};

  return (
    <div
      className={joinClasses(
        'min-w-0 overflow-hidden rounded-md px-2 py-1 text-xs font-medium leading-4',
        onClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35',
        event.colorClassName || 'bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]',
        event.className,
        className,
        // MAIR-935: an event outside the top-bar search fades to 30 % and stays clickable.
        event.searchDimmed && 'opacity-30'
      )}
      data-tone={getEventTone(event.category)}
      data-dimmed={event.searchDimmed ? 'true' : undefined}
      title={typeof event.title === 'string' ? event.title : undefined}
      style={style}
      {...clickableProps}
    >
      <div className="min-w-0 truncate text-left">
        {startLabel && <span className="calendar-event-time mr-1 font-semibold tabular-nums">{startLabel}</span>}
        {startLabel ? <span className="calendar-event-title">{event.title}</span> : event.title}
      </div>
      {timeLabel && !inline && (
        <div className="break-words text-[11px] font-normal opacity-75">{timeLabel}</div>
      )}
    </div>
  );
};
