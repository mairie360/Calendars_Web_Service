import { BffRequestError, requestBff } from "@/lib/bff-client";
import { getEventColor, resolveAssignees } from "./constants";
import type {
  CalendarAssignee,
  CalendarAssigneeId,
  CalendarEventItem,
  CalendarRecurrence,
  CreateCalendarEventValues,
} from "./types";

export type CalendarReferenceOption = {
  label: string;
  value: string;
};

export type CalendarData = {
  events: CalendarEventItem[];
  people: CalendarAssignee[];
  categories: CalendarReferenceOption[];
  services: CalendarReferenceOption[];
  currentUser?: {
    id: CalendarAssigneeId;
    name: string;
    email: string;
    role?: string;
    groupIds: number[];
  };
  assigneeScope?: "all" | "groups" | "self";
};

type CalendarLoadParams = {
  from: string;
  to: string;
  signal?: AbortSignal;
};

const EVENT_ENDPOINT = "/calendar/events";
const BOOTSTRAP_ENDPOINT = "/calendar/bootstrap";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toStringValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function toCalendarId(value: unknown): CalendarAssigneeId | undefined {
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

function normalizeReferenceOptions(value: unknown): CalendarReferenceOption[] {
  if (!Array.isArray(value)) return [];

  const options = value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const optionValue = toStringValue(item.value);
    const label = toStringValue(item.label);
    return optionValue && label ? [{ label, value: optionValue }] : [];
  });

  return options;
}

function normalizePeople(value: unknown): CalendarAssignee[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const id = toCalendarId(item.id);
    const name = toStringValue(item.name);

    if (id === undefined || !name) return [];

    return [{
      id,
      name,
      email: toStringValue(item.email),
      role: toStringValue(item.role),
      avatarUrl: toStringValue(item.avatarUrl),
    }];
  });
}

function normalizeRecurrence(value: unknown): CalendarRecurrence | undefined {
  if (!isRecord(value)) return undefined;
  const frequency = toStringValue(value.frequency);

  if (!frequency || !["none", "daily", "weekly", "monthly"].includes(frequency)) {
    return undefined;
  }

  const interval = Number(value.interval);
  const daysOfWeek = Array.isArray(value.daysOfWeek)
    ? value.daysOfWeek
        .map(Number)
        .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    : undefined;

  return {
    frequency: frequency as CalendarRecurrence["frequency"],
    interval: Number.isFinite(interval) && interval >= 1 ? interval : undefined,
    daysOfWeek,
    endsOn: toStringValue(value.endsOn),
  };
}

function normalizeEvent(value: unknown, people: CalendarAssignee[]): CalendarEventItem | null {
  if (!isRecord(value)) return null;
  const id = toCalendarId(value.id);
  const title = toStringValue(value.title);
  const date = toStringValue(value.date);

  if (id === undefined || !title || !date) return null;

  const category = toStringValue(value.category);
  const assigneeIds = Array.isArray(value.assigneeIds)
    ? value.assigneeIds
        .map(toCalendarId)
        .filter((assigneeId): assigneeId is CalendarAssigneeId => assigneeId !== undefined)
    : [];
  const eventAssignees = normalizePeople(value.assignees);

  return {
    id,
    title,
    date,
    endDate: toStringValue(value.endDate),
    category,
    service: toStringValue(value.service),
    startTime: toStringValue(value.startTime),
    endTime: toStringValue(value.endTime),
    location: toStringValue(value.location),
    description: toStringValue(value.description),
    assigneeIds,
    assignees: eventAssignees.length > 0
      ? eventAssignees
      : resolveAssignees(assigneeIds, people),
    recurrence: normalizeRecurrence(value.recurrence),
    approvalStatus:
      value.approvalStatus === "pending" ||
      value.approvalStatus === "approved" ||
      value.approvalStatus === "rejected"
        ? value.approvalStatus
        : undefined,
    createdById: toCalendarId(value.createdById),
    canValidate: value.canValidate === true,
    canEdit: value.canEdit === true,
    canDelete: value.canDelete === true,
    colorClassName: getEventColor(category),
  };
}

function normalizeCurrentUser(value: unknown): CalendarData["currentUser"] {
  if (!isRecord(value)) return undefined;

  const id = toCalendarId(value.id);
  const name = toStringValue(value.name);
  const email = toStringValue(value.email);
  if (id === undefined || !name || !email) return undefined;

  return {
    id,
    name,
    email,
    role: toStringValue(value.role),
    groupIds: Array.isArray(value.groupIds)
      ? value.groupIds.map(Number).filter(Number.isInteger)
      : [],
  };
}

