import { getEventTimeRangeForDate } from '../../calendar-date';
import type { CalendarEvent, CalendarDateInput } from '../../calendar-types';

export const calendarHourHeight = 64;

type CalendarEventTimeRange = NonNullable<ReturnType<typeof getEventTimeRangeForDate>>;

interface PositionedEventCandidate {
  event: CalendarEvent;
  range: CalendarEventTimeRange;
}

export interface PositionedCalendarEvent extends PositionedEventCandidate {
  lane: number;
  laneCount: number;
}

const groupOverlappingEvents = (events: PositionedEventCandidate[]) => {
  const groups: PositionedEventCandidate[][] = [];
  let currentGroup: PositionedEventCandidate[] = [];
  let currentGroupEnd = 0;

  events.forEach((event) => {
    if (!currentGroup.length || event.range.startMinutes < currentGroupEnd) {
      currentGroup.push(event);
      currentGroupEnd = Math.max(currentGroupEnd, event.range.endMinutes);
      return;
    }

    groups.push(currentGroup);
    currentGroup = [event];
    currentGroupEnd = event.range.endMinutes;
  });

  if (currentGroup.length) {
    groups.push(currentGroup);
  }

  return groups;
};

const assignLanes = (events: PositionedEventCandidate[]): PositionedCalendarEvent[] => {
  const laneEndMinutes: number[] = [];
  const assignedEvents = events.map((event) => {
    const availableLane = laneEndMinutes.findIndex((endMinutes) => endMinutes <= event.range.startMinutes);
    const lane = availableLane === -1 ? laneEndMinutes.length : availableLane;
    laneEndMinutes[lane] = event.range.endMinutes;

    return {
      ...event,
      lane,
    };
  });
  const laneCount = Math.max(1, laneEndMinutes.length);

  return assignedEvents.map((event) => ({
    ...event,
    laneCount,
  }));
};

const sortedCandidatesForDate = (
  events: CalendarEvent[],
  date: CalendarDateInput,
  visibleStartMinutes: number,
  visibleEndMinutes: number
) =>
  events
    .map((event) => {
      const range = getEventTimeRangeForDate(event, date, visibleStartMinutes, visibleEndMinutes);
      return range ? { event, range } : null;
    })
    .filter((event): event is PositionedEventCandidate => Boolean(event))
    .sort((firstEvent, secondEvent) => {
      const startDiff = firstEvent.range.startMinutes - secondEvent.range.startMinutes;
      if (startDiff !== 0) return startDiff;

      return secondEvent.range.endMinutes - firstEvent.range.endMinutes;
    });

/** Day view: the events of `date`, overlapping ones side by side in lanes of their own group only. */
export const getPositionedEventsForDate = (
  events: CalendarEvent[],
  date: CalendarDateInput,
  visibleStartMinutes: number,
  visibleEndMinutes: number
) => groupOverlappingEvents(sortedCandidatesForDate(events, date, visibleStartMinutes, visibleEndMinutes)).flatMap(assignLanes);

export interface CalendarEventGroup extends PositionedEventCandidate {
  /** Events of the group hidden behind « +N »: the group minus the one shown. */
  hiddenCount: number;
  /** Bottom of the group, in minutes from the visible start, so the shown event covers the whole slot. */
  endOffsetMinutes: number;
}

/**
 * MAIR-1123, week view: one readable event per group of overlapping events (the earliest, the longest on a tie)
 * at the full width of the day, with the count of the others. A lone event is a group of one.
 */
export const getEventGroupsForDate = (
  events: CalendarEvent[],
  date: CalendarDateInput,
  visibleStartMinutes: number,
  visibleEndMinutes: number
): CalendarEventGroup[] =>
  groupOverlappingEvents(sortedCandidatesForDate(events, date, visibleStartMinutes, visibleEndMinutes)).map((group) => {
    const [shown] = group;
    const groupEnd = Math.max(...group.map((candidate) => candidate.range.endMinutes));
    return {
      ...shown,
      hiddenCount: group.length - 1,
      endOffsetMinutes: shown.range.offsetMinutes + (groupEnd - shown.range.startMinutes),
    };
  });
