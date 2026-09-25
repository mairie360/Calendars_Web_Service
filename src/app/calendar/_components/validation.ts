import type { CreateCalendarEventValues } from '../types';

export type EventChronology = Pick<
  CreateCalendarEventValues,
  'date' | 'endDate' | 'startTime' | 'endTime' | 'recurrence'
>;

function dayNumber(value: string): number | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const french = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(value);
  if (!iso && !french) return null;

  const year = Number(iso?.[1] ?? french?.[3]);
  const month = Number(iso?.[2] ?? french?.[2]);
  const day = Number(iso?.[3] ?? french?.[1]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null;

  return date.getTime();
}

function timeNumber(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

export function validateEventChronology(values: EventChronology): string | null {
  const start = dayNumber(values.date);
  if (start === null) return 'La date de début est invalide.';

  const recurring = values.recurrence.frequency !== 'none';
  const end = recurring ? start : dayNumber(values.endDate || values.date);
  if (end === null) return 'La date de fin est invalide.';
  if (end < start) return 'La date de fin doit être après la date de début.';

  if (recurring && values.recurrence.endsOn) {
    const recurrenceEnd = dayNumber(String(values.recurrence.endsOn));
    if (recurrenceEnd === null) return 'La fin de récurrence est invalide.';
    if (recurrenceEnd < start) return 'La fin de récurrence doit être après la date de début.';
  }

  if (end === start && values.startTime && values.endTime) {
    const startTime = timeNumber(values.startTime);
    const endTime = timeNumber(values.endTime);
    if (startTime === null || endTime === null || endTime <= startTime) {
      return 'L’heure de fin doit être après l’heure de début.';
    }
  }

  return null;
}
