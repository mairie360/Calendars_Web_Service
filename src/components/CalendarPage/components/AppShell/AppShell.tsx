"use client";

import { AccessibleShell as SharedAppShell } from "@mairie360/lib-components/shell";

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
      user={session.user}
      onLogout={() => void logout()}
      hrefs={{ ...frontHrefs, calendar: frontHrefs.calendar ?? "/" }}
      sidebarProps={{ brandLogoSrc: "/mairie360-logo.png" }}
      className="calendar-scroll-shell"
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
