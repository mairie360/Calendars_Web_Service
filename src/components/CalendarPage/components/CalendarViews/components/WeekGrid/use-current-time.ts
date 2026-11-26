'use client';

import { useEffect, useState } from 'react';

/**
 * The current time once the page runs in the browser (null on the server pass, so the markup does not depend on the
 * server clock), refreshed every minute for the week view's current-time line.
 */
export function useCurrentTime(refreshMs = 60_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the clock is only read once mounted.
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), refreshMs);
    return () => clearInterval(timer);
  }, [refreshMs]);
  return now;
}
