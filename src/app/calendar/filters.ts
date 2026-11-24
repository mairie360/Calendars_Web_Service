import { urlDate, type UrlField } from '@/lib/page-url-state';
import type { CalendarEventItem } from './types';

/**
 * Filters of the calendar views: an optional « Du / Au » date range, several types (event categories) and one
 * service. They hide the events that do not match, while the top-bar search only dims; both combine.
 */
export type CalendarEventFilters = {
  /** First day, ISO `YYYY-MM-DD`, or '' for no lower bound. */
  from: string;
  /** Last day, ISO `YYYY-MM-DD`, or '' for no upper bound. */
  to: string;
  /** Categories kept; none means every type. */
  categories: string[];
  /** Service kept, or '' for every service. */
  service: string;
};

/** Days an event's occurrences must overlap to be shown (set by `applyEventFilters`). */
export type CalendarOccurrenceWindow = { from?: string; to?: string };

export const emptyCalendarFilters: CalendarEventFilters = { from: '', to: '', categories: [], service: '' };

const urlKeyList: UrlField = { defaultValue: '', accept: (value) => value.length <= 200 && /^[A-Za-z0-9_-]+(,[A-Za-z0-9_-]+)*$/.test(value) };
const urlKey: UrlField = { defaultValue: '', accept: (value) => value.length <= 100 && /^[A-Za-z0-9_-]+$/.test(value) };

/** URL parameters of the filters: `from`, `to`, `type` (comma-separated categories) and `service`. */
export const calendarFilterUrlSchema = { from: urlDate, to: urlDate, type: urlKeyList, service: urlKey } as const;

type ReferenceOption = { value: string };

const isKnown = (options: readonly ReferenceOption[], value: string) => options.length === 0 || options.some((option) => option.value === value);

/** Filters read from the URL state; values the BFF lists do not know are ignored, a reversed range is put back in order. */
export function readCalendarFilters(
  state: Readonly<Record<string, string | undefined>>,
  categories: readonly ReferenceOption[] = [],
  services: readonly ReferenceOption[] = [],
): CalendarEventFilters {
  let from = state.from || '';
  let to = state.to || '';
  if (from && to && from > to) [from, to] = [to, from];
  const types = (state.type || '').split(',').filter((value, index, all) => value && all.indexOf(value) === index && isKnown(categories, value));
  const service = state.service && isKnown(services, state.service) ? state.service : '';
  return { from, to, categories: types, service };
}

/** URL patch of the filters (an empty value removes its parameter). */
export function calendarFiltersToUrl(filters: CalendarEventFilters): Record<string, string> {
  return { from: filters.from, to: filters.to, type: filters.categories.join(','), service: filters.service };
}

/** Number of active filters: the date range counts once, then one per type, then the service. */
export function countActiveFilters(filters: CalendarEventFilters): number {
  return (filters.from || filters.to ? 1 : 0) + filters.categories.length + (filters.service ? 1 : 0);
}

/** Type and service of one event; an event without service only passes when no service is chosen. */
export function matchesEventFilters(event: Pick<CalendarEventItem, 'category' | 'service'>, filters: CalendarEventFilters): boolean {
  if (filters.categories.length > 0 && !filters.categories.includes(event.category || 'other')) return false;
  if (filters.service && event.service !== filters.service) return false;
  return true;
}

/**
 * The events kept by the type and service filters. With a date range, each kept event carries the range as
 * `occurrenceWindow`, so the views (recurrences included) only show its occurrences overlapping it.
 */
export function applyEventFilters<Event extends CalendarEventItem>(events: Event[], filters: CalendarEventFilters): Event[] {
  const occurrenceWindow = filters.from || filters.to ? { from: filters.from || undefined, to: filters.to || undefined } : undefined;
  const kept = filters.categories.length || filters.service ? events.filter((event) => matchesEventFilters(event, filters)) : events;
  return occurrenceWindow ? kept.map((event) => ({ ...event, occurrenceWindow })) : kept;
}

const isoDay = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** True when the occurrence starting on `start` and lasting `spanInDays` more days ends before or starts after the window. */
export function isOccurrenceOutsideWindow(window: CalendarOccurrenceWindow | undefined, start: Date, spanInDays: number): boolean {
  if (!window) return false;
  const first = isoDay(start);
  const last = isoDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + spanInDays));
  return Boolean((window.from && last < window.from) || (window.to && first > window.to));
}

/** Day the view moves to when the date range does not overlap the displayed period, else null. */
export function filterRangeOutsidePeriod(filters: CalendarEventFilters, periodFrom: string, periodTo: string): string | null {
  if ((filters.from && filters.from > periodTo) || (filters.to && filters.to < periodFrom)) return filters.from || filters.to;
  return null;
}
