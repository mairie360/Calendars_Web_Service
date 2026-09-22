import { frontUrl } from "@/lib/front-urls";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  CalendarDays,
  Files,
  GraduationCap,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  UserRound,
} from "lucide-react";

type AppSidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  badge?: string;
  href?: string;
};

export const appSidebarItems: AppSidebarItem[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, get href() { return frontUrl("DASHBOARD_FRONT_URL"); } },
  { id: "projects", label: "Projets", icon: Briefcase, get href() { return frontUrl("PROJECT_FRONT_URL"); } },
  { id: "messages", label: "Messagerie", icon: MessageSquare, get href() { return frontUrl("MESSAGE_FRONT_URL"); } },
  { id: "emails", label: "E-mails", icon: Mail, get href() { return frontUrl("EMAIL_FRONT_URL"); } },
  { id: "files", label: "Fichiers", icon: Files, get href() { return frontUrl("FILES_FRONT_URL"); } },
  { id: "training", label: "Formation", icon: GraduationCap, get href() { return frontUrl("ELEARNING_FRONT_URL"); } },
  { id: "calendar", label: "Calendrier", icon: CalendarDays, get href() { return frontUrl("CALENDAR_FRONT_URL"); } },
  {
    id: "admin",
    label: "Administration",
    icon: Shield,
    adminOnly: true,
    badge: "Admin",
    get href() { return frontUrl("ADMINISTRATION_FRONT_URL"); },
  },
  { id: "profile", label: "Profil", icon: UserRound, href: "/profile" },
  { id: "settings", label: "Paramètres", icon: Settings, get href() { return frontUrl("SETTINGS_FRONT_URL"); } },
];

export function getNavigationHref(page: string) {
  return appSidebarItems.find((item) => item.id === page)?.href;
}

export function navigateToPage(page: string, push: (href: string) => void) {
  const href = getNavigationHref(page);

  if (!href) {
    return;
  }

  if (href.startsWith("/")) {
    push(href);
    return;
  }

  window.location.assign(href);
}
