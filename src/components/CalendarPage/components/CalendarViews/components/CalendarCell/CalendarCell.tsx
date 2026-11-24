import React from 'react';

import { joinClasses } from '@/components/CalendarPage/calendar-style';
import type { CalendarCellProps } from '@/components/CalendarPage/calendar-types';

export type { CalendarCellProps } from '@/components/CalendarPage/calendar-types';

/**
 * MAIR-905: a day of the month view (Figma `Calendrier/MonthCell`). Default, Selected, Today (the today
 * marker sets `aria-current="date"`: accent border and the number on an accent pill, see app-overrides.css)
 * and Outside (a day of the previous or next month, shown on `surface-raised` and not interactive).
 */
export const CalendarCell = ({
  selected = false,
  muted = false,
  outside = false,
  day,
  children,
  className = '',
  type = 'button',
  ...props
}: CalendarCellProps) => {
  const number = day !== undefined && (
    <span className={joinClasses('calendar-day-number inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-sm font-medium leading-5',
      selected && !outside && 'text-[var(--mairie-accent)]')}>{day}</span>
  );
  if (outside) {
    return (
      <div aria-hidden="true" data-state="outside"
        className={joinClasses('calendar-cell-outside rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] p-2 text-[var(--mairie-muted)]', className)}>
        {number}
      </div>
    );
  }
  return (
    <button
      type={type}
      data-state={selected ? 'selected' : 'default'}
      className={joinClasses(
        'min-h-16 w-full rounded-md border bg-[var(--mairie-surface)] p-2 text-left align-top text-sm leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/30',
        selected
          ? 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]'
          : 'border-[var(--mairie-border)] text-[var(--mairie-text)] hover:bg-[var(--mairie-surface-raised)]',
        muted && 'text-[var(--mairie-muted)]',
        className
      )}
      {...props}
    >
      {number}
      {children}
    </button>
  );
};
