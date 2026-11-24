import React from 'react';

import { StatsPanel } from './components/StatsPanel';
import { UpcomingEventsPanel } from './components/UpcomingEventsPanel';
import { joinClasses } from '../../calendar-style';
import type { CalendarSidebarProps } from '../../calendar-types';

export type { CalendarEvent, CalendarMonthStats, CalendarSidebarProps, CalendarUpcomingItem } from '../../calendar-types';

/** Right column (MAIR-918): « À venir » first, then the statistics of the displayed month. */
export const CalendarSidebar = ({
  state = 'default',
  onRetry,
  upcoming,
  categories = [],
  today,
  stats,
  onEventClick,
  className = '',
  ...props
}: CalendarSidebarProps) => (
  <aside className={joinClasses('flex flex-col gap-6', className)} {...props}>
    <UpcomingEventsPanel state={state} onRetry={onRetry} className="calendar-upcoming-panel"
      items={upcoming} categories={categories} today={today} onEventClick={onEventClick} />
    <StatsPanel stats={stats} state={state} />
  </aside>
);
