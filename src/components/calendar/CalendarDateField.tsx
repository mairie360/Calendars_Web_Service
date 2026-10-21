import React from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

import { defaultDayLabels } from './constants';
import {
  addMonths,
  formatDateForServer,
  formatFullDate,
  formatMonthYear,
  getMonthCells,
  isSameDay,
  normalizeDateForServer,
  parseDateInput,
  serverDatePattern,
} from './date';
import { joinClasses } from './style';
import type { CalendarDateInput } from './types';

export interface CalendarDateFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  id: string;
  label: React.ReactNode;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  inputClassName?: string;
  labelClassName?: string;
  onChange: (value: string) => void;
}

const getValidDate = (value?: CalendarDateInput | null) => {
  if (!value) return null;

  const parsedDate = parseDateInput(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getDisplayValue = (value?: string) => {
  if (!value) return '';

  const normalizedValue = value.trim().replace(/\//g, '-');
  const parsedDate = getValidDate(normalizedValue);

  return parsedDate && normalizedValue.length >= 8 ? formatDateForServer(parsedDate) : normalizedValue;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const CalendarDateField = ({
  id,
  label,
  value = '',
  required = false,
  disabled = false,
  inputClassName = '',
  labelClassName = '',
  onChange,
  className = '',
  ...props
}: CalendarDateFieldProps) => {
  const selectedDate = getValidDate(value);
  const [open, setOpen] = React.useState(false);
  const [displayMonth, setDisplayMonth] = React.useState<Date>(() => selectedDate || new Date());
  const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const labelText = typeof label === 'string' ? label : 'la date';
  const popoverWidth = 292;

  const updatePopoverPosition = React.useCallback(() => {
    if (!rootRef.current || typeof window === 'undefined') return;

    const fieldRect = rootRef.current.getBoundingClientRect();
    const viewportPadding = 12;
    const gap = 6;
    const popoverHeight = popoverRef.current?.offsetHeight || 336;
    const availableBelow = window.innerHeight - fieldRect.bottom - viewportPadding;
    const availableAbove = fieldRect.top - viewportPadding;
    const placeAbove = availableBelow < popoverHeight && availableAbove > availableBelow;
    const left = clamp(fieldRect.left, viewportPadding, window.innerWidth - popoverWidth - viewportPadding);
    const top = placeAbove
      ? Math.max(viewportPadding, fieldRect.top - popoverHeight - gap)
      : Math.min(fieldRect.bottom + gap, window.innerHeight - viewportPadding - popoverHeight);

    setPopoverStyle({
      left,
      top,
      width: popoverWidth,
    });
  }, []);

  React.useEffect(() => {
    if (open) {
      setDisplayMonth(selectedDate || new Date());
      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(updatePopoverPosition);
      } else {
        updatePopoverPosition();
      }
    }
  }, [open, selectedDate?.getTime(), updatePopoverPosition]);

  React.useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickInsideRoot = Boolean(rootRef.current?.contains(target));
      const clickInsidePopover = Boolean(popoverRef.current?.contains(target));

      if (!clickInsideRoot && !clickInsidePopover) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
    };
  }, [open, updatePopoverPosition]);

  const monthCells = getMonthCells(displayMonth);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value.replace(/\//g, '-'));
  };

  const handleSelectDate = (date: Date) => {
    onChange(normalizeDateForServer(date));
    setOpen(false);
  };

  const popover =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[80] rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-3 text-[var(--mairie-text)] shadow-xl"
            style={popoverStyle}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Mois précédent"
                className="inline-flex size-8 items-center justify-center rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] transition hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
                onClick={() => setDisplayMonth((currentMonth) => addMonths(currentMonth, -1))}
              >
                <ChevronLeft className="size-4" strokeWidth={1.8} />
              </button>
              <div className="min-w-0 text-sm font-semibold text-[var(--mairie-text)]">{formatMonthYear(displayMonth)}</div>
              <button
                type="button"
                aria-label="Mois suivant"
                className="inline-flex size-8 items-center justify-center rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] transition hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
                onClick={() => setDisplayMonth((currentMonth) => addMonths(currentMonth, 1))}
              >
                <ChevronRight className="size-4" strokeWidth={1.8} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-[var(--mairie-muted)]">
              {defaultDayLabels.map((dayLabel) => (
                <div key={dayLabel}>{dayLabel}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {monthCells.map((date, index) =>
                date ? (
                  <button
                    key={formatDateForServer(date)}
                    type="button"
                    aria-label={`Choisir le ${formatFullDate(date)}`}
                    className={joinClasses(
                      'inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25',
                      selectedDate && isSameDay(selectedDate, date)
                        ? 'bg-[var(--mairie-action-background)] text-[var(--mairie-on-action)] hover:bg-[var(--mairie-action-hover-background)]'
                        : 'text-[var(--mairie-text)] hover:bg-[var(--mairie-background)]'
                    )}
                    onClick={() => handleSelectDate(date)}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <span key={`empty-${index}`} aria-hidden="true" className="size-8" />
                )
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className={joinClasses('relative', className)} {...props}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          pattern={serverDatePattern}
          required={required}
          disabled={disabled}
          value={getDisplayValue(value)}
          placeholder="dd-mm-yyyy"
          title="Format attendu : dd-mm-yyyy"
          className={joinClasses(inputClassName, 'pr-11')}
          onChange={handleInputChange}
        />
        <button
          type="button"
          aria-label={`Ouvrir le calendrier pour ${labelText}`}
          disabled={disabled}
          className="absolute right-1 top-1 inline-flex size-7 items-center justify-center rounded-md text-[var(--mairie-muted)] transition hover:bg-[var(--mairie-surface)] hover:text-[var(--mairie-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => setOpen((currentOpen) => !currentOpen)}
        >
          <CalendarDays className="size-4" strokeWidth={1.8} />
        </button>
      </div>

      {popover}
    </div>
  );
};
