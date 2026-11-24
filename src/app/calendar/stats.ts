import { addDays, parseDateInput, startOfWeek } from "./date-utils";
import { isOccurrenceOutsideWindow } from "./filters";
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
      return isOccurrenceOutsideWindow(event.occurrenceWindow, possibleStartDate, spanInDays) ? null : possibleStartDate;
    }
  }

  return null;
}

export function eventOccursOnDate(event: CalendarEventItem, date: CalendarDateInput) {
  return Boolean(getEventOccurrenceStartDate(event, date));
}

/** MAIR-918: count of the displayed month for one category (one MetricCard). */
export interface CalendarCategoryStat {
  category: string;
  label: string;
  value: number;
}

export interface CalendarMonthStats {
  /** « novembre », for « N événements en novembre » and the « En novembre » trend. */
  month: string;
  total: number;
  items: CalendarCategoryStat[];
}

/** One upcoming occurrence of an event (recurrences expanded). */
export interface CalendarOccurrence {
  event: CalendarEventItem;
  date: Date;
}

const pluralCategoryLabels: Record<string, string> = {
  meeting: "Réunions",
  activity: "Animations",
  ceremony: "Cérémonies",
  other: "Autres",
};

/** Occurrence starts of the events between two days, inclusive. */
function occurrencesBetween(events: CalendarEventItem[], startDate: Date, endDate: Date) {
  const occurrences: CalendarOccurrence[] = [];
  for (let date = parseDateInput(startDate); date.getTime() <= endDate.getTime(); date = addDays(date, 1)) {
    for (const event of events) {
      const start = getEventOccurrenceStartDate(event, date);
      if (start && isSameDay(start, date)) occurrences.push({ event, date });
    }
  }
  return occurrences;
}

/** Number of occurrence starts of the events between two days, inclusive. */
export function countOccurrencesBetween(events: CalendarEventItem[], startDate: Date, endDate: Date) {
  return occurrencesBetween(events, startDate, endDate).length;
}

/**
 * MAIR-918 C3: occurrences of the displayed month per category of the API (« Réunions », « Animations »,
 * « Cérémonies », « Autres »), recomputed whenever the displayed month changes.
 */
export function buildStats(
  events: CalendarEventItem[],
  monthDate: Date,
  categories: Array<{ value: string; label: string }> = [],
): CalendarMonthStats {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const occurrences = occurrencesBetween(events, monthStart, monthEnd);
  const keys = categories.map((category) => category.value);
  for (const { event } of occurrences) {
    const key = event.category || "other";
    if (!keys.includes(key)) keys.push(key);
  }
  return {
    month: new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(monthStart),
    total: occurrences.length,
    items: keys.map((key) => ({
      category: key,
      label: pluralCategoryLabels[key] ?? categories.find((category) => category.value === key)?.label ?? key,
      value: occurrences.filter(({ event }) => (event.category || "other") === key).length,
    })),
  };
}

/**
 * MAIR-918 C2: the next `limit` occurrences from now (recurrences included); an event of today stays
 * listed until its end time.
 */
export function getUpcomingOccurrences(events: CalendarEventItem[], now: Date, today: Date, limit = 3, horizonDays = 366) {
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const upcoming: CalendarOccurrence[] = [];
  for (let offset = 0; offset < horizonDays && upcoming.length < limit; offset += 1) {
    const date = addDays(today, offset);
    const ofDay = occurrencesBetween(events, date, date)
      .filter(({ event }) => offset > 0 || !event.endTime || event.endTime > time)
      .sort((first, second) => (first.event.startTime || "").localeCompare(second.event.startTime || ""));
    upcoming.push(...ofDay.slice(0, limit - upcoming.length));
  }
  return upcoming;
}

