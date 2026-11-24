import { NumberField, SelectField } from '@mairie360/lib-components/primitives';

import { CalendarDateField } from '../CalendarDateField';
import type { CalendarRecurrenceFrequency, CreateCalendarEventValues } from '@/components/CalendarPage/calendar-types';
import { toggleDay } from '@/components/CalendarPage/components/CalendarModals/components/CreateEventModal/event-form-values';
import { fieldClassName, labelClassName } from '../../field-styles';
import { RecurrenceDayPicker } from './components/RecurrenceDayPicker';
import { useEventFieldError } from '@/components/CalendarPage/components/CalendarModals/components/ValidatedModal';

type Recurrence = CreateCalendarEventValues['recurrence'];
type RecurrenceChange = <Key extends keyof Recurrence>(key: Key, value: Recurrence[Key]) => void;
const frequencies: Array<{ value: CalendarRecurrenceFrequency; label: string }> = [
  { value: 'none', label: 'Ne se répète pas' }, { value: 'daily', label: 'Tous les jours' },
  { value: 'weekly', label: 'Chaque semaine' }, { value: 'monthly', label: 'Chaque mois' },
];

/** MAIR-926: the « Récurrence » choice, next to « Catégorie ». */
export const RecurrenceFrequencyField = ({ recurrence, onChange }: { recurrence: Recurrence; onChange: RecurrenceChange }) => (
  <SelectField id="event-recurrence" label="Récurrence" size="s" placeholder={null} value={recurrence.frequency} options={frequencies} onChange={(value) => onChange('frequency', value as CalendarRecurrenceFrequency)} />
);

/** Interval, weekly days and end of a recurring event (kept from V1), under the category / recurrence row. */
export const EventRecurrenceFields = ({ recurrence, onChange }: { recurrence: Recurrence; onChange: RecurrenceChange }) => {
  const endError = useEventFieldError('event-recurrence-end');
  if (recurrence.frequency === 'none') return null;
  return (
    <div className="space-y-3 rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] p-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="event-recurrence-interval" label="Intervalle" size="s" min={1} value={recurrence.interval || 1} onChange={(event) => onChange('interval', Number(event.target.value) || 1)} />
        <CalendarDateField id="event-recurrence-end" label="Fin de récurrence" value={String(recurrence.endsOn || '')} inputClassName={fieldClassName} labelClassName={labelClassName} error={endError} onChange={(value) => onChange('endsOn', value)} />
      </div>
      {recurrence.frequency === 'weekly' && <RecurrenceDayPicker selected={recurrence.daysOfWeek} onToggle={(day) => onChange('daysOfWeek', toggleDay(recurrence.daysOfWeek, day))} />}
    </div>
  );
};
