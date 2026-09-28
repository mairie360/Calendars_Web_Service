"use client";

import { AppShell as SharedAppShell } from "@mairie360/lib-components";
import type { ReactNode } from "react";
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
  const frontHrefs = getActiveFrontHrefs();

  return (
    <SharedAppShell
      activeItem={activeItem}
      isAdmin={session.isAdmin}
      user={session.user}
      onLogout={() => void logoutAndReload()}
      hrefs={{ ...frontHrefs, calendar: frontHrefs.calendar ?? "/" }}
      sidebarProps={{ brandLogoSrc: "/mairie360-logo.png" }}
      className="calendar-scroll-shell"
    >
      {typeof children === "function" ? children(session) : children}
    </SharedAppShell>
  );
}
