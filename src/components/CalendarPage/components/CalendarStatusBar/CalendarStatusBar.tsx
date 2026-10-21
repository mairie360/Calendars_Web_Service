"use client";
import { RetryButton } from "@mairie360/lib-components/primitives";

export interface CalendarStatusBarProps {
  readError: string | null;
  mutationError: string | null;
  loading: boolean;
  saving: boolean;
  onRetry: () => void;
}

/** Read and save errors, the running read or write, and the retry of a failed read. */
export const CalendarStatusBar = ({ readError, mutationError, loading, saving, onRetry }: CalendarStatusBarProps) => {
  if (!loading && !saving && !readError && !mutationError) return null;
  return (
    <div className="calendar-status-bar mb-5 flex flex-col gap-3 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-4 py-3 text-sm text-[var(--mairie-text)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        {readError ? <span role="alert">Calendrier : {readError}</span> : null}
        {mutationError ? <span role="alert">Enregistrement : {mutationError}</span> : null}
        {loading || saving ? <span role="status">{saving ? "Enregistrement en cours…" : "Chargement des données du calendrier…"}</span> : null}
      </div>
      {readError ? <RetryButton variant="outline" tone="neutral" size="s" onClick={onRetry} /> : null}
    </div>
  );
};
