import React, { useMemo } from 'react';

import { CalendarCell } from '../CalendarCell';
import { defaultDayLabels, defaultHours } from '@/components/CalendarPage/calendar-constants';
import {
  dateKey,
  formatFullDate,
  getWeekDates,
  isSameDay,
  parseDateInput,
  timeToMinutes,
} from '@/components/CalendarPage/calendar-date';
import { EventPill } from '../EventPill';
import { calendarHourHeight, getEventGroupsForDate } from '../../layout';
import { joinClasses } from '@/components/CalendarPage/calendar-style';
import type { WeekGridProps } from '@/components/CalendarPage/calendar-types';

export type { CalendarDateInput, CalendarEvent, WeekGridProps } from '@/components/CalendarPage/calendar-types';

export const WeekGrid = ({
  currentDate,
  selectedDate,
  events = [],
  hours = defaultHours,
  weekStartsOn = 1,
  dayLabels = defaultDayLabels,
  onSelectDate,
  onSelectSlot,
  onEventClick,
  onShowDay,
  className = '',
  ...props
}: WeekGridProps) => {
  const parsedDate = parseDateInput(currentDate);
  const selected = selectedDate ? parseDateInput(selectedDate) : parsedDate;
  const weekDates = useMemo(() => getWeekDates(parsedDate, weekStartsOn), [parsedDate, weekStartsOn]);
  const visibleStartMinutes = timeToMinutes(hours[0] || '00:00');
  const visibleEndMinutes = timeToMinutes(hours[hours.length - 1] || '23:00') + 60;
  const timelineHeight = hours.length * calendarHourHeight;

  return (
    <div className={joinClasses('min-w-[780px] space-y-2', className)} {...props}>
      <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-1">
        <div aria-hidden="true" />
        {weekDates.map((date, index) => (
          <CalendarCell
            key={dateKey(date)}
            aria-label={`Sélectionner le ${formatFullDate(date)}`}
            selected={isSameDay(date, selected)}
            className="flex h-14 min-h-0 flex-col items-center justify-center text-center"
            onClick={() => onSelectDate?.(date)}
          >
            <span className="text-xs font-medium text-[var(--mairie-muted)]">{dayLabels[index]}</span>
            <span className="text-sm font-bold">{date.getDate()}</span>
          </CalendarCell>
        ))}
      </div>

      <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-1">
        <div className="relative" style={{ height: timelineHeight }}>
          {hours.map((hour, index) => (
            <div
              key={hour}
              className="absolute right-1 text-right text-xs leading-5 text-[var(--mairie-muted)]"
              style={{ top: index * calendarHourHeight + 6 }}
            >
              {hour}
            </div>
          ))}
        </div>

        {weekDates.map((date) => {
          const groups = getEventGroupsForDate(events, date, visibleStartMinutes, visibleEndMinutes);

          return (
            <div key={dateKey(date)} className="relative" style={{ height: timelineHeight }}>
              {hours.map((hour, index) => (
                <button
                  key={`${dateKey(date)}-${hour}`}
                  type="button"
                  aria-label={`${formatFullDate(date)} à ${hour}`}
                  className="absolute left-0 right-0 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] transition-colors hover:border-[var(--mairie-border)] hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/30"
                  style={{ top: index * calendarHourHeight, height: calendarHourHeight - 4 }}
                  onClick={() => onSelectSlot?.(date, hour)}
                />
              ))}

              {/* MAIR-1123: one readable event per overlapping group, at full width; « +N » opens the day. */}
              {groups.map(({ event, range, hiddenCount, endOffsetMinutes }) => {
                const top = (range.offsetMinutes / 60) * calendarHourHeight;
                const height = Math.max(40, ((hiddenCount ? endOffsetMinutes - range.offsetMinutes : range.durationMinutes) / 60) * calendarHourHeight - 4);

                return (
                  <React.Fragment key={`${event.id}-${dateKey(date)}-${range.startMinutes}`}>
                    <EventPill
                      event={event}
                      onClick={onEventClick}
                      compact
                      className={joinClasses(
                        'absolute z-10 shadow-sm',
                        !range.isStart && 'rounded-l-sm border-l-4 border-l-[var(--mairie-accent)]',
                        !range.isEnd && 'rounded-r-sm border-r-4 border-r-[var(--mairie-accent)]'
                      )}
                      style={{ top, height, left: 2, right: 2, paddingRight: hiddenCount ? '2.5rem' : undefined }}
                    />
                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        className="calendar-more-events absolute z-20 rounded-full border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-1.5 text-xs font-semibold leading-5 text-[var(--mairie-text)] hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]"
                        style={{ top: top + 4, right: 6 }}
                        aria-label={`${hiddenCount} autre${hiddenCount > 1 ? 's' : ''} rendez-vous le ${formatFullDate(date)}, ouvrir la vue Jour`}
                        onClick={() => onShowDay?.(date)}
                      >
                        +{hiddenCount}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
