import type { CalendarAssignee, CalendarAssigneeId } from "./types";

export const initialDate = new Date(2026, 5, 15);

export const people: CalendarAssignee[] = [
  {
    id: "as",
    name: "Admin Systeme",
    email: "admin@mairie360.fr",
    role: "Administrateur",
  },
  {
    id: "ma",
    name: "Marie Armand",
    email: "marie.armand@mairie360.fr",
    role: "Coordination",
  },
  {
    id: "jl",
    name: "Jean Laurent",
    email: "jean.laurent@mairie360.fr",
    role: "Animation",
  },
];

export const categories = [
  { label: "Réunion", value: "meeting" },
  { label: "Animation", value: "activity" },
  { label: "Cérémonie", value: "ceremony" },
  { label: "Autre", value: "other" },
];

export const services = [
  { label: "Direction générale", value: "direction" },
  { label: "Communication", value: "communication" },
  { label: "Culture", value: "culture" },
  { label: "Logistique", value: "logistique" },
  { label: "Accueil", value: "accueil" },
  { label: "Sécurité", value: "securite" },
];

const eventColors: Record<string, string> = {
  meeting: "bg-[#e9f2ff] text-[#1256a6]",
  activity: "bg-[#eaf7ee] text-[#257444]",
  ceremony: "bg-[#fff5d8] text-[#8a5d00]",
  other: "bg-[#f3f4f6] text-[#4c5258]",
};

export function getEventColor(category = "other") {
  return eventColors[category] || eventColors.other;
}

export function resolveAssignees(assigneeIds: CalendarAssigneeId[]) {
  return people.filter((person) =>
    assigneeIds.some((assigneeId) => String(assigneeId) === String(person.id)),
  );
}
