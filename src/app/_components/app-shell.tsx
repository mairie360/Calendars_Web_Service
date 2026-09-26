"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Header, Sidebar } from "@mairie360/lib-components";
import { useRouter } from "next/navigation";
import {
  logoutAndReload,
  useAuthSession,
  type AuthSession,
} from "@/lib/auth-session";
import { appSidebarItems, getNavigationHref, navigateToPage } from "../navigation";

type AppShellProps = {
  activeItem: string;
  children: ReactNode | ((session: AuthSession) => ReactNode);
  mainClassName?: string;
  scrollContent?: boolean;
};

export function AppShell({ activeItem, children, mainClassName = "app-main flex-1", scrollContent = false }: AppShellProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = useAuthSession();

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
    <div className={`min-h-screen bg-[#f5f3f0] text-[#172033]${scrollContent ? " calendar-scroll-shell" : ""}`}>
      <div className={`flex min-h-screen${scrollContent ? " calendar-scroll-layout" : ""}`}>
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

        <div className={`flex min-h-screen min-w-0 flex-1 flex-col${scrollContent ? " calendar-scroll-column" : ""}`}>
          <Header
            isAdmin={session.isAdmin}
            user={session.user}
            profileHref={getNavigationHref("profile")}
            setSidebarOpen={setSidebarOpen}
            onPageChange={handlePageChange}
            onLogout={() => void logoutAndReload()}
          />

          <main className={mainClassName}>
            {typeof children === "function" ? children(session) : children}
          </main>

          <footer className="app-footer flex min-h-16 w-full shrink-0 items-center border-t border-[#b9d6d5] bg-white px-6 py-4 text-sm text-[#4c5258] shadow-[0_-1px_5px_rgba(0,0,0,0.08)]">
            © {new Date().getFullYear()} Mairie360
          </footer>
        </div>
      </div>
    </div>
  );
}
