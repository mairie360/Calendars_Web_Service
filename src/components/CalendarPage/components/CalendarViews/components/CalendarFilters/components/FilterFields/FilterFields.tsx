import React from 'react';

import { DatePicker, SelectField } from '@mairie360/lib-components/primitives';
import type { CalendarEventFilters } from '@/app/calendar/filters';
import { joinClasses } from '@/components/CalendarPage/calendar-style';
import { TypeFilter, type CalendarFilterOption } from './components/TypeFilter';

export { CategoryDot, typeFilterSummary, type CalendarFilterOption } from './components/TypeFilter';

export interface FilterFieldsProps {
  /** Prefix of the field ids, so the bar and the drawer can both be mounted. */
  idPrefix: string;
  filters: CalendarEventFilters;
  categories: readonly CalendarFilterOption[];
  services: readonly CalendarFilterOption[];
  onChange: (patch: Partial<CalendarEventFilters>) => void;
  /** `bar`: one row (type in a menu); `drawer`: stacked, the types always shown. */
  layout?: 'bar' | 'drawer';
  className?: string;
}

/** The four filters: « Du » and « Au » (each optional), « Type » and « Service ». */
export const FilterFields = ({ idPrefix, filters, categories, services, onChange, layout = 'bar', className }: FilterFieldsProps) => (
  <div className={joinClasses(layout === 'bar' ? 'grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4' : 'flex flex-col gap-4', className)}>
    <div className={layout === 'drawer' ? 'grid grid-cols-2 gap-3' : 'contents'}>
      <DatePicker id={`${idPrefix}-from`} label="Du" value={filters.from || null} max={filters.to || undefined}
        onChange={(value) => onChange({ from: value ?? '' })} />
      <DatePicker id={`${idPrefix}-to`} label="Au" value={filters.to || null} min={filters.from || undefined}
        onChange={(value) => onChange({ to: value ?? '' })} />
    </div>
    <TypeFilter id={`${idPrefix}-type`} variant={layout === 'drawer' ? 'list' : 'menu'} options={categories}
      value={filters.categories} onChange={(value) => onChange({ categories: value })} />
    <SelectField id={`${idPrefix}-service`} label="Service" placeholder="Tous les services" options={services}
      value={filters.service} onChange={(value) => onChange({ service: value ?? '' })} />
  </div>
);
