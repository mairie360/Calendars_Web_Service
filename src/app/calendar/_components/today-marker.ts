type DateGrid = Pick<HTMLElement, 'querySelectorAll'>;
type Timer = (callback: () => void, delay: number) => number;

function todayControlLabel(date: Date): string {
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
  const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return Math.max(1, tomorrow.getTime() - date.getTime() + 50);
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
