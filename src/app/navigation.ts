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
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, href: process.env.LOGIN_FRONT_URL },
  { id: "projects", label: "Projets", icon: Briefcase, href: process.env.PROJECT_FRONT_URL },
  { id: "messages", label: "Messagerie", icon: MessageSquare, href: process.env.MESSAGE_FRONT_URL },
  { id: "emails", label: "E-mails", icon: Mail, href: process.env.EMAIL_FRONT_URL },
  { id: "files", label: "Fichiers", icon: Files, href: process.env.FILES_FRONT_URL },
  { id: "training", label: "Formation", icon: GraduationCap, href: process.env.ELEARNING_FRONT_URL },
  { id: "calendar", label: "Calendrier", icon: CalendarDays, href: process.env.CALENDAR_FRONT_URL },
  {
    id: "admin",
    label: "Administration",
    icon: Shield,
    adminOnly: true,
    badge: "Admin",
    href: process.env.ADMINISTRATION_FRONT_URL,
  },
  { id: "profile", label: "Profil", icon: UserRound, href: "/profile" },
  { id: "settings", label: "Paramètres", icon: Settings },
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
