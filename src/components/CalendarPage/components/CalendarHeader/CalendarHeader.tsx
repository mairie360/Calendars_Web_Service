"use client";
import { CreateButton, PageHeader, RefreshButton } from "@mairie360/lib-components/primitives";

export interface CalendarHeaderProps {
  /** Opens « Nouvel événement »; the button only appears once the data is ready. */
  onCreate?: () => void;
  /** MAIR-884: reloads the displayed period (F9 Actualiser). */
  onRefresh?: () => void;
  /** A read is running: « Actualiser » is disabled until it ends. */
  loading?: boolean;
}

/** Title row of the calendar (Figma Base/PageHeader WithActions): « Actualiser » then « Créer ». */
export const CalendarHeader = ({ onCreate, onRefresh, loading = false }: CalendarHeaderProps) => (
  <PageHeader title="Calendrier & Événements" subtitle="Planifiez et organisez les activités de la mairie" className="calendar-title-bar"
    actions={<>
      <RefreshButton onClick={onRefresh} disabled={loading || !onRefresh} />
      {onCreate && <CreateButton onClick={onCreate} />}
    </>} />
);
