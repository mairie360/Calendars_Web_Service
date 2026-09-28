// Give keyboard users a focusable, named region inside the upcoming-events card.
export function prepareUpcomingScrollRegion(board: HTMLDivElement | null) {
  const region = board?.querySelector<HTMLElement>('.calendar-sidebar > .calendar-upcoming-panel > div');
  if (!region) return;
  region.tabIndex = 0;
  region.setAttribute('role', 'region');
  region.setAttribute('aria-label', 'Événements à venir');
}