function normalizeEvents(value: unknown, people: CalendarAssignee[]) {
  if (!Array.isArray(value)) return [];
  return value
    .map((event) => normalizeEvent(event, people))
    .filter((event): event is CalendarEventItem => event !== null);
}

function eventPayload(event: CreateCalendarEventValues | CalendarEventItem) {
  return {
    title: typeof event.title === "string" ? event.title : String(event.title ?? ""),
    description:
      typeof event.description === "string"
        ? event.description
        : String(event.description ?? ""),
    date: event.date instanceof Date ? event.date.toISOString().slice(0, 10) : event.date,
    endDate:
      event.endDate instanceof Date
        ? event.endDate.toISOString().slice(0, 10)
        : event.endDate || undefined,
    category: event.category || undefined,
    service: event.service,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    assigneeIds: event.assigneeIds ?? [],
    recurrence: event.recurrence,
  };
}

function queryString(params: Record<string, string>) {
  return `?${new URLSearchParams(params).toString()}`;
}

async function loadBootstrap(params: CalendarLoadParams) {
  return requestBff<unknown>(
    `${BOOTSTRAP_ENDPOINT}${queryString({ from: params.from, to: params.to })}`,
    { signal: params.signal },
  );
}

async function loadEvents(params: CalendarLoadParams) {
  return requestBff<unknown>(
    `${EVENT_ENDPOINT}${queryString({ from: params.from, to: params.to })}`,
    { signal: params.signal },
  );
}

async function loadCollection(path: string, signal?: AbortSignal) {
  return requestBff<unknown>(path, { signal });
}

export async function loadCalendarData(params: CalendarLoadParams): Promise<CalendarData> {
  let response: unknown;

  try {
    response = await loadBootstrap(params);
  } catch (error) {
    if (!(error instanceof BffRequestError) || ![404, 405, 501].includes(error.status)) {
      throw error;
    }

    const [events, assignees, categories, services] = await Promise.all([
      loadEvents(params),
      loadCollection("/calendar/assignees", params.signal),
      loadCollection("/calendar/categories", params.signal),
      loadCollection("/calendar/services", params.signal),
    ]);
    response = { events, assignees, categories, services };
  }

  const record = isRecord(response) ? response : {};
  const people = normalizePeople(record.assignees);

  return {
    events: normalizeEvents(record.events, people),
    people,
    categories: normalizeReferenceOptions(record.categories),
    services: normalizeReferenceOptions(record.services),
    currentUser: normalizeCurrentUser(record.currentUser),
    assigneeScope:
      record.assigneeScope === "all" ||
      record.assigneeScope === "groups" ||
      record.assigneeScope === "self"
        ? record.assigneeScope
        : undefined,
  };
}

export async function createCalendarEvent(
  values: CreateCalendarEventValues,
  people: CalendarAssignee[],
) {
  const response = await requestBff<unknown>(EVENT_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(eventPayload(values)),
  });
  return normalizeEvent(response, people);
}

export async function updateCalendarEvent(
  event: CalendarEventItem,
  people: CalendarAssignee[],
) {
  const response = await requestBff<unknown>(
    `${EVENT_ENDPOINT}/${encodeURIComponent(String(event.id))}`,
    {
      method: "PATCH",
      body: JSON.stringify(eventPayload(event)),
    },
  );

  const normalizedEvent = normalizeEvent(response, people);
  if (!normalizedEvent) {
    throw new Error("La réponse du BFF ne contient pas l’événement modifié.");
  }
  return normalizedEvent;
}

export async function deleteCalendarEvent(eventId: CalendarAssigneeId) {
  await requestBff<void>(`${EVENT_ENDPOINT}/${encodeURIComponent(String(eventId))}`, {
    method: "DELETE",
  });
}

export async function updateCalendarEventApproval(
  eventId: CalendarAssigneeId,
  approvalStatus: "approved" | "rejected",
  people: CalendarAssignee[],
) {
  const response = await requestBff<unknown>(
    `${EVENT_ENDPOINT}/${encodeURIComponent(String(eventId))}/approval`,
    {
      method: "PATCH",
      body: JSON.stringify({ approvalStatus }),
    },
  );

  return normalizeEvent(response, people);
}

export function formatCalendarApiError(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Le BFF calendrier est injoignable.";
}
