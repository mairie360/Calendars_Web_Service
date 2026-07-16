"use client";

import { UserProfile } from "@mairie360/lib-components";
import { AppShell } from "../_components/app-shell";

export default function ProfilePage() {
  return (
    <AppShell activeItem="profile">
      {(session) => (
        <UserProfile
          user={session.user}
          title="Profil utilisateur"
          subtitle="Informations réelles du compte connecté"
          editable={false}
          loading={session.loading}
          error={session.error}
        />
      )}
    </AppShell>
  );
}
