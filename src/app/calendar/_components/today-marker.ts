import { civilDateInZone } from '@mairie360/front-kit/shared';
import { calendarToday } from '../date-utils';
type DateGrid = Pick<HTMLElement, 'querySelectorAll'>;
type Timer = (callback: () => void, delay: number) => number;

function todayControlLabel(instant: Date): string {
  const date = calendarToday(instant);
  const month = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(date);
  return `Sélectionner le ${date.getDate()} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}

export function markTodayInGrid(root: DateGrid | null, date: Date): boolean {
  if (!root) return false;

  const label = todayControlLabel(date);
  let found = false;

  root.querySelectorAll<HTMLButtonElement>('button[aria-label^="Sélectionner le "]').forEach((button) => {
    if (button.getAttribute('aria-label') === label) {
      button.setAttribute('aria-current', 'date');
      found = true;
    } else if (button.getAttribute('aria-current') === 'date') {
      button.removeAttribute('aria-current');
    }
  });

  return found;
}

export function millisecondsUntilTomorrow(date: Date): number {
  const current = civilDateInZone(date);
  let lower = date.getTime(), upper = lower + 36 * 60 * 60 * 1000;
  // Find the next instance midnight; a fixed 24-hour delay is wrong across DST.
  while (upper - lower > 1) {
    const middle = Math.floor((upper + lower) / 2);
    if (civilDateInZone(new Date(middle)) === current) lower = middle;
    else upper = middle;
  }
  return Math.max(1, upper - date.getTime() + 50);
}

export function observeTodayInGrid(
  root: DateGrid | null,
  now: () => Date = () => new Date(),
  schedule: Timer = (callback, delay) => window.setTimeout(callback, delay),
  cancel: (timer: number) => void = (timer) => window.clearTimeout(timer),
): () => void {
  if (!root) return () => {};

  let active = true;
  let timer: number | undefined;

  const refresh = () => {
    if (!active) return;
    const date = now();
    markTodayInGrid(root, date);
    timer = schedule(refresh, millisecondsUntilTomorrow(date));
  };

  refresh();

  return () => {
    active = false;
    if (timer !== undefined) cancel(timer);
  };
}
