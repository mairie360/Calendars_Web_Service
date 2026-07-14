"use client";

import { UserProfile } from "@mairie360/lib-components";
import { AppShell } from "../_components/app-shell";
import { currentUser } from "../current-user";

export default function ProfilePage() {
  return (
    <AppShell activeItem="profile">
      <UserProfile
        user={currentUser}
        title="Profil utilisateur"
        subtitle="Consultez et mettez à jour vos informations personnelles"
      />
    </AppShell>
  );
}
