import type { CalendarAssignee, CalendarAssigneeId } from "./types";

/**
 * Tone of an event per category, as the Figma `Calendrier/EventPill` variants (MAIR-905). MAIR-1121: no grey nor
 * neutral event any more, meetings are navy and « Autre » purple; the names are the lib `StatusPill` tones.
 */
export type CalendarEventTone = "secondary-strong" | "success" | "warning" | "purple";

const eventTones: Record<string, CalendarEventTone> = {
  meeting: "secondary-strong",
  activity: "success",
  ceremony: "warning",
  other: "purple",
};

const toneClasses: Record<CalendarEventTone, string> = {
  "secondary-strong": "bg-[var(--mairie-secondary)] text-[var(--mairie-on-secondary)]",
  success: "bg-[var(--mairie-success-surface)] text-[var(--mairie-success-text)]",
  warning: "bg-[var(--mairie-warning-surface)] text-[var(--mairie-warning-text)]",
  purple: "bg-[var(--mairie-purple-surface)] text-[var(--mairie-purple-text)]",
};

export function getEventTone(category = "other"): CalendarEventTone {
  return eventTones[category] || "purple";
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
