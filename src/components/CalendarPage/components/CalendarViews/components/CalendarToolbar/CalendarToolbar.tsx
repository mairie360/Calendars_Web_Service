import React from 'react';

import { Button, NextIconButton, PreviousIconButton, SegmentedControl } from '@mairie360/lib-components/primitives';
import { defaultViewOptions } from '@/components/CalendarPage/calendar-constants';
import { joinClasses } from '@/components/CalendarPage/calendar-style';
import type { CalendarToolbarProps } from '@/components/CalendarPage/calendar-types';
import type { CalendarViewMode } from '@/app/calendar/types';

export type { CalendarToolbarProps } from '@/components/CalendarPage/calendar-types';

/**
 * MAIR-893 (F2, F3): lib Précédent / Suivant (one month, week or day), « Aujourd'hui », and the view
 * choice as a lib SegmentedControl. The period itself is the title of the calendar panel.
 */
export const CalendarToolbar = ({
  title,
  view,
  viewOptions = defaultViewOptions,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  previousLabel = 'Période précédente',
  nextLabel = 'Période suivante',
  className = '',
  ...props
}: CalendarToolbarProps) => (
  <div
    className={joinClasses('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}
    {...props}
  >
    <div className="flex min-w-0 items-center gap-2" role="group" aria-label={title ? `Navigation : ${title}` : 'Navigation dans le calendrier'}>
      <PreviousIconButton size="s" label={previousLabel} onClick={onPrevious} />
      <NextIconButton size="s" label={nextLabel} onClick={onNext} />
      <Button variant="ghost" tone="neutral" size="s" label="Aujourd’hui" onClick={onToday} />
    </div>

    <SegmentedControl<CalendarViewMode> label="Changer de vue" size="m"
      options={viewOptions.map(option => ({ key: option.value, label: option.label }))}
      value={view} onChange={next => onViewChange?.(next)} />
  </div>
);
