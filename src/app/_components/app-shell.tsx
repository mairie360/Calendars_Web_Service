"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Footer, Header, Sidebar } from "@mairie360/lib-components";
import { useRouter } from "next/navigation";
import {
  logoutAndReload,
  useAuthSession,
  type AuthSession,
} from "@/lib/auth-session";
import { currentUser } from "../current-user";
import { appSidebarItems, navigateToPage } from "../navigation";

type AppShellProps = {
  activeItem: string;
  children: ReactNode | ((session: AuthSession) => ReactNode);
  mainClassName?: string;
};

export function AppShell({ activeItem, children, mainClassName = "app-main flex-1" }: AppShellProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = useAuthSession(currentUser);

  const handlePageChange = (page: string) => {
    navigateToPage(page, router.push);

    setSidebarOpen(false);
  };

  const sidebar = (
    <Sidebar
      activeItem={activeItem}
      isAdmin={session.isAdmin}
      items={appSidebarItems}
      brandLogoSrc={null}
      onItemSelect={(item) => handlePageChange(item.id)}
    />
  );

  return (
    <div className="min-h-screen bg-[#f5f3f0] text-[#172033]">
      <div className="flex min-h-screen">
        <div className="desktop-sidebar shrink-0">{sidebar}</div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation mobile"
          >
            <button
              type="button"
              aria-label="Fermer la navigation"
              className="absolute inset-0 h-full w-full bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative h-full w-[260px] max-w-[82vw] shadow-2xl">{sidebar}</div>
          </div>
        )}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header
            isAdmin={session.isAdmin}
            user={session.user}
            profileHref="/profile"
            setSidebarOpen={setSidebarOpen}
            onPageChange={handlePageChange}
            onLogout={() => void logoutAndReload()}
          />

          <main className={mainClassName}>
            {typeof children === "function" ? children(session) : children}
          </main>

          <Footer year={2026} version="2.1.0" className="app-footer" />
        </div>
      </div>
    </div>
  );
}
