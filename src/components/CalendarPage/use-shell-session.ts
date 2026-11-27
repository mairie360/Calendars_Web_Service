'use client';

import { useState } from 'react';
import { logoutAndReload, useAuthSession, type AuthSession } from '@/lib/auth-session';
import type { CalendarData } from '@/app/calendar/api';

type CurrentUser = CalendarData['currentUser'];
type ShellUser = { name: string; role?: string; email?: string };

/**
 * The person shown by the shared header: the BFF User session once it is read, otherwise the current user
 * BFF_Calendar returned with the calendar (so the header names the agent even while, or when, the session
 * read is unavailable), otherwise the session placeholder.
 */
export function shellUser(session: Pick<AuthSession, 'user' | 'loading' | 'error'>, currentUser?: CurrentUser): ShellUser {
  const sessionName = session.user.name?.trim();
  if (!session.loading && !session.error && sessionName) return { name: sessionName, role: session.user.role, email: session.user.email };
  const calendarName = currentUser?.name?.trim();
  if (calendarName) return { name: calendarName, role: currentUser?.role || undefined, email: currentUser?.email };
  return { name: sessionName ?? '', role: session.user.role, email: session.user.email };
}

/** Session binding of the shared shell: the header user, the logout and its error. */
export function useShellSession(currentUser?: CurrentUser) {
  const session = useAuthSession();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  async function logout() {
    setLogoutError(null);
    try { await logoutAndReload(); } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'La déconnexion n’a pas abouti. Veuillez réessayer.');
    }
  }
  return { user: shellUser(session, currentUser), logout, logoutError, dismissLogoutError: () => setLogoutError(null) };
}
