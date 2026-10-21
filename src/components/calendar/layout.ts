import { getEventTimeRangeForDate } from './date';
import type { CalendarEvent, CalendarDateInput } from './types';

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

export const getPositionedEventsForDate = (
  events: CalendarEvent[],
  date: CalendarDateInput,
  visibleStartMinutes: number,
  visibleEndMinutes: number
) => {
  const positionedEvents = events
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

  return groupOverlappingEvents(positionedEvents).flatMap(assignLanes);
};
