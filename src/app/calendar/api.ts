import { BffRequestError } from "../../lib/bff-client";
import type { components } from '@/contracts/bff';
import { bffCalendar } from "@/lib/bff-client";
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

export async function loadCalendarData(params: CalendarLoadParams): Promise<CalendarData> {
  const { data: bootstrap } = await bffCalendar.getCalendarBootstrap(
    { from: params.from, to: params.to },
    { signal: params.signal },
  );

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
  const { data: event } = await bffCalendar.postCalendarEvents(eventBody(values));
  return toCalendarEventItem(event, people);
}

export async function updateCalendarEvent(
  event: CalendarEventItem,
  people: CalendarAssignee[],
) {
  const { data: savedEvent } = await bffCalendar.patchCalendarEventsId(encodeURIComponent(String(event.id)), eventBody(event));
  return toCalendarEventItem(savedEvent, people);
}

export async function deleteCalendarEvent(eventId: CalendarAssigneeId) {
  await bffCalendar.deleteCalendarEventsId(encodeURIComponent(String(eventId)));
}

export async function updateCalendarEventApproval(
  eventId: CalendarAssigneeId,
  approvalStatus: Schemas['UpdateCalendarEventApprovalBody']['approvalStatus'],
  people: CalendarAssignee[],
) {
  const { data: savedEvent } = await bffCalendar.patchCalendarEventsIdApproval(encodeURIComponent(String(eventId)), { approvalStatus });
  return toCalendarEventItem(savedEvent, people);
}

const FIELD_LABELS: Readonly<Record<string, string>> = {
  title: "Titre",
  description: "Description",
  location: "Lieu",
  service: "Service",
  category: "Catégorie",
  date: "Date de début",
  endDate: "Date de fin",
  startTime: "Heure de début",
  endTime: "Heure de fin",
  assigneeIds: "Participants",
  recurrence: "Récurrence",
  endsOn: "Fin de récurrence",
};

function translateDetail(message: string) {
  if (/Must not contain < or >/.test(message)) return "ne doit pas contenir les caractères < ou >";
  const max = message.match(/at most (\d+) character|<=(\d+) characters/);
  if (max) return `${max[1] ?? max[2]} caractères maximum`;
  if (/at least 1 character|^Required$/.test(message)) return "ne doit pas être vide";
  return message;
}

/** `body.recurrence.endsOn` → `Récurrence › Fin de récurrence : …` (details of a BFF 400, MAIR-514). */
export function describeValidationDetail(detail: unknown): string | null {
  if (!detail || typeof detail !== "object") return null;
  const { path, message } = detail as { path?: unknown; message?: unknown };
  if (typeof message !== "string") return null;
  const fields = typeof path === "string"
    ? path.split(".").filter((part) => part && part !== "body" && !/^\d+$/.test(part)).map((part) => FIELD_LABELS[part] ?? part)
    : [];
  const text = translateDetail(message);
  return fields.length ? `${fields.join(" › ")} : ${text}` : text;
}

export function formatCalendarApiError(error: unknown) {
  if (error instanceof BffRequestError && error.status === 400) {
    const details = (error.details as { error?: { details?: unknown } } | undefined)?.error?.details;
    const lines = Array.isArray(details) ? [...new Set(details.map(describeValidationDetail).filter((line): line is string => Boolean(line)))] : [];
    if (lines.length) return `Vérifiez les champs signalés : ${lines.join(" ; ")}.`;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Le service calendrier est injoignable.";
}
