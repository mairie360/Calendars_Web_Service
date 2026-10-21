import { weekDayOptions } from './constants';
import type { CalendarDateInput, CalendarEvent, CalendarRecurrence, CalendarStat } from './types';

const serverDateRegex = /^(\d{2})[-/](\d{2})[-/](\d{4})$/;
const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;

export const serverDatePattern = '\\d{2}-\\d{2}-\\d{4}';
export const serverDatePlaceholder = 'JJ-MM-AAAA';

const toLocalDate = (year: number, month: number, day: number) => new Date(year, month - 1, day);
const padDatePart = (value: number) => `${value}`.padStart(2, '0');

export const parseDateInput = (date: CalendarDateInput = new Date()) => {
  if (date instanceof Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  const normalizedDate = date.trim();
  const serverDateMatch = normalizedDate.match(serverDateRegex);
  if (serverDateMatch) {
    const [, day, month, year] = serverDateMatch;
    return toLocalDate(Number(year), Number(month), Number(day));
  }

  const dateOnlyMatch = normalizedDate.match(isoDateRegex);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return toLocalDate(Number(year), Number(month), Number(day));
  }

  const parsedDate = new Date(normalizedDate);
  return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
};

export const formatDateForServer = (date: CalendarDateInput) => {
  const parsedDate = parseDateInput(date);
  const day = padDatePart(parsedDate.getDate());
  const month = padDatePart(parsedDate.getMonth() + 1);
  const year = parsedDate.getFullYear();

  return `${day}-${month}-${year}`;
};

export const formatDateForInput = (date?: CalendarDateInput | null) => {
  if (!date) return '';

  const parsedDate = parseDateInput(date);
  if (Number.isNaN(parsedDate.getTime())) return '';

  const day = padDatePart(parsedDate.getDate());
  const month = padDatePart(parsedDate.getMonth() + 1);
  const year = parsedDate.getFullYear();

  return `${year}-${month}-${day}`;
};

export const normalizeDateForServer = (date?: CalendarDateInput | null) => {
  if (!date) return '';
  return formatDateForServer(date);
};

export const addDays = (date: Date, amount: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
};

export const addMonths = (date: Date, amount: number) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + amount);
  return nextDate;
};

export const isSameDay = (dateA: CalendarDateInput, dateB: CalendarDateInput) => {
  const firstDate = parseDateInput(dateA);
  const secondDate = parseDateInput(dateB);

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
};

export const getDayDiff = (dateA: CalendarDateInput, dateB: CalendarDateInput) => {
  const firstDate = parseDateInput(dateA).getTime();
  const secondDate = parseDateInput(dateB).getTime();
  return Math.round((firstDate - secondDate) / 86400000);
};

export const dateKey = (date: CalendarDateInput) => {
  return formatDateForServer(date);
};

export const startOfWeek = (date: Date, weekStartsOn: 0 | 1 = 1) => {
  const nextDate = parseDateInput(date);
  const day = nextDate.getDay();
  const diff = weekStartsOn === 1 ? (day === 0 ? -6 : 1 - day) : -day;
  return addDays(nextDate, diff);
};

export const getWeekDates = (date: Date, weekStartsOn: 0 | 1 = 1) => {
  const weekStart = startOfWeek(date, weekStartsOn);
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
};

export const formatMonthName = (date: CalendarDateInput, locale = 'fr-FR') => {
  const label = new Intl.DateTimeFormat(locale, { month: 'long' }).format(parseDateInput(date));
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const formatMonthYear = (date: CalendarDateInput, locale = 'fr-FR') => {
  const parsedDate = parseDateInput(date);
  return `${formatMonthName(parsedDate, locale)} ${parsedDate.getFullYear()}`;
};

export const formatFullDate = (date: CalendarDateInput, locale = 'fr-FR') => {
  const parsedDate = parseDateInput(date);
  return `${parsedDate.getDate()} ${formatMonthName(parsedDate, locale)} ${parsedDate.getFullYear()}`;
};

export const eventsByDate = (events: CalendarEvent[] = []) =>
  events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const key = dateKey(event.date);
    acc[key] = [...(acc[key] || []), event];
    return acc;
  }, {});

export const getMonthCells = (date: CalendarDateInput, weekStartsOn: 0 | 1 = 1) => {
  const parsedDate = parseDateInput(date);
  const firstDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
  const lastDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0);
  const leadingDays = weekStartsOn === 1 ? (firstDay.getDay() + 6) % 7 : firstDay.getDay();
  const totalDays = lastDay.getDate();
  const cellsCount = Math.ceil((leadingDays + totalDays) / 7) * 7;

  return Array.from({ length: cellsCount }, (_, index) => {
    const day = index - leadingDays + 1;
    return day >= 1 && day <= totalDays
      ? new Date(parsedDate.getFullYear(), parsedDate.getMonth(), day)
      : null;
  });
};

