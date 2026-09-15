let pendingLogout: Promise<void> | null = null;

/**
 * Session refusée par un BFF (401) ou déconnexion demandée : BFF User efface le cookie `accessToken`,
 * puis le rechargement laisse le middleware renvoyer vers Login. Les appels concurrents partagent la même déconnexion.
 */
export function logoutAndReload() {
  pendingLogout ??= (async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } finally {
      try {
        window.localStorage.clear();
      } finally {
        window.location.reload();
      }
    }
  })();

  return pendingLogout;
}
