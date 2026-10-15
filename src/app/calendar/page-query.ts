import { civilDateInZone, instanceTimeZone } from '@mairie360/front-kit/shared';
import { readPageUrlState, urlChoice, urlDate, urlText } from '@/lib/page-url-state';
import type { CalendarViewMode } from './types';
export const calendarUrlSchema = { view: urlChoice(['month', 'week', 'day'], 'month'), date: urlDate };
export type CalendarPageQuery = { view: CalendarViewMode; date: string; linkedDate: boolean; eventId: string | null };
export function readCalendarPageQuery(search: string, today: string): CalendarPageQuery {
  const state = readPageUrlState(search, calendarUrlSchema);
  const params = new URLSearchParams(search);
  const events = params.getAll('event');
  return { view: state.view as CalendarViewMode, date: state.date || today, linkedDate: Boolean(state.date),
    eventId: state.date && events.length === 1 && urlText(200).accept(events[0]) ? events[0] || null : null };
}
export function serverCalendarQuery(params: Record<string, string | string[] | undefined>, instant = new Date()) {
  const query = new URLSearchParams();
  for (const [key, values] of Object.entries(params)) for (const value of Array.isArray(values) ? values : values === undefined ? [] : [values]) query.append(key, value);
  return readCalendarPageQuery(query.toString(), civilDateInZone(instant, instanceTimeZone(process.env.INSTANCE_TIMEZONE)));
}
