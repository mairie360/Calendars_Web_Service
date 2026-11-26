'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * A live region is only announced when its text changes after the region exists (RGAA 7.5): the message is held
 * back on the first render, then written once the region is mounted.
 */
export function useMountedAnnouncement<T extends ReactNode>(message: T): T | null {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the message is written once the region exists.
  useEffect(() => { setMounted(true); }, []);
  return mounted ? message : null;
}
