import React from 'react';

import { Button, NextIconButton, PreviousIconButton, SectionTitle, SegmentedControl } from '@mairie360/lib-components/primitives';
import { defaultViewOptions } from '@/components/CalendarPage/calendar-constants';
import { joinClasses } from '@/components/CalendarPage/calendar-style';
import type { CalendarToolbarProps } from '@/components/CalendarPage/calendar-types';
import type { CalendarViewMode } from '@/app/calendar/types';

export type { CalendarToolbarProps } from '@/components/CalendarPage/calendar-types';

/**
 * Header row of the calendar card, on one line like the mockup: « ‹ › <period> [Aujourd’hui] » on the left
 * (lib Précédent / Suivant, the period as the card's h2, « Aujourd’hui » as an outline button), the view
 * choice (lib SegmentedControl) on the right.
 */
export const CalendarToolbar = ({
  title,
  titleId,
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
    className={joinClasses('calendar-toolbar flex flex-wrap items-center justify-between gap-3', className)}
    {...props}
  >
    <div className="calendar-period-nav flex min-w-0 items-center gap-1">
      <PreviousIconButton size="s" label={previousLabel} onClick={onPrevious} />
      <NextIconButton size="s" label={nextLabel} onClick={onNext} />
      {title && (
        <SectionTitle id={titleId} className="calendar-period-title mx-2 whitespace-nowrap" aria-live="polite">{title}</SectionTitle>
      )}
      <Button variant="outline" tone="neutral" size="s" label="Aujourd’hui" onClick={onToday} />
    </div>

    <SegmentedControl<CalendarViewMode> label="Changer de vue" size="m"
      options={viewOptions.map(option => ({ key: option.value, label: option.label }))}
      value={view} onChange={next => onViewChange?.(next)} />
  </div>
);
