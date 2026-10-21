import React from 'react';

import { StatsPanel } from './StatsPanel';
import { UpcomingEventsPanel } from './UpcomingEventsPanel';
import { getDefaultStats, getUpcomingEvents, parseDateInput } from './date';
import { joinClasses } from './style';
import type { CalendarSidebarProps } from './types';

export type { CalendarEvent, CalendarSidebarProps, CalendarStat } from './types';

export const CalendarSidebar = ({
  events = [],
  /** The current date to use for filtering events and calculating stats */
  currentDate = new Date(),
  upcomingEvents,
  stats,
  showEmptyState = false,
  onEventClick,
  className = '',
  ...props
}: CalendarSidebarProps) => {
  const parsedDate = parseDateInput(currentDate);
  const resolvedUpcomingEvents = upcomingEvents ?? getUpcomingEvents(events, parsedDate);
  const resolvedStats = stats ?? getDefaultStats(events, parsedDate);

  return (
    <aside className={joinClasses('flex flex-col gap-6', className)} {...props}>
      <StatsPanel stats={resolvedStats} />
      <UpcomingEventsPanel
        className="calendar-upcoming-panel"
        events={resolvedUpcomingEvents}
        showEmptyState={showEmptyState}
        onEventClick={onEventClick}
      />
    </aside>
  );
};
