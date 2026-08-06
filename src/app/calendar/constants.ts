import type { CalendarAssignee, CalendarAssigneeId } from "./types";

export const initialDate = new Date();

const eventColors: Record<string, string> = {
  meeting: "bg-[#e9f2ff] text-[#1256a6]",
  activity: "bg-[#eaf7ee] text-[#257444]",
  ceremony: "bg-[#fff5d8] text-[#8a5d00]",
  other: "bg-[#f3f4f6] text-[#4c5258]",
};

export function getEventColor(category = "other") {
  return eventColors[category] || eventColors.other;
}

export function resolveAssignees(
  assigneeIds: CalendarAssigneeId[],
  sourcePeople: CalendarAssignee[],
) {
  return sourcePeople.filter((person) =>
    assigneeIds.some((assigneeId) => String(assigneeId) === String(person.id)),
  );
}
