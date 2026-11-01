import { joinClasses } from '@/components/CalendarPage/calendar-style';
import { weekDayOptions } from '@/components/CalendarPage/calendar-constants';
import { labelClassName } from '@/components/CalendarPage/components/CalendarModals/components/CreateEventModal/components/EventFormFields/field-styles';

/** Days of a weekly recurrence; each day is a toggle button. */
export const RecurrenceDayPicker = ({ selected = [], onToggle }: { selected?: number[]; onToggle: (day: number) => void }) => (
  <div className="mt-3">
    <div className={labelClassName}>Jours</div>
    <div className="grid grid-cols-7 gap-1.5">
      {weekDayOptions.map((day) => {
        const active = selected.includes(day.value);
        return (
          <button key={day.value} type="button" aria-pressed={active} onClick={() => onToggle(day.value)}
            className={joinClasses('h-8 rounded-md border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25',
              active ? 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]' : 'border-[var(--mairie-control-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)] hover:bg-[var(--mairie-surface-raised)]')}>
            {day.label}
          </button>
        );
      })}
    </div>
  </div>
);
