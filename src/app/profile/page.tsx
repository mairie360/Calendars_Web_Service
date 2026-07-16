"use client";

import { UserProfile } from "@mairie360/lib-components";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { AppShell } from "../_components/app-shell";

const profileTitle = "Profil utilisateur";
const profileSubtitle = "Informations réelles du compte connecté";

export default function ProfilePage() {
  return (
    <AppShell activeItem="profile">
      {(session) => {
        if (session.loading || session.error) {
          return (
            <section aria-label={profileTitle} className="space-y-6 text-[#172033]">
              <header>
                <h1 className="text-2xl font-bold leading-8">{profileTitle}</h1>
                <p className="mt-1 text-sm leading-6 text-[#5f6770]">{profileSubtitle}</p>
              </header>

              <div className="overflow-hidden rounded-lg border border-[#e4e0dc] bg-white shadow-sm">
                <div
                  role={session.error ? "alert" : "status"}
                  className={`flex min-h-40 items-center justify-center gap-3 px-6 py-10 text-sm font-medium ${
                    session.error ? "bg-[#fff7f6] text-[#912018]" : "text-[#5f6770]"
                  }`}
                >
                  {session.error ? (
                    <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                  ) : (
                    <LoaderCircle className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" />
                  )}
                  <span>{session.error || "Chargement des informations du profil…"}</span>
                </div>
              </div>
            </section>
          );
        }

        return (
          <UserProfile
            user={session.user}
            title={profileTitle}
            subtitle={profileSubtitle}
            editable={false}
          />
        );
      }}
    </AppShell>
  );
}
