// Field projection derived from the pinned published CalendarBootstrapResponse response.
import { boolean, choice, dictionary, integer, list, number, optional, pattern, ranged, record, text, union } from './receipt-readers';
const dto2 = record({ "id": union(text, number), "name": text, "email": optional(text), "role": optional(text), "avatarUrl": optional(text) });
const dto3 = record({ "frequency": choice(["none", "daily", "weekly", "monthly"]), "interval": optional(ranged(integer, 1, Infinity)), "daysOfWeek": optional(list(ranged(integer, 0, 6))), "endsOn": optional(pattern(new RegExp("^(?:(\\d{4})-(\\d{2})-(\\d{2})|(\\d{2})[-/](\\d{2})[-/](\\d{4}))$"))) });
const dto1 = record({ "id": optional(union(text, number)), "title": pattern(new RegExp("^[^<>]*$")), "date": pattern(new RegExp("^(?:(\\d{4})-(\\d{2})-(\\d{2})|(\\d{2})[-/](\\d{2})[-/](\\d{4}))$")), "endDate": optional(pattern(new RegExp("^(?:(\\d{4})-(\\d{2})-(\\d{2})|(\\d{2})[-/](\\d{2})[-/](\\d{4}))$"))), "category": optional(choice(["meeting", "activity", "ceremony", "other"])), "service": optional(pattern(new RegExp("^[^<>]*$"))), "startTime": optional(pattern(new RegExp("^([01]\\d|2[0-3]):[0-5]\\d$"))), "endTime": optional(pattern(new RegExp("^([01]\\d|2[0-3]):[0-5]\\d$"))), "location": optional(pattern(new RegExp("^[^<>]*$"))), "description": optional(pattern(new RegExp("^[^<>]*$"))), "assigneeIds": optional(list(union(text, number))), "assignees": optional(list(dto2)), "recurrence": optional(dto3), "approvalStatus": optional(choice(["pending", "approved", "rejected"])), "createdById": optional(union(text, number)), "canValidate": optional(boolean), "canEdit": optional(boolean), "canDelete": optional(boolean), "visibleToRoles": optional(list(choice(["user", "responsable", "mayor"]))) });
const dto4 = dictionary(dto2);
const dto5 = record({ "label": text, "value": text });
const dto6 = record({ "label": text, "value": text });
const dto0 = record({ "events": list(dto1), "users": dto4, "assignees": list(dto2), "categories": list(dto5), "services": list(dto6), "currentUser": optional(record({ "id": union(text, number), "name": text, "email": text, "role": optional(text), "groupIds": list(integer) })), "assigneeScope": optional(choice(["all", "groups", "self"])) });

export const readCalendarBootstrapResponse = dto0;

import type { components } from '@/contracts/bff';
import type { CalendarPageQuery } from '@/app/calendar/page-query';
export type CalendarBootstrapReceipt = components['schemas']['CalendarBootstrapResponse'];
export function parseCalendarBootstrapReceipt(value: unknown): CalendarBootstrapReceipt {
  const data = readCalendarBootstrapResponse(value) as CalendarBootstrapReceipt;
  const ids = data.events.map(event => event.id);
  if (ids.some(id => id === undefined || typeof id === 'string' && !id.trim()) || new Set(ids.map(String)).size !== ids.length) throw new Error('Les événements reçus ne sont pas cohérents.');
  return data;
}
export type InitialCalendarPage = { status: 'confirmed'; data: CalendarBootstrapReceipt; query: CalendarPageQuery } | { status: 'unavailable'; message: string };
export const CALENDAR_INITIAL_UNAVAILABLE = 'Le premier chargement du calendrier est indisponible. Réessayez dans cette page.';
