import type { components } from '@/contracts/bff';
import { requestBff } from "@/lib/bff-client";
import { getEventColor, resolveAssignees } from "./constants";
import { formatDateForQuery } from "./date-utils";
import type {
  CalendarAssignee,
  CalendarAssigneeId,
  CalendarDateInput,
  CalendarEventItem,
  CreateCalendarEventValues,
} from "./types";

// Client de BFF_Calendar. Les réponses sont celles du contrat (contracts/openapi.json) : le BFF valide
// les entrées, calcule les droits (canEdit, canDelete, canValidate) et le périmètre des personnes
// assignables. Le front ne fait qu'adapter l'affichage.

type Schemas = components['schemas'];
type BffCalendarEvent = Schemas['CalendarEvent'];
type BffCalendarBootstrap = Schemas['CalendarBootstrapResponse'];
type BffCalendarEventBody = Schemas['CreateCalendarEventBody'];

export type CalendarReferenceOption = Schemas['CalendarCategory'];

export type CalendarData = {
  events: CalendarEventItem[];
  people: CalendarAssignee[];
  categories: CalendarReferenceOption[];
  services: CalendarReferenceOption[];
  currentUser?: BffCalendarBootstrap['currentUser'];
  assigneeScope?: BffCalendarBootstrap['assigneeScope'];
};

type CalendarLoadParams = {
  from: string;
  to: string;
  signal?: AbortSignal;
};

const EVENT_ENDPOINT = "/calendar/events";
const BOOTSTRAP_ENDPOINT = "/calendar/bootstrap";

function toCalendarEventItem(event: BffCalendarEvent, people: CalendarAssignee[]): CalendarEventItem {
  const assigneeIds = event.assigneeIds ?? [];

  return {
    ...event,
    // `id` est optionnel dans le schéma partagé avec la création, mais toujours renvoyé en lecture.
    id: event.id as CalendarAssigneeId,
    assigneeIds,
    assignees: event.assignees?.length ? event.assignees : resolveAssignees(assigneeIds, people),
    colorClassName: getEventColor(event.category),
  };
}

function toDateString(date: CalendarDateInput) {
  return date instanceof Date ? formatDateForQuery(date) : date;
}

function eventBody(event: CreateCalendarEventValues | CalendarEventItem): BffCalendarEventBody {
  return {
    title: String(event.title ?? ""),
    description: String(event.description ?? ""),
    date: toDateString(event.date),
    endDate: event.endDate ? toDateString(event.endDate) : undefined,
    category: (event.category || undefined) as BffCalendarEventBody['category'],
    service: event.service,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    assigneeIds: event.assigneeIds ?? [],
    recurrence: event.recurrence && {
      ...event.recurrence,
      endsOn: event.recurrence.endsOn ? toDateString(event.recurrence.endsOn) : undefined,
    },
  };
}

function eventPath(eventId: CalendarAssigneeId, suffix = "") {
  return `${EVENT_ENDPOINT}/${encodeURIComponent(String(eventId))}${suffix}`;
}

export async function loadCalendarData(params: CalendarLoadParams): Promise<CalendarData> {
  const query = new URLSearchParams({ from: params.from, to: params.to });
  const bootstrap = await requestBff<BffCalendarBootstrap>(`${BOOTSTRAP_ENDPOINT}?${query}`, { signal: params.signal });

  return {
    events: bootstrap.events.map((event) => toCalendarEventItem(event, bootstrap.assignees)),
    people: bootstrap.assignees,
    categories: bootstrap.categories,
    services: bootstrap.services,
    currentUser: bootstrap.currentUser,
    assigneeScope: bootstrap.assigneeScope,
  };
}

export async function createCalendarEvent(
  values: CreateCalendarEventValues,
  people: CalendarAssignee[],
) {
  const event = await requestBff<BffCalendarEvent>(EVENT_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(eventBody(values)),
  });
  return toCalendarEventItem(event, people);
}

export async function updateCalendarEvent(
  event: CalendarEventItem,
  people: CalendarAssignee[],
) {
  const savedEvent = await requestBff<BffCalendarEvent>(eventPath(event.id), {
    method: "PATCH",
    body: JSON.stringify(eventBody(event)),
  });
  return toCalendarEventItem(savedEvent, people);
}

export async function deleteCalendarEvent(eventId: CalendarAssigneeId) {
  await requestBff<void>(eventPath(eventId), { method: "DELETE" });
}

export async function updateCalendarEventApproval(
  eventId: CalendarAssigneeId,
  approvalStatus: Schemas['UpdateCalendarEventApprovalBody']['approvalStatus'],
  people: CalendarAssignee[],
) {
  const savedEvent = await requestBff<BffCalendarEvent>(eventPath(eventId, "/approval"), {
    method: "PATCH",
    body: JSON.stringify({ approvalStatus }),
  });
  return toCalendarEventItem(savedEvent, people);
}

export function formatCalendarApiError(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Le service calendrier est injoignable.";
}
