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

const dayCellMinHeight = 144;
const dayHeaderHeight = 44;
const eventRowHeight = 34;

interface MonthEventSegment {
  event: CalendarEvent;
  startColumn: number;
  endColumn: number;
}

interface PositionedMonthEventSegment extends MonthEventSegment {
  lane: number;
}

const getWeeks = (cells: Array<Date | null>) =>
  Array.from({ length: Math.ceil(cells.length / 7) }, (_, index) => cells.slice(index * 7, index * 7 + 7));

const sortMonthSegments = (segments: MonthEventSegment[]) =>
  [...segments].sort((firstSegment, secondSegment) => {
    const firstTime = firstSegment.event.startTime || '00:00';
    const secondTime = secondSegment.event.startTime || '00:00';
    const timeDiff = firstTime.localeCompare(secondTime);

    if (timeDiff !== 0) return timeDiff;

    const startDiff = firstSegment.startColumn - secondSegment.startColumn;
    if (startDiff !== 0) return startDiff;

    return String(firstSegment.event.id).localeCompare(String(secondSegment.event.id));
  });

const positionMonthSegments = (segments: MonthEventSegment[]): PositionedMonthEventSegment[] => {
  const laneEndColumns: number[] = [];

  return sortMonthSegments(segments).map((segment) => {
    const lane = laneEndColumns.findIndex((endColumn) => endColumn <= segment.startColumn);
    const resolvedLane = lane === -1 ? laneEndColumns.length : lane;
    laneEndColumns[resolvedLane] = segment.endColumn;

    return {
      ...segment,
      lane: resolvedLane,
    };
  });
};

const getWeekEventSegments = (events: CalendarEvent[], weekCells: Array<Date | null>) => {
  const segments: MonthEventSegment[] = [];

  events.forEach((event) => {
    for (let column = 0; column < weekCells.length; column += 1) {
      const date = weekCells[column];
      if (date && eventOccursOnDate(event, date)) {
        segments.push({
          event,
          startColumn: column,
          endColumn: column + 1,
        });
      }
    }
  });

  return positionMonthSegments(segments);
};

const monthEventClassName = joinClasses('pointer-events-auto mx-1 flex h-8 items-center py-0 shadow-sm');

export const MonthGrid = ({
  currentDate,
  selectedDate,
  events = [],
  weekStartsOn = 1,
  dayLabels = defaultDayLabels,
  onSelectDate,
  onEventClick,
  className = '',
  ...props
}: MonthGridProps) => {
  const parsedDate = parseDateInput(currentDate);
  const selected = selectedDate ? parseDateInput(selectedDate) : parsedDate;
  const cells = useMemo(() => getMonthCells(parsedDate, weekStartsOn), [parsedDate, weekStartsOn]);
  const weeks = useMemo(() => getWeeks(cells), [cells]);
  const weekSegments = useMemo(() => weeks.map((week) => getWeekEventSegments(events, week)), [events, weeks]);
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
          const segments = weekSegments[weekIndex] || [];
          const laneCount = Math.max(0, ...segments.map((segment) => segment.lane + 1));
          const weekHeight = Math.max(dayCellMinHeight, dayHeaderHeight + laneCount * eventRowHeight + 8);

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
                className="pointer-events-none absolute inset-x-0 z-20 grid grid-cols-7 gap-x-1.5 gap-y-1"
                style={{ top: dayHeaderHeight, gridAutoRows: `${eventRowHeight - 4}px` }}
              >
                {segments.map((segment) => (
                  <EventPill
                    key={`${segment.event.id}-${weekIndex}-${segment.startColumn}-${segment.endColumn}-${segment.lane}`}
                    event={segment.event}
                    onClick={onEventClick}
                    inline
                    // MAIR-905: the start time only while the day holds a single event.
                    showTime={segments.filter((other) => other.startColumn === segment.startColumn).length < 2}
                    className={monthEventClassName}
                    style={{
                      gridColumn: `${segment.startColumn + 1} / span ${segment.endColumn - segment.startColumn}`,
                      gridRow: segment.lane + 1,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
