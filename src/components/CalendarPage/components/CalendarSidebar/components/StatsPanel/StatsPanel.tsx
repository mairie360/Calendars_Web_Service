import React from 'react';

import { Panel } from '@mairie360/lib-components/primitives';
import type { StatsPanelProps } from '@/components/CalendarPage/calendar-types';

export type { CalendarStat, StatsPanelProps } from '@/components/CalendarPage/calendar-types';

/** Statistics panel; MAIR-911: skeleton while the calendar loads, « Statistiques indisponibles. » after a failed read. */
export const StatsPanel = ({ stats, state = 'default', title = 'Statistiques', className = '', ...props }: StatsPanelProps) => (
  <Panel title={title} className={className} state={state}
    stateProps={state === 'unavailable' ? { title: 'Statistiques indisponibles.', description: null } : { title: 'Chargement des statistiques…' }} {...props}>
    <dl className="space-y-4">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between gap-4 text-sm leading-5">
          <dt className="text-[var(--mairie-text)]">{stat.label}</dt>
          <dd className="text-right font-bold text-[var(--mairie-text)]">{stat.value}</dd>
        </div>
      ))}
    </dl>
  </Panel>
);
