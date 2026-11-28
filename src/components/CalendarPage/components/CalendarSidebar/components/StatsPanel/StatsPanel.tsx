import { Calendar, Landmark, PartyPopper, Users, type LucideIcon } from 'lucide-react';
import React from 'react';

import { MetricCard, Panel } from '@mairie360/lib-components/primitives';
import { CalendarLoadingSkeleton } from '@/components/CalendarPage/components/CalendarLoadingSkeleton';
import type { StatsPanelProps } from '@/components/CalendarPage/calendar-types';

export type { CalendarMonthStats, StatsPanelProps } from '@/components/CalendarPage/calendar-types';

/** Icon of each event type, as in the mockup; any other category takes the calendar icon. */
const STAT_ICONS: Readonly<Record<string, LucideIcon>> = { meeting: Users, activity: PartyPopper, ceremony: Landmark, other: Calendar };
// Own keys only: « toString » and the other inherited names fall back to the calendar icon.
export const statIconOf = (category: string): LucideIcon => (Object.hasOwn(STAT_ICONS, category) ? STAT_ICONS[category] : Calendar);

const plural = (count: number) => `${count} événement${count > 1 ? 's' : ''}`;

/**
 * MAIR-918 C3: occurrences of the displayed month, one MetricCard per category (2 × 2 grid).
 * MAIR-911: skeleton while the calendar loads, « Statistiques indisponibles. » after a failed read.
 */
export const StatsPanel = ({ stats, state = 'default', className = '', ...props }: StatsPanelProps) => (
  <Panel title="Statistiques" description={state === 'default' ? `${plural(stats.total)} en ${stats.month}${stats.year ? ` ${stats.year}` : ''}` : undefined}
    className={className} state={state === 'unavailable' ? 'unavailable' : 'default'}
    stateProps={{ title: 'Statistiques indisponibles.', description: null }} {...props}>
    {/* The Panel loading state would insert its own status, the page announces the load once. */}
    {state === 'loading' ? <CalendarLoadingSkeleton padding="0" /> : (
      // Mockup `Écran/Mois`: each card has the icon of its type on the calendar chip and its label in sentence case
      // (see .calendar-stats in app-overrides.css).
      <div className="calendar-stats grid grid-cols-2 gap-3">
        {stats.items.map((item) => (
          <MetricCard key={item.category} data-category={item.category} size="s" icon={statIconOf(item.category)} label={item.label} value={item.value} trendLabel={`En ${stats.month}`} />
        ))}
      </div>
    )}
  </Panel>
);
