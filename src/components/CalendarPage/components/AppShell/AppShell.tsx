"use client";

import { AccessibleShell as SharedAppShell, createBffSearchSource } from "@mairie360/lib-components/shell";

import { Button, ErrorAlert, RetryButton } from "@mairie360/lib-components/primitives";
import { useState, type ReactNode } from "react";
import { navigateToLogin } from '@/lib/logout';
import {
  logoutAndReload,
  useAuthSession,
  type AuthSession,
} from '@/lib/auth-session';
import { getActiveFrontHrefs } from '@/app/navigation';

type AppShellProps = {
  activeItem: string;
  /** The commune of the deployment (`COMMUNE_NAME`), shown by the shared header and navigation; none when unknown. */
  commune?: string;
  /**
   * The calendar's own search: the events are filtered on every keystroke ('' once cleared) while the header
   * lists the global results, and « Rechercher « q » dans Calendrier » keeps that filter.
   */
  search?: { value: string; onChange: (query: string) => void };
  children: ReactNode | ((session: AuthSession) => ReactNode);
};

/**
 * Global search of the shared header: the same-origin `GET /search`, which the contract proxy forwards to
 * BFF_Calendar. Created once so the header does not restart its debounced search on every render. A result
 * opens its module through the shell `hrefs`; an event comes back here as `?date=<day>&event=<id>`.
 */
const globalSearchSource = createBffSearchSource();

/** Bind the existing BFF session and calendar viewport to the shared frontend shell. */
export function AppShell({ activeItem, commune, search, children }: AppShellProps) {
  const session = useAuthSession();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  async function logout() {
    setLogoutError(null);
    try { await logoutAndReload(); } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "La déconnexion n’a pas abouti. Veuillez réessayer.");
    }
  }
  const frontHrefs = getActiveFrontHrefs();

  return (
    <SharedAppShell
      activeItem={activeItem}
      user={session.user}
      onLogout={() => void logout()}
      hrefs={{ ...frontHrefs, calendar: frontHrefs.calendar ?? "/" }}
      commune={commune}
      searchSource={globalSearchSource}
      headerProps={search ? { searchScopeLabel: "Calendrier", searchValue: search.value, onSearchChange: search.onChange, onSearch: search.onChange } : undefined}
    >
      {logoutError && <div className="mb-4">
        <ErrorAlert title={logoutError} onDismiss={() => setLogoutError(null)} />
        <div className="mt-3 flex flex-wrap gap-3">
          <RetryButton variant="outline" tone="neutral" onClick={() => void logout()} />
          <Button variant="outline" tone="neutral" label="Retour à la connexion" onClick={() => navigateToLogin({ explicit: true })} />
        </div>
      </div>}
      {typeof children === "function" ? children(session) : children}
    </SharedAppShell>
  );
}
