import React from 'react';

import { getEventColor, getEventTone } from '@/app/calendar/constants';
import { defaultEventCategories } from '@/components/CalendarPage/calendar-constants';
import { joinClasses } from '@/components/CalendarPage/calendar-style';

interface CalendarLegendProps {
  className?: string;
}

/**
 * Legend under the calendar: one swatch per category, painted with the very classes of the event pills
 * (`getEventColor`), so it always shows the colours of the grid.
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
  </ul>
);
