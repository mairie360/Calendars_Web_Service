import React from 'react';

import { defaultDayLabels, defaultHours } from '@/components/CalendarPage/calendar-constants';
import {
  dateKey,
  formatFullDate,
  formatMonthYear,
  parseDateInput,
  timeToMinutes,
} from '@/components/CalendarPage/calendar-date';
import { EventPill } from '../EventPill';
import { calendarHourHeight, getPositionedEventsForDate } from '../../layout';
import { joinClasses } from '@/components/CalendarPage/calendar-style';
import type { DayScheduleProps } from '@/components/CalendarPage/calendar-types';

export type { CalendarDateInput, CalendarEvent, DayScheduleProps } from '@/components/CalendarPage/calendar-types';

export const DaySchedule = ({
  currentDate,
  events = [],
  hours = defaultHours,
  onSelectSlot,
  onEventClick,
  className = '',
  ...props
}: DayScheduleProps) => {
  const parsedDate = parseDateInput(currentDate);
  const weekDayLabel = defaultDayLabels[(parsedDate.getDay() + 6) % 7];
  const visibleStartMinutes = timeToMinutes(hours[0] || '00:00');
  const visibleEndMinutes = timeToMinutes(hours[hours.length - 1] || '23:00') + 60;
  const timelineHeight = hours.length * calendarHourHeight;
  const positionedEvents = getPositionedEventsForDate(events, parsedDate, visibleStartMinutes, visibleEndMinutes);

  return (
    <div className={joinClasses('space-y-4', className)} {...props}>
      <div className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] py-5 text-center text-[var(--mairie-text)]">
        <div className="text-sm leading-5 text-[var(--mairie-muted)]">{weekDayLabel}</div>
        <div className="text-2xl font-bold leading-8">{parsedDate.getDate()}</div>
        <div className="text-sm leading-5 text-[var(--mairie-muted)]">{formatMonthYear(parsedDate)}</div>
      </div>

      <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-2">
        <div className="relative" style={{ height: timelineHeight }}>
          {hours.map((hour, index) => (
            <div
              key={hour}
              className="absolute right-0 text-right text-sm leading-5 text-[var(--mairie-muted)]"
              style={{ top: index * calendarHourHeight + 6 }}
            >
              {hour}
            </div>
          ))}
        </div>

        <div className="relative" style={{ height: timelineHeight }}>
          {hours.map((hour, index) => (
            <button
              key={`${dateKey(parsedDate)}-${hour}`}
              type="button"
              aria-label={`${formatFullDate(parsedDate)} à ${hour}`}
              className="absolute left-0 right-0 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] transition-colors hover:border-[var(--mairie-border)] hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/30"
              style={{ top: index * calendarHourHeight, height: calendarHourHeight - 4 }}
              onClick={() => onSelectSlot?.(parsedDate, hour)}
            />
          ))}

          {positionedEvents.map(({ event, range, lane, laneCount }) => {
            const width = 100 / laneCount;
            const top = (range.offsetMinutes / 60) * calendarHourHeight;
            const height = Math.max(36, (range.durationMinutes / 60) * calendarHourHeight - 4);

            return (
              <EventPill
                key={`${event.id}-${dateKey(parsedDate)}-${range.startMinutes}-${lane}`}
                event={event}
                onClick={onEventClick}
                className={joinClasses(
                  'absolute z-10 shadow-sm',
                  !range.isStart && 'rounded-l-sm border-l-4 border-l-[var(--mairie-accent)]',
                  !range.isEnd && 'rounded-r-sm border-r-4 border-r-[var(--mairie-accent)]'
                )}
                style={{
                  top,
                  height,
                  left: `calc(${lane * width}% + 2px)`,
                  width: `calc(${width}% - 4px)`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
