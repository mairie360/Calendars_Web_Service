"use client";

import { Alert, AppShell as SharedAppShell } from "@mairie360/lib-components";
import { useState, type ReactNode } from "react";
import { navigateToLogin } from "@/lib/logout";
import {
  logoutAndReload,
  useAuthSession,
  type AuthSession,
} from "@/lib/auth-session";
import { getActiveFrontHrefs } from "../navigation";

type AppShellProps = {
  activeItem: string;
  children: ReactNode | ((session: AuthSession) => ReactNode);
};

/** Bind the existing BFF session and calendar viewport to the shared frontend shell. */
export function AppShell({ activeItem, children }: AppShellProps) {
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
      isAdmin={session.isAdmin}
      user={session.user}
      onLogout={() => void logout()}
      hrefs={{ ...frontHrefs, calendar: frontHrefs.calendar ?? "/" }}
      sidebarProps={{ brandLogoSrc: "/mairie360-logo.png" }}
      className="calendar-scroll-shell"
    >
      {logoutError && <div className="mb-4">
        <Alert type="error" message={logoutError} closable onClose={() => setLogoutError(null)} />
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" className="min-h-11 rounded-lg border bg-white px-4 py-2 font-semibold text-gray-900" onClick={() => void logout()}>Réessayer</button>
          <button type="button" className="min-h-11 rounded-lg border bg-white px-4 py-2 font-semibold text-gray-900" onClick={() => navigateToLogin({ explicit: true })}>Retour à la connexion</button>
        </div>
      </div>}
      {typeof children === "function" ? children(session) : children}
    </SharedAppShell>
  );
}