export const formatTimeLabel = (time?: string) => {
  if (!time) return null;

  const match = time.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) return null;

  const [, hours, minutes] = match;
  if (Number(hours) > 23 || Number(minutes) > 59) return null;

  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

export const getEventTimeLabel = (event: CalendarEvent) => {
  const startTime = formatTimeLabel(event.startTime);
  const endTime = formatTimeLabel(event.endTime);

  if (startTime && endTime) return `${startTime} – ${endTime}`;
  return startTime || endTime || null;
};

export const getEventDateLabel = (event: CalendarEvent) => {
  if (event.endDate && !isSameDay(event.date, event.endDate)) {
    return `${formatFullDate(event.date)} - ${formatFullDate(event.endDate)}`;
  }

  return formatFullDate(event.date);
};

export const timeToMinutes = (time?: string) => {
  if (!time) return 0;
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
};

export const getEventDurationMinutes = (event: CalendarEvent, fallbackMinutes = 60) => {
  if (!event.startTime || !event.endTime) return fallbackMinutes;

  const startMinutes = timeToMinutes(event.startTime);
  const endMinutes = timeToMinutes(event.endTime);
  const duration = endMinutes - startMinutes;

  return duration > 0 ? duration : fallbackMinutes;
};

export const getEventOffsetMinutes = (event: CalendarEvent, slotTime: string) => {
  if (!event.startTime) return 0;

  return Math.max(0, timeToMinutes(event.startTime) - timeToMinutes(slotTime));
};

const getEventSpanInDays = (event: CalendarEvent) =>
  Math.max(0, getDayDiff(event.endDate || event.date, event.date));

const monthDiff = (dateA: Date, dateB: Date) =>
  (dateA.getFullYear() - dateB.getFullYear()) * 12 + dateA.getMonth() - dateB.getMonth();

const isBaseOccurrenceStart = (event: CalendarEvent, date: CalendarDateInput) =>
  isSameDay(event.date, date);

const isRecurringOccurrenceStart = (event: CalendarEvent, date: CalendarDateInput) => {
  const recurrence = event.recurrence;
  if (!recurrence || recurrence.frequency === 'none') return false;

  const candidateDate = parseDateInput(date);
  const eventDate = parseDateInput(event.date);
  if (candidateDate.getTime() < eventDate.getTime()) return false;

  if (recurrence.endsOn && candidateDate.getTime() > parseDateInput(recurrence.endsOn).getTime()) {
    return false;
  }

  const interval = Math.max(1, recurrence.interval || 1);

  if (recurrence.frequency === 'daily') {
    return getDayDiff(candidateDate, eventDate) % interval === 0;
  }

  if (recurrence.frequency === 'weekly') {
    const weekDiff = Math.floor(getDayDiff(startOfWeek(candidateDate), startOfWeek(eventDate)) / 7);
    const matchingWeek = weekDiff >= 0 && weekDiff % interval === 0;
    const selectedDays = recurrence.daysOfWeek?.length ? recurrence.daysOfWeek : [eventDate.getDay()];
    return matchingWeek && selectedDays.includes(candidateDate.getDay());
  }

  if (recurrence.frequency === 'monthly') {
    const diff = monthDiff(candidateDate, eventDate);
    return diff >= 0 && diff % interval === 0 && candidateDate.getDate() === eventDate.getDate();
  }

  return false;
};

export const eventOccursOnDate = (event: CalendarEvent, date: CalendarDateInput) => {
  return Boolean(getEventOccurrenceStartDate(event, date));
};

export const getEventOccurrenceStartDate = (event: CalendarEvent, date: CalendarDateInput) => {
  const spanInDays = getEventSpanInDays(event);
  for (let offset = 0; offset <= spanInDays; offset += 1) {
    const possibleStartDate = addDays(parseDateInput(date), -offset);
    if (isBaseOccurrenceStart(event, possibleStartDate) || isRecurringOccurrenceStart(event, possibleStartDate)) {
      return possibleStartDate;
    }
  }

  return null;
};

