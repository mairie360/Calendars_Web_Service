import React from 'react';
import { X } from 'lucide-react';

import { Button, Tag } from '@mairie360/lib-components/primitives';
import type { CalendarEventFilters } from '@/app/calendar/filters';
import { joinClasses } from '@/components/CalendarPage/calendar-style';

type Option = { value: string; label: string };

export interface ActiveFilterTagsProps {
  filters: CalendarEventFilters;
  categories: readonly Option[];
  services: readonly Option[];
  /** Occurrences of the displayed period kept by the filters, and before them. */
  shownCount: number;
  totalCount: number;
  onChange: (patch: Partial<CalendarEventFilters>) => void;
  onClear: () => void;
  className?: string;
}

/** « 24 nov. », with the year when it is not the current one. */
export function shortFilterDate(iso: string, today = new Date()) {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', ...(year === today.getFullYear() ? {} : { year: 'numeric' }) }).format(date);
}

/** Label of the date range: « Du 24 nov. au 30 nov. », « À partir du 24 nov. » or « Jusqu’au 30 nov. ». */
export function dateRangeLabel(from: string, to: string, today = new Date()) {
  if (from && to) return `Du ${shortFilterDate(from, today)} au ${shortFilterDate(to, today)}`;
  if (from) return `À partir du ${shortFilterDate(from, today)}`;
  if (to) return `Jusqu’au ${shortFilterDate(to, today)}`;
  return '';
}

/** The active filters as removable tags, « Effacer les filtres » and the count of the period; nothing without filter. */
export const ActiveFilterTags = ({ filters, categories, services, shownCount, totalCount, onChange, onClear, className }: ActiveFilterTagsProps) => {
  const date = dateRangeLabel(filters.from, filters.to);
  const labelOf = (options: readonly Option[], value: string) => options.find((option) => option.value === value)?.label ?? value;
  if (!date && filters.categories.length === 0 && !filters.service) return null;

  return (
    <div className={joinClasses('calendar-active-filters flex flex-wrap items-center gap-2', className)}>
      <ul aria-label="Filtres actifs" className="flex flex-wrap items-center gap-2">
        {date && <li><Tag size="s" label={date} removeLabel={`Retirer le filtre ${date}`} onRemove={() => onChange({ from: '', to: '' })} /></li>}
        {filters.categories.map((category) => {
          const label = labelOf(categories, category);
          return <li key={category}><Tag size="s" label={label} removeLabel={`Retirer le filtre ${label}`}
            onRemove={() => onChange({ categories: filters.categories.filter((value) => value !== category) })} /></li>;
        })}
        {filters.service && (() => {
          const label = labelOf(services, filters.service);
          return <li><Tag size="s" label={label} removeLabel={`Retirer le filtre ${label}`} onRemove={() => onChange({ service: '' })} /></li>;
        })()}
      </ul>
      <Button variant="ghost" tone="neutral" size="s" icon={X} label="Effacer les filtres" onClick={onClear} />
      <p className="text-xs text-[var(--mairie-muted)] sm:ml-auto" aria-live="polite">
        {shownCount} événement{shownCount > 1 ? 's' : ''} sur {totalCount} dans la période
      </p>
    </div>
  );
};
