import type { CalendarDateInput, CalendarViewMode } from "./types";

export function parseDateInput(date: CalendarDateInput = new Date()) {
  if (date instanceof Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  const normalizedDate = date.trim();
  const serverDateMatch = normalizedDate.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (serverDateMatch) {
    const [, day, month, year] = serverDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const isoDateMatch = normalizedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsedDate = new Date(normalizedDate);
  return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
}

export function addDays(date: CalendarDateInput, amount: number) {
  const nextDate = parseDateInput(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

export function addMonths(date: CalendarDateInput, amount: number) {
  const parsedDate = parseDateInput(date);
  return new Date(parsedDate.getFullYear(), parsedDate.getMonth() + amount, 1);
}

export function formatDateForServer(date: CalendarDateInput) {
  const parsedDate = parseDateInput(date);
  const day = `${parsedDate.getDate()}`.padStart(2, "0");
  const month = `${parsedDate.getMonth() + 1}`.padStart(2, "0");
  const year = parsedDate.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatMonthYear(date: CalendarDateInput) {
  const parsedDate = parseDateInput(date);
  const month = new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(parsedDate);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${parsedDate.getFullYear()}`;
}

export function formatFullDate(date: CalendarDateInput) {
  const parsedDate = parseDateInput(date);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export function startOfWeek(date: CalendarDateInput) {
  const parsedDate = parseDateInput(date);
  const day = parsedDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(parsedDate, diff);
}

export function getPeriodTitle(view: CalendarViewMode, date: CalendarDateInput) {
  if (view === "week") {
    return `Semaine du ${formatFullDate(startOfWeek(date))}`;
  }

  if (view === "day") {
    return formatFullDate(date);
  }

  return formatMonthYear(date);
}

export function getPreviousPeriod(date: CalendarDateInput, view: CalendarViewMode) {
  if (view === "month") return addMonths(date, -1);
  if (view === "week") return addDays(date, -7);
  return addDays(date, -1);
}

export function getNextPeriod(date: CalendarDateInput, view: CalendarViewMode) {
  if (view === "month") return addMonths(date, 1);
  if (view === "week") return addDays(date, 7);
  return addDays(date, 1);
}

function addOneHour(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");
  const date = new Date(2026, 0, 1, Number(hours), Number(minutes));
  date.setHours(date.getHours() + 1);
  return `${date.getHours()}`.padStart(2, "0") + ":" + `${date.getMinutes()}`.padStart(2, "0");
}

export function buildCreateInitialValues(date: CalendarDateInput, startTime = "09:00") {
  return {
    date: formatDateForServer(date),
    endDate: "",
    startTime,
    endTime: addOneHour(startTime),
  };
}