export const getEventTimeRangeForDate = (
  event: CalendarEvent,
  date: CalendarDateInput,
  visibleStartMinutes = 0,
  visibleEndMinutes = 1440,
  fallbackMinutes = 60
) => {
  const occurrenceStartDate = getEventOccurrenceStartDate(event, date);
  if (!occurrenceStartDate) return null;

  const spanInDays = getEventSpanInDays(event);
  const occurrenceEndDate = addDays(occurrenceStartDate, spanInDays);
  const isStart = isSameDay(date, occurrenceStartDate);
  const isEnd = isSameDay(date, occurrenceEndDate);
  const startMinutes = isStart && event.startTime ? timeToMinutes(event.startTime) : visibleStartMinutes;
  let endMinutes = isEnd && event.endTime ? timeToMinutes(event.endTime) : visibleEndMinutes;

  if (isStart && isEnd && !event.endTime) {
    endMinutes = startMinutes + fallbackMinutes;
  }

  if (isStart && isEnd && endMinutes <= startMinutes) {
    endMinutes = startMinutes + fallbackMinutes;
  }

  const clippedStartMinutes = Math.max(visibleStartMinutes, startMinutes);
  const clippedEndMinutes = Math.min(visibleEndMinutes, endMinutes);

  if (clippedEndMinutes <= visibleStartMinutes || clippedStartMinutes >= visibleEndMinutes) {
    return null;
  }

  return {
    startMinutes: clippedStartMinutes,
    endMinutes: clippedEndMinutes,
    durationMinutes: Math.max(1, clippedEndMinutes - clippedStartMinutes),
    offsetMinutes: clippedStartMinutes - visibleStartMinutes,
    isStart,
    isEnd,
  };
};

export const eventStartsInSlot = (event: CalendarEvent, date: CalendarDateInput, slotTime: string) => {
  if (!eventOccursOnDate(event, date)) return false;
  if (!event.startTime) return true;

  const slotStartMinutes = timeToMinutes(slotTime);
  const slotEndMinutes = slotStartMinutes + 60;
  const eventStartMinutes = timeToMinutes(event.startTime);

  return eventStartMinutes >= slotStartMinutes && eventStartMinutes < slotEndMinutes;
};

export const getRecurrenceLabel = (recurrence?: CalendarRecurrence) => {
  if (!recurrence || recurrence.frequency === 'none') return 'Ne se répète pas';

  const interval = Math.max(1, recurrence.interval || 1);
  const suffix = recurrence.endsOn ? ` jusqu’au ${formatFullDate(recurrence.endsOn)}` : '';

  if (recurrence.frequency === 'daily') {
    return `${interval === 1 ? 'Tous les jours' : `Tous les ${interval} jours`}${suffix}`;
  }

  if (recurrence.frequency === 'weekly') {
    const selectedDays = recurrence.daysOfWeek?.length
      ? recurrence.daysOfWeek
          .map((day) => weekDayOptions.find((option) => option.value === day)?.label)
          .filter(Boolean)
          .join(', ')
      : 'chaque semaine';

    return `${interval === 1 ? 'Chaque semaine' : `Toutes les ${interval} semaines`} (${selectedDays})${suffix}`;
  }

  return `${interval === 1 ? 'Chaque mois' : `Tous les ${interval} mois`}${suffix}`;
};

export const getEventsForSlot = (events: CalendarEvent[], date: Date, time?: string) =>
  events.filter((event) => {
    if (!eventOccursOnDate(event, date)) return false;
    if (!time) return true;
    return eventStartsInSlot(event, date, time);
  });

export const getUpcomingEvents = (events: CalendarEvent[] = [], fromDate = new Date()) =>
  [...events]
    .filter((event) => {
      const from = parseDateInput(fromDate);
      const eventEnd = parseDateInput(event.endDate || event.recurrence?.endsOn || event.date);
      return eventEnd.getTime() >= from.getTime();
    })
    .sort((eventA, eventB) => {
      const dateDiff = parseDateInput(eventA.date).getTime() - parseDateInput(eventB.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (eventA.startTime || '').localeCompare(eventB.startTime || '');
    });

const countEventOccurrencesBetween = (events: CalendarEvent[], startDate: Date, endDate: Date) =>
  events.reduce((total, event) => {
    let occurrences = 0;

    for (let day = startDate; day.getTime() <= endDate.getTime(); day = addDays(day, 1)) {
      if (eventOccursOnDate(event, day)) {
        occurrences += 1;
      }
    }

    return total + occurrences;
  }, 0);

export const getDefaultStats = (events: CalendarEvent[] = [], selectedDate: Date): CalendarStat[] => {
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = addDays(weekStart, 6);
  const monthEventsCount = countEventOccurrencesBetween(events, monthStart, monthEnd);
  const weekEventsCount = countEventOccurrencesBetween(events, weekStart, weekEnd);
  const dayEventsCount = countEventOccurrencesBetween(events, selectedDate, selectedDate);

  return [
    { label: 'Ce mois', value: `${monthEventsCount} événement${monthEventsCount > 1 ? 's' : ''}` },
    { label: 'Cette semaine', value: `${weekEventsCount} événement${weekEventsCount > 1 ? 's' : ''}` },
    { label: 'Aujourd’hui', value: `${dayEventsCount} événement${dayEventsCount > 1 ? 's' : ''}` },
  ];
};
