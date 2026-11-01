"use client";
import { CreateButton, PageHeader } from "@mairie360/lib-components/primitives";

/** Title row of the calendar (Figma Base/PageHeader WithActions); the action only once the data is ready. */
export const CalendarHeader = ({ onCreate }: { onCreate?: () => void }) => (
  <PageHeader title="Calendrier & Événements" subtitle="Planifiez et organisez vos activités" className="calendar-title-bar"
    actions={onCreate ? <CreateButton label="Nouvel événement" onClick={onCreate} /> : undefined} />
);
