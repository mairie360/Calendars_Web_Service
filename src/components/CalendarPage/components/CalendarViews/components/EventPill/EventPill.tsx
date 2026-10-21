import React from 'react';

import { getEventTimeLabel } from '@/components/CalendarPage/calendar-date';
import { joinClasses } from '@/components/CalendarPage/calendar-style';
import type { CalendarEvent } from '@/components/CalendarPage/calendar-types';

interface EventPillProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  showTime?: boolean;
}

export const EventPill = ({ event, onClick, className, style, showTime = true }: EventPillProps) => {
  const timeLabel = showTime ? getEventTimeLabel(event) : null;
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
        className
      )}
      title={typeof event.title === 'string' ? event.title : undefined}
      style={style}
      {...clickableProps}
    >
      <div className="min-w-0 truncate text-left">{event.title}</div>
      {timeLabel && (
        <div className="break-words text-[11px] font-normal opacity-75">{timeLabel}</div>
      )}
    </div>
  );
};
