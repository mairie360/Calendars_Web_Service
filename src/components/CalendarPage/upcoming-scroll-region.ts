// Give keyboard users a focusable, named region inside the upcoming-events card.
export function prepareUpcomingScrollRegion(board: HTMLDivElement | null) {
  const region = board?.querySelector<HTMLElement>('.calendar-sidebar > .calendar-upcoming-panel > div');
  if (!region) return;
  region.tabIndex = 0;
  region.setAttribute('role', 'region');
  // Not « À venir »: that is already the name of the panel around it (RGAA 9.2, unique landmark names).
  region.setAttribute('aria-label', 'Liste des événements à venir');
}
