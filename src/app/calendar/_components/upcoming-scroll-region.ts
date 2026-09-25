// lib-components 0.3.0 does not expose attributes for this internal scroll pane.
// Give keyboard users a focusable, named region without changing the shared library.
export function prepareUpcomingScrollRegion(board: HTMLDivElement | null) {
  const region = board?.querySelector<HTMLElement>('.calendar-sidebar > section:first-child > div');
  if (!region) return;
  region.tabIndex = 0;
  region.setAttribute('role', 'region');
  region.setAttribute('aria-label', 'Événements à venir');
}
