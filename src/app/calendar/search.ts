import type { CalendarEventItem } from './types';

/** Lower case without accents, so « reunion » finds « Réunion ». */
function normalise(value: unknown): string {
  return typeof value === 'string' ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
}

/** MAIR-935 C1: an event matches the top-bar search when its title or location contains the query. */
export function matchesEventSearch(event: Pick<CalendarEventItem, 'title' | 'location'>, query: string): boolean {
  const needle = normalise(query.trim());
  if (!needle) return true;
  return normalise(event.title).includes(needle) || normalise(event.location).includes(needle);
}

/**
 * MAIR-935: the events of the views with `searchDimmed` on those that do not match (shown at 30 %, still
 * clickable); C2: no match dims everything, C3: an empty query dims nothing.
 */
export function applyEventSearch<Event extends CalendarEventItem>(events: Event[], query: string): Event[] {
  if (!query.trim()) return events;
  return events.map((event) => (matchesEventSearch(event, query) ? event : { ...event, searchDimmed: true }));
}
