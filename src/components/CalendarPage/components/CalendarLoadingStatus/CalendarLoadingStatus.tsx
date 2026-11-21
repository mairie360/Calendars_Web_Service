import React from 'react';

import type { CalendarPanelState } from '../../calendar-types';

export const CALENDAR_LOADING_MESSAGE = 'Chargement des données du calendrier…';

/**
 * The single status message of the calendar panels (RGAA 7.5). The live region is mounted with the page
 * and stays mounted: only its text changes, so assistive technologies announce every load. The panels
 * themselves show unlabelled skeletons and never insert a status of their own.
 */
export const CalendarLoadingStatus = ({ state }: { state: CalendarPanelState }) => (
  <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
    {state === 'loading' ? CALENDAR_LOADING_MESSAGE : ''}
  </p>
);
