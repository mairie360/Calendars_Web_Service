import { NumberField, SelectField } from '@mairie360/lib-components/primitives';

import { CalendarDateField } from '../CalendarDateField';
import type { CalendarRecurrenceFrequency, CreateCalendarEventValues } from '../types';
import { toggleDay } from './event-form-values';
import { fieldClassName, labelClassName } from './field-styles';
import { RecurrenceDayPicker } from './RecurrenceDayPicker';

type Recurrence = CreateCalendarEventValues['recurrence'];
const frequencies: Array<{ value: CalendarRecurrenceFrequency; label: string }> = [
  { value: 'none', label: 'Ne se répète pas' }, { value: 'daily', label: 'Tous les jours' },
  { value: 'weekly', label: 'Chaque semaine' }, { value: 'monthly', label: 'Chaque mois' },
];

/** Frequency, interval, weekly days and end of a recurring event. */
export const EventRecurrenceFields = ({ recurrence, onChange }: { recurrence: Recurrence; onChange: <Key extends keyof Recurrence>(key: Key, value: Recurrence[Key]) => void }) => (
  <div className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] p-3">
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField id="event-recurrence" label="Récurrence" size="s" placeholder={null} value={recurrence.frequency} options={frequencies} onChange={(value) => onChange('frequency', value as CalendarRecurrenceFrequency)} />
      {recurrence.frequency !== 'none' && (
        <NumberField id="event-recurrence-interval" label="Intervalle" size="s" min={1} value={recurrence.interval || 1} onChange={(event) => onChange('interval', Number(event.target.value) || 1)} />
      )}
    </div>
    {recurrence.frequency === 'weekly' && <RecurrenceDayPicker selected={recurrence.daysOfWeek} onToggle={(day) => onChange('daysOfWeek', toggleDay(recurrence.daysOfWeek, day))} />}
    {recurrence.frequency !== 'none' && (
      <div className="mt-3">
        <CalendarDateField id="event-recurrence-end" label="Fin de récurrence" value={String(recurrence.endsOn || '')} inputClassName={fieldClassName} labelClassName={labelClassName} onChange={(value) => onChange('endsOn', value)} />
      </div>
    )}
  </div>
);
