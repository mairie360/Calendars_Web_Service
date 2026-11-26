import React from 'react';
import { Lock } from 'lucide-react';
import { Icon } from '@mairie360/lib-components/primitives';

import { getEventTone, getShownParticipation, participationLabels } from '@/app/calendar/constants';
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
  /** MAIR-1123 (week view): the title on two lines at most, then the time range. */
  compact?: boolean;
  /** Month cells: the start time under the title instead of the time range. */
  startOnly?: boolean;
}

export const EventPill = ({ event, onClick, className, style, showTime = true, inline = false, compact = false, startOnly = false }: EventPillProps) => {
  const timeLabel = showTime ? (startOnly ? event.startTime || null : getEventTimeLabel(event)) : null;
  const startLabel = showTime && inline ? event.startTime || null : null;
  const participation = getShownParticipation(event.category, event.myParticipation);
  const declined = participation === 'declined';
  // MAIR-1122: the state of a meeting is read after its title, it is otherwise only its look.
  const stateLabel = participation && <span className="sr-only"> ({participationLabels[participation]})</span>;
  // A private event shows a lock before its title, read « (privé) » after it.
  const privateEvent = event.visibility === 'private';
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
      data-participation={participation}
      data-visibility={privateEvent ? 'private' : undefined}
      data-dimmed={event.searchDimmed ? 'true' : undefined}
      title={typeof event.title === 'string' ? event.title : undefined}
      style={style}
      {...clickableProps}
    >
      <div className={joinClasses('min-w-0 text-left', compact ? 'calendar-event-title line-clamp-2 break-words' : 'truncate')}>
        {startLabel && <span className="calendar-event-time mr-1 font-semibold tabular-nums">{startLabel}</span>}
        {privateEvent && <Icon icon={Lock} size="xs" className="calendar-event-private mr-1 inline-block align-[-1px]" />}
        {startLabel
          ? <span className={joinClasses('calendar-event-title', declined && 'line-through')}>{event.title}</span>
          : declined ? <span className="line-through">{event.title}</span> : event.title}
        {privateEvent && <span className="sr-only"> (privé)</span>}
        {stateLabel}
      </div>
      {timeLabel && !inline && (
        // Full colour of the pill: a faded time fails the contrast ratio (RGAA 3.2).
        <div className="calendar-event-time break-words text-[11px] font-normal">{timeLabel}</div>
      )}
    </div>
  );
};
