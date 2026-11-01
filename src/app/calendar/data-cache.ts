import { loadCalendarData, loadCalendarPeriodData, type CalendarData, type CalendarLoadParams } from './api';

/** One cache per mounted account page. No data is persisted or shared across tabs. */
export function createCalendarDataCache({ bootstrap = loadCalendarData, period = loadCalendarPeriodData, now = Date.now, ttl = 60_000, limit = 6, initial }: { bootstrap?: typeof loadCalendarData; period?: typeof loadCalendarPeriodData; now?: () => number; ttl?: number; limit?: number; initial?: { params: CalendarLoadParams; value: CalendarData } } = {}) {
  let context: CalendarData | null = null;
  let owner: string | null = null;
  let generation = 0;
  const entries = new Map<string, { value: CalendarData; expires: number }>();
  const key = (params: CalendarLoadParams) => JSON.stringify([owner, params.from, params.to]);
  const remember = (params: CalendarLoadParams, value: CalendarData) => {
    if (owner === null) return;
    const id = key(params);
    entries.delete(id);
    entries.set(id, { value: structuredClone(value), expires: now() + ttl });
    while (entries.size > limit) entries.delete(entries.keys().next().value!);
  };
  if (initial) {
    const id = initial.value.currentUser?.id;
    owner = id === undefined || id === null || String(id).trim() === '' ? null : String(id);
    context = structuredClone(initial.value);
    remember(initial.params, initial.value);
  }
  return {
    canPrefetch: () => owner !== null,
    invalidate: () => { generation += 1; entries.clear(); },
    clear: () => { generation += 1; entries.clear(); context = null; owner = null; },
    async read(params: CalendarLoadParams, refreshContext = false): Promise<CalendarData> {
      params.signal?.throwIfAborted();
      const revision = refreshContext ? ++generation : generation;
      if (refreshContext) { entries.clear(); context = null; owner = null; }
      if (refreshContext || context === null || owner === null) {
        const value = await bootstrap(params);
        params.signal?.throwIfAborted();
        if (revision === generation) {
          const id = value.currentUser?.id;
          const nextOwner = id === undefined || id === null || String(id).trim() === '' ? null : String(id);
          if (nextOwner !== owner) entries.clear();
          owner = nextOwner;
          context = structuredClone(value);
          remember(params, value);
        }
        return value;
      }
      const cached = entries.get(key(params));
      if (cached && cached.expires > now()) return structuredClone(cached.value);
      const account = owner;
      const value = await period(params, structuredClone(context));
      params.signal?.throwIfAborted();
      if (revision === generation && account === owner) remember(params, value);
      return value;
    },
  };
}
