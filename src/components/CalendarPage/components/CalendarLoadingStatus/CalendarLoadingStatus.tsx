import React, { useEffect, useState } from 'react';

import type { CalendarPanelState } from '../../calendar-types';

export const CALENDAR_LOADING_MESSAGE = 'Chargement des données du calendrier…';

/**
 * The single status message of the calendar panels (RGAA 7.5). The live region is mounted with the page
 * and stays mounted: only its text changes, so assistive technologies announce every load. Its first render
 * is always empty and the message comes with the next update, so an initial load is announced too (ARIA22:
 * the container must exist before its message). The panels themselves show unlabelled skeletons and never
 * insert a status of their own.
 */
export const CalendarLoadingStatus = ({ state }: { state: CalendarPanelState }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {mounted && state === 'loading' ? CALENDAR_LOADING_MESSAGE : ''}
    </p>
  );
};
