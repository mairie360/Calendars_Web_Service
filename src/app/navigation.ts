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
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "projects", label: "Projets", icon: Briefcase },
  { id: "messages", label: "Messagerie", icon: MessageSquare },
  { id: "emails", label: "E-mails", icon: Mail },
  { id: "files", label: "Fichiers", icon: Files },
  { id: "training", label: "Formation", icon: GraduationCap },
  { id: "calendar", label: "Calendrier", icon: CalendarDays, href: "/" },
  { id: "admin", label: "Administration", icon: Shield, adminOnly: true, badge: "Admin" },
  { id: "profile", label: "Profil", icon: UserRound, href: "/profile" },
  { id: "settings", label: "Paramètres", icon: Settings },
];

export function getNavigationHref(page: string) {
  return appSidebarItems.find((item) => item.id === page)?.href;
}
