import { CalendarDateField } from '../CalendarDateField';
import { fieldClassName, labelClassName } from '../../field-styles';
import { useEventFieldError } from '@/components/CalendarPage/components/CalendarModals/components/ValidatedModal';

/** Start and end dates with the calendar date picker; MAIR-926: their errors show under them. */
export const EventDateRange = ({ date, endDate, onDate, onEndDate }: { date: string; endDate: string; onDate: (value: string) => void; onEndDate: (value: string) => void }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <CalendarDateField id="event-date" label="Date de début" required value={date} inputClassName={fieldClassName} labelClassName={labelClassName} error={useEventFieldError('event-date')} onChange={onDate} />
    <CalendarDateField id="event-end-date" label="Date de fin" value={endDate} inputClassName={fieldClassName} labelClassName={labelClassName} error={useEventFieldError('event-end-date')} onChange={onEndDate} />
  </div>
);
