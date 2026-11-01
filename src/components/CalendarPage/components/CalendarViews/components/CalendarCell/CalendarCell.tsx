import React from 'react';

import { joinClasses } from '@/components/CalendarPage/calendar-style';
import type { CalendarCellProps } from '@/components/CalendarPage/calendar-types';

export type { CalendarCellProps } from '@/components/CalendarPage/calendar-types';

export const CalendarCell = ({
  selected = false,
  muted = false,
  children,
  className = '',
  type = 'button',
  ...props
}: CalendarCellProps) => (
  <button
    type={type}
    className={joinClasses(
      'min-h-16 w-full rounded-md border bg-[var(--mairie-surface)] p-2 text-left text-sm leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/30',
      selected
        ? 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]'
        : 'border-[var(--mairie-border)] text-[var(--mairie-text)] hover:border-[var(--mairie-border)] hover:bg-[var(--mairie-surface-raised)]',
      muted && 'text-[var(--mairie-muted)]',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
