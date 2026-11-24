import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { Checkbox, Field, controlClass, controlStyle } from '@mairie360/lib-components/primitives';
import { getEventColor, getEventTone } from '@/app/calendar/constants';
import { joinClasses } from '@/components/CalendarPage/calendar-style';

export type CalendarFilterOption = { value: string; label: string };

export interface TypeFilterProps {
  /** Id of the trigger (menu) or of the group (list); the options derive their ids from it. */
  id: string;
  options: readonly CalendarFilterOption[];
  /** Categories kept; none means every type. */
  value: readonly string[];
  onChange: (value: string[]) => void;
  /** `menu`: a field-like button opening the checkbox list (filter bar); `list`: the checkboxes always shown (drawer). */
  variant?: 'menu' | 'list';
}

/** Colour dot of a category, painted like the event pills of the grid. */
export const CategoryDot = ({ category }: { category: string }) => (
  <span aria-hidden="true" data-tone={getEventTone(category)}
    className={joinClasses('calendar-filter-dot inline-block size-2 shrink-0 rounded-full', getEventColor(category))} />
);

/** « Tous les types », the label of the only type kept, or « N types ». */
export function typeFilterSummary(options: readonly CalendarFilterOption[], value: readonly string[]) {
  if (value.length === 0) return 'Tous les types';
  if (value.length === 1) return options.find((option) => option.value === value[0])?.label ?? value[0];
  return `${value.length} types`;
}

/** Type filter: several categories, each with the colour dot of its events. */
export const TypeFilter = ({ id, options, value, onChange, variant = 'menu' }: TypeFilterProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const page = document;
    const closeOutside = (event: Event) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    page.addEventListener('pointerdown', closeOutside);
    page.addEventListener('keydown', closeOnEscape);
    return () => {
      page.removeEventListener('pointerdown', closeOutside);
      page.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const toggle = (category: string, checked: boolean) =>
    onChange(options.map((option) => option.value).filter((key) => (key === category ? checked : value.includes(key))));

  const list = (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <Checkbox key={option.value} id={`${id}-${option.value}`} checked={value.includes(option.value)}
          onChange={(event) => toggle(option.value, event.target.checked)}
          label={<span className="inline-flex items-center gap-2"><CategoryDot category={option.value} />{option.label}</span>} />
      ))}
    </div>
  );

  if (variant === 'list') {
    return (
      <fieldset id={id} className="calendar-type-filter flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-[var(--mairie-text)]">Type</legend>
        {list}
      </fieldset>
    );
  }

  const summary = typeFilterSummary(options, value);
  return (
    <div ref={rootRef} className="calendar-type-filter relative">
      <Field htmlFor={id} label="Type">
        <button ref={triggerRef} type="button" id={id} aria-haspopup="true" aria-expanded={open} aria-controls={`${id}-menu`}
          aria-label={`Type : ${summary}`} onClick={() => setOpen(!open)}
          className={joinClasses(controlClass(false), 'flex w-full items-center gap-2 text-left')} style={controlStyle('m')}>
          {value.length > 0 && <span className="flex shrink-0 gap-1">{value.map((category) => <CategoryDot key={category} category={category} />)}</span>}
          <span className={joinClasses('min-w-0 flex-1 truncate', value.length === 0 && 'text-[var(--mairie-muted)]')}>{summary}</span>
          <ChevronDown aria-hidden="true" className={joinClasses('size-4 shrink-0 text-[var(--mairie-muted)] transition-transform', open && 'rotate-180')} />
        </button>
      </Field>
      {open && (
        <div id={`${id}-menu`} role="group" aria-label="Types d’événement"
          className="absolute left-0 top-full z-20 mt-1 min-w-full rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-3 shadow-[var(--mairie-shadow)]">
          {list}
        </div>
      )}
    </div>
  );
};
