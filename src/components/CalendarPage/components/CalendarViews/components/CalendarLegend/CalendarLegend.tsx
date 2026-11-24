import React from 'react';

import { getEventColor, getEventTone } from '@/app/calendar/constants';
import type { CalendarParticipation } from '@/components/CalendarPage/calendar-types';
import { defaultEventCategories } from '@/components/CalendarPage/calendar-constants';
import { joinClasses } from '@/components/CalendarPage/calendar-style';

interface CalendarLegendProps {
  className?: string;
}

/** MAIR-1122: the looks of a meeting by the current user's answer. */
const participationStates: { label: string; value: CalendarParticipation }[] = [
  { label: 'Je participe', value: 'accepted' },
  { label: 'En attente de ma réponse', value: 'pending' },
  { label: 'Déclinée', value: 'declined' },
];

/**
 * Legend under the calendar: one swatch per category, then the meeting by participation (MAIR-1122), painted with
 * the very classes of the event pills (`getEventColor`), so it always shows the colours of the grid.
 */
export const CalendarLegend = ({ className }: CalendarLegendProps) => (
  <ul aria-label="Légende du calendrier" className={joinClasses('calendar-legend flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--mairie-text)]', className)}>
    {defaultEventCategories.map(({ label, value }) => (
      <li key={value} className="flex items-center gap-2">
        <span
          aria-hidden="true"
          data-tone={getEventTone(value)}
          className={joinClasses('calendar-legend-swatch inline-block h-3 w-5 rounded-sm', getEventColor(value))}
        />
        {label}
      </li>
    ))}
    {participationStates.map(({ label, value }) => (
      <li key={value} className="flex items-center gap-2" data-participation={value}>
        <span
          aria-hidden="true"
          className={joinClasses('calendar-legend-swatch inline-block h-3 w-5 rounded-sm', getEventColor('meeting', value))}
        />
        Réunion · {label}
      </li>
    ))}
  </ul>
);
