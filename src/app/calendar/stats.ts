import { addDays, parseDateInput, startOfWeek } from "./date-utils";
import type { CalendarDateInput, CalendarEventItem } from "./types";

function isSameDay(firstDate: CalendarDateInput, secondDate: CalendarDateInput) {
  const first = parseDateInput(firstDate);
  const second = parseDateInput(secondDate);
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getDayDiff(firstDate: CalendarDateInput, secondDate: CalendarDateInput) {
  return Math.round((parseDateInput(firstDate).getTime() - parseDateInput(secondDate).getTime()) / 864e5);
}

function monthDiff(firstDate: Date, secondDate: Date) {
  return (firstDate.getFullYear() - secondDate.getFullYear()) * 12 + firstDate.getMonth() - secondDate.getMonth();
}

function getEventSpanInDays(event: CalendarEventItem) {
  return Math.max(0, getDayDiff(event.endDate || event.date, event.date));
}

function isBaseOccurrenceStart(event: CalendarEventItem, date: CalendarDateInput) {
  return isSameDay(event.date, date);
}

function isRecurringOccurrenceStart(event: CalendarEventItem, date: CalendarDateInput) {
  const recurrence = event.recurrence;
  if (!recurrence || recurrence.frequency === "none") return false;

  const candidateDate = parseDateInput(date);
  const eventDate = parseDateInput(event.date);
  if (candidateDate.getTime() < eventDate.getTime()) return false;

  if (recurrence.endsOn && candidateDate.getTime() > parseDateInput(recurrence.endsOn).getTime()) {
    return false;
  }

  const interval = Math.max(1, recurrence.interval || 1);

  if (recurrence.frequency === "daily") {
    return getDayDiff(candidateDate, eventDate) % interval === 0;
  }

  if (recurrence.frequency === "weekly") {
    const weekDiff = Math.floor(getDayDiff(startOfWeek(candidateDate), startOfWeek(eventDate)) / 7);
    const selectedDays = recurrence.daysOfWeek?.length ? recurrence.daysOfWeek : [eventDate.getDay()];
    return weekDiff >= 0 && weekDiff % interval === 0 && selectedDays.includes(candidateDate.getDay());
  }

  const diff = monthDiff(candidateDate, eventDate);
  return diff >= 0 && diff % interval === 0 && candidateDate.getDate() === eventDate.getDate();
}

function getEventOccurrenceStartDate(event: CalendarEventItem, date: CalendarDateInput) {
  const spanInDays = getEventSpanInDays(event);

  for (let offset = 0; offset <= spanInDays; offset += 1) {
    const possibleStartDate = addDays(date, -offset);
    if (isBaseOccurrenceStart(event, possibleStartDate) || isRecurringOccurrenceStart(event, possibleStartDate)) {
      return possibleStartDate;
    }
  }

  return null;
}

export function eventOccursOnDate(event: CalendarEventItem, date: CalendarDateInput) {
  return Boolean(getEventOccurrenceStartDate(event, date));
}

function countEventsBetween(events: CalendarEventItem[], startDate: Date, endDate: Date) {
  let count = 0;

  for (let date = parseDateInput(startDate); date.getTime() <= endDate.getTime(); date = addDays(date, 1)) {
    count += events.filter((event) => eventOccursOnDate(event, date)).length;
  }

  return count;
}

function eventLabel(count: number) {
  return `${count} événement${count > 1 ? "s" : ""}`;
}

export function buildStats(events: CalendarEventItem[], selectedDate: Date) {
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = addDays(weekStart, 6);

  return [
    { label: "Ce mois", value: eventLabel(countEventsBetween(events, monthStart, monthEnd)) },
    { label: "Cette semaine", value: eventLabel(countEventsBetween(events, weekStart, weekEnd)) },
    { label: "Aujourd'hui", value: eventLabel(countEventsBetween(events, selectedDate, selectedDate)) },
  ];
}
