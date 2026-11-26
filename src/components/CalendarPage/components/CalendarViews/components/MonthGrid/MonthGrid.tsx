import React, { useMemo } from 'react';

import { CalendarCell } from '../CalendarCell';
import { defaultDayLabels } from '@/components/CalendarPage/calendar-constants';
import {
  dateKey,
  eventOccursOnDate,
  formatFullDate,
  getMonthCells,
  isSameDay,
  parseDateInput,
} from '@/components/CalendarPage/calendar-date';
import { EventPill } from '../EventPill';
import { joinClasses } from '@/components/CalendarPage/calendar-style';
import type { CalendarEvent, MonthGridProps } from '@/components/CalendarPage/calendar-types';

export type { CalendarDateInput, CalendarEvent, MonthGridProps } from '@/components/CalendarPage/calendar-types';

/** Mockup `Calendrier/MonthCell`: a fixed height, the day number on top, then at most three rows of events. */
const weekHeight = 104;
const dayHeaderHeight = 34;
const eventRowHeight = 18;
const eventRowGap = 2;
const maxRows = 3;

/** One week's days and the events of each, in start-time order. */
const getDayEvents = (events: CalendarEvent[], weekCells: Array<Date | null>) =>
  weekCells.map((date) => (date
    ? events.filter((event) => eventOccursOnDate(event, date))
      .sort((first, second) => (first.startTime || '00:00').localeCompare(second.startTime || '00:00') || String(first.id).localeCompare(String(second.id)))
    : []));

/**
 * What a day shows within its rows: a lone event takes two rows (title, then start time); up to three events one row
 * each; past three, the first two and « + N » for the others.
 */
export const getMonthDayLayout = (count: number) => {
  if (count <= maxRows) return { shown: count, hidden: 0, twoLines: count === 1 };
  return { shown: maxRows - 1, hidden: count - (maxRows - 1), twoLines: false };
};

const getWeeks = (cells: Array<Date | null>) =>
  Array.from({ length: Math.ceil(cells.length / 7) }, (_, index) => cells.slice(index * 7, index * 7 + 7));

const monthEventClassName = 'pointer-events-auto mx-2 py-px shadow-sm';

export const MonthGrid = ({
  currentDate,
  selectedDate,
  events = [],
  weekStartsOn = 1,
  dayLabels = defaultDayLabels,
  onSelectDate,
  onEventClick,
  onShowDay,
  className = '',
  ...props
}: MonthGridProps) => {
  const parsedDate = parseDateInput(currentDate);
  const selected = selectedDate ? parseDateInput(selectedDate) : parsedDate;
  const cells = useMemo(() => getMonthCells(parsedDate, weekStartsOn), [parsedDate, weekStartsOn]);
  const weeks = useMemo(() => getWeeks(cells), [cells]);
  const weekDays = useMemo(() => weeks.map((week) => getDayEvents(events, week)), [events, weeks]);
  // MAIR-905: days of the adjacent months fill the first and last weeks (Outside cells).
  const leadingDays = cells.findIndex(Boolean);
  const outsideDate = (weekIndex: number, index: number) =>
    new Date(parsedDate.getFullYear(), parsedDate.getMonth(), weekIndex * 7 + index - leadingDays + 1);

  return (
    <div className={joinClasses('space-y-3', className)} {...props}>
      <div className="grid grid-cols-7 gap-1.5">
        {dayLabels.map((label) => (
          <div key={label} className="px-2 text-center text-sm font-medium leading-6 text-[var(--mairie-muted)]">
            {label}
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {weeks.map((week, weekIndex) => {
          const days = weekDays[weekIndex] || [];

          return (
            <div key={`week-${weekIndex}`} className="relative" style={{ height: weekHeight }}>
              <div className="absolute inset-0 z-0 grid grid-cols-7 gap-1.5">
                {week.map((date, index) =>
                  date ? (
                    <CalendarCell
                      key={dateKey(date)}
                      day={date.getDate()}
                      aria-label={`Sélectionner le ${formatFullDate(date)}`}
                      aria-haspopup="dialog"
                      selected={isSameDay(date, selected)}
                      className="h-full min-h-0"
                      onClick={() => onSelectDate?.(date)}
                    />
                  ) : (
                    <CalendarCell key={`outside-${weekIndex}-${index}`} outside day={outsideDate(weekIndex, index).getDate()} className="h-full min-h-0" />
                  )
                )}
              </div>

              <div
                className="pointer-events-none absolute inset-x-0 z-20 grid grid-cols-7 gap-x-1.5"
                style={{ top: dayHeaderHeight, rowGap: eventRowGap, gridTemplateRows: `repeat(${maxRows}, ${eventRowHeight}px)` }}
              >
                {days.flatMap((dayEvents, column) => {
                  const date = week[column];
                  if (!date || dayEvents.length === 0) return [];
                  const { shown, hidden, twoLines } = getMonthDayLayout(dayEvents.length);
                  const pills = dayEvents.slice(0, shown).map((event, row) => (
                    <EventPill
                      key={`${event.id}-${dateKey(date)}`}
                      event={event}
                      onClick={onEventClick}
                      showTime={twoLines}
                      startOnly
                      className={monthEventClassName}
                      style={{ gridColumn: column + 1, gridRow: twoLines ? '1 / span 2' : row + 1 }}
                    />
                  ));
                  if (!hidden) return pills;
                  return [...pills, (
                    <button
                      key={`more-${dateKey(date)}`}
                      type="button"
                      className="calendar-more-events pointer-events-auto mx-2 justify-self-start rounded-full px-1.5 text-xs font-semibold leading-[18px] text-[var(--mairie-accent)] hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]"
                      style={{ gridColumn: column + 1, gridRow: maxRows }}
                      aria-label={`Plus d’événements le ${formatFullDate(date)} : ${hidden} autre${hidden > 1 ? 's' : ''}, ouvrir la vue Jour`}
                      onClick={() => onShowDay?.(date)}
                    >
                      + {hidden}
                    </button>
                  )];
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
