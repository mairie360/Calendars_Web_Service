import type { CalendarAssignee, CalendarAssigneeId, CalendarParticipation } from "./types";

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

/**
 * MAIR-1122: a meeting shows the current user's answer. Accepted (or no answer to give) keeps the solid navy;
 * pending is the surface with a dashed navy border; declined the surface with a thin navy border (the pill also
 * strikes its title). Other categories do not change.
 */
const meetingParticipationClasses: Record<Exclude<CalendarParticipation, "accepted">, string> = {
  pending: "border border-dashed border-[var(--mairie-secondary)] bg-[var(--mairie-surface)] text-[var(--mairie-secondary)]",
  declined: "border border-[var(--mairie-secondary)] bg-[var(--mairie-surface)] text-[var(--mairie-secondary)]",
};

/** The participation a pill shows: only meetings the current user answers to. */
export function getShownParticipation(category?: string, participation?: CalendarParticipation) {
  return category === "meeting" && participation ? participation : undefined;
}

export function getEventColor(category = "other", participation?: CalendarParticipation) {
  const shown = getShownParticipation(category, participation);
  return shown && shown !== "accepted" ? meetingParticipationClasses[shown] : toneClasses[getEventTone(category)];
}

/** Words read by assistive technologies after a meeting's title (the state is otherwise only visual). */
export const participationLabels: Record<CalendarParticipation, string> = {
  accepted: "je participe",
  pending: "en attente de ma réponse",
  declined: "déclinée",
};

export function resolveAssignees(
  assigneeIds: CalendarAssigneeId[],
  sourcePeople: CalendarAssignee[],
) {
  return sourcePeople.filter((person) =>
    assigneeIds.some((assigneeId) => String(assigneeId) === String(person.id)),
  );
}
