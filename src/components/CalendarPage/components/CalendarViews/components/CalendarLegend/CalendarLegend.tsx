import React from 'react';

import { getEventColor } from '@/app/calendar/constants';
import type { CalendarParticipation } from '@/components/CalendarPage/calendar-types';
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
 * Legend under the calendar (mockup `Écran/Mois`): « Réunions : » then the looks of a meeting by the current user's
 * answer, painted with the very classes of the event pills (`getEventColor`), so it always shows the
 * looks of the grid. The categories are named by the statistics and the badges of « À venir ».
 */
export const CalendarLegend = ({ className }: CalendarLegendProps) => (
  <div className={joinClasses('calendar-legend flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--mairie-text)]', className)}>
    <span id="calendar-legend-title" className="font-medium text-[var(--mairie-muted)]">Réunions :</span>
    <ul aria-labelledby="calendar-legend-title" className="flex flex-wrap gap-x-4 gap-y-2">
      {participationStates.map(({ label, value }) => (
        <li key={value} className="flex items-center gap-2" data-participation={value}>
          <span
            aria-hidden="true"
            className={joinClasses('calendar-legend-swatch inline-block h-3 w-5 rounded-sm', getEventColor('meeting', value))}
          />
          {label}
        </li>
      ))}
    </ul>
  </div>
);
