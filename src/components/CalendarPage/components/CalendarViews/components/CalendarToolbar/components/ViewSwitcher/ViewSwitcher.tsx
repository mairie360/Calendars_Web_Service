import React from 'react';

import { joinClasses } from '@/components/CalendarPage/calendar-style';
import type { ViewSwitcherProps } from '@/components/CalendarPage/calendar-types';

export type { ViewSwitcherOption, ViewSwitcherProps } from '@/components/CalendarPage/calendar-types';

export const ViewSwitcher = <T extends string>({
  options,
  value,
  onChange,
  className = '',
  'aria-label': ariaLabel = 'Changer de vue',
}: ViewSwitcherProps<T>) => (
  <div
    role="tablist"
    aria-label={ariaLabel}
    className={joinClasses('inline-flex rounded-lg bg-[var(--mairie-surface-raised)] p-1 text-sm font-medium text-[var(--mairie-text)]', className)}
  >
    {options.map((option) => {
      const selected = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={selected}
          className={joinClasses(
            'h-7 rounded-md px-4 leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/30',
            selected ? 'bg-[var(--mairie-surface)] shadow-sm' : 'hover:bg-[var(--mairie-surface)]/55'
          )}
          onClick={() => onChange?.(option.value)}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
