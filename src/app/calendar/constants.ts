import type { CalendarAssignee, CalendarAssigneeId } from "./types";

/** MAIR-905: tone of an event per category, as the Figma `Calendrier/EventPill` variants. */
export type CalendarEventTone = "info" | "success" | "warning" | "neutral";

const eventTones: Record<string, CalendarEventTone> = {
  meeting: "info",
  activity: "success",
  ceremony: "warning",
  other: "neutral",
};

const toneClasses: Record<CalendarEventTone, string> = {
  info: "bg-[var(--mairie-info-surface)] text-[var(--mairie-info-text)]",
  success: "bg-[var(--mairie-success-surface)] text-[var(--mairie-success-text)]",
  warning: "bg-[var(--mairie-warning-surface)] text-[var(--mairie-warning-text)]",
  neutral: "bg-[var(--mairie-surface-raised)] text-[var(--mairie-text)]",
};

export function getEventTone(category = "other"): CalendarEventTone {
  return eventTones[category] || "neutral";
}

export function getEventColor(category = "other") {
  return toneClasses[getEventTone(category)];
}

export function resolveAssignees(
  assigneeIds: CalendarAssigneeId[],
  sourcePeople: CalendarAssignee[],
) {
  return sourcePeople.filter((person) =>
    assigneeIds.some((assigneeId) => String(assigneeId) === String(person.id)),
  );
}
