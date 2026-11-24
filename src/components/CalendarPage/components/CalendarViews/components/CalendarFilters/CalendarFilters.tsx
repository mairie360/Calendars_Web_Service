import React from 'react';

import type { CalendarEventFilters } from '@/app/calendar/filters';
import { joinClasses } from '@/components/CalendarPage/calendar-style';
import { ActiveFilterTags } from './components/ActiveFilterTags';
import { FilterFields, type CalendarFilterOption } from './components/FilterFields';
import { FiltersDrawer } from './components/FiltersDrawer';

export interface CalendarFiltersProps {
  filters: CalendarEventFilters;
  categories: readonly CalendarFilterOption[];
  services: readonly CalendarFilterOption[];
  activeCount: number;
  /** Occurrences of the displayed period kept by the filters, and before them. */
  shownCount: number;
  totalCount: number;
  onChange: (patch: Partial<CalendarEventFilters>) => void;
  onClear: () => void;
  className?: string;
}

/**
 * Filter bar under the calendar toolbar: « Du », « Au », « Type », « Service », then the active filters as tags with
 * « Effacer les filtres ». On small screens the fields move to a drawer opened by « Filtres ».
 */
export const CalendarFilters = ({ filters, categories, services, activeCount, shownCount, totalCount, onChange, onClear, className }: CalendarFiltersProps) => (
  <div role="search" aria-label="Filtrer les événements"
    className={joinClasses('calendar-filters flex flex-col gap-3 border-b border-[var(--mairie-border)] pb-4', className)}>
    <FilterFields className="max-sm:hidden" idPrefix="calendar-filter" filters={filters} categories={categories} services={services} onChange={onChange} />
    <FiltersDrawer className="sm:hidden" activeCount={activeCount} shownCount={shownCount} onClear={onClear}>
      <FilterFields idPrefix="calendar-filter-drawer" layout="drawer" filters={filters} categories={categories} services={services} onChange={onChange} />
    </FiltersDrawer>
    <ActiveFilterTags filters={filters} categories={categories} services={services} shownCount={shownCount} totalCount={totalCount}
      onChange={onChange} onClear={onClear} />
  </div>
);
