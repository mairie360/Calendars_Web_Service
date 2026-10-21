import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ViewSwitcher } from './components/ViewSwitcher';
import { defaultViewOptions } from '@/components/CalendarPage/calendar-constants';
import { joinClasses } from '@/components/CalendarPage/calendar-style';
import type { CalendarToolbarProps } from '@/components/CalendarPage/calendar-types';

export type { CalendarToolbarProps } from '@/components/CalendarPage/calendar-types';

export const CalendarToolbar = ({
  title,
  view,
  viewOptions = defaultViewOptions,
  onViewChange,
  onPrevious,
  onNext,
  previousLabel = 'Période précédente',
  nextLabel = 'Période suivante',
  className = '',
  ...props
}: CalendarToolbarProps) => (
  <div
    className={joinClasses('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}
    {...props}
  >
    <div className="flex min-w-0 items-center gap-4">
      <button
        type="button"
        aria-label={previousLabel}
        className="inline-flex h-8 w-9 items-center justify-center rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] text-[var(--mairie-text)] transition-colors hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/30"
        onClick={onPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <h2 className="min-w-0 text-xl font-bold leading-7 text-[var(--mairie-text)]">{title}</h2>
      <button
        type="button"
        aria-label={nextLabel}
        className="inline-flex h-8 w-9 items-center justify-center rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] text-[var(--mairie-text)] transition-colors hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/30"
        onClick={onNext}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>

    <ViewSwitcher options={viewOptions} value={view} onChange={onViewChange} />
  </div>
);
