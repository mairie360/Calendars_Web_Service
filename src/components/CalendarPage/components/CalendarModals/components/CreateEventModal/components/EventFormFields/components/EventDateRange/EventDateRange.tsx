import { DatePicker } from '@mairie360/lib-components/primitives';

import { useEventFieldError } from '@/components/CalendarPage/components/CalendarModals/components/ValidatedModal';

const SERVER_DATE = /^(\d{2})-(\d{2})-(\d{4})$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The form keeps the server format « DD-MM-YYYY »; the lib DatePicker speaks ISO « YYYY-MM-DD ». */
export const toIsoDate = (value: string): string | null => {
  const trimmed = value.trim();
  const server = SERVER_DATE.exec(trimmed);
  if (server) return `${server[3]}-${server[2]}-${server[1]}`;
  return ISO_DATE.test(trimmed) ? trimmed : null;
};
export const fromIsoDate = (iso: string | null): string => {
  if (!iso || !ISO_DATE.test(iso)) return '';
  const [year, month, day] = iso.split('-');
  return `${day}-${month}-${year}`;
};

/**
 * Start and end dates on the lib `DatePicker` (MAIR-1256, artifact « jeudi 12 novembre 2026 » with its clear
 * button): picking a start fills an empty or earlier end with the same day. The hidden `data-field` inputs keep
 * the server values the validated wrapper reads; the picker triggers carry the ids it focuses on an error.
 */
export const EventDateRange = ({ date, endDate, onDate, onEndDate }: { date: string; endDate: string; onDate: (value: string) => void; onEndDate: (value: string) => void }) => {
  const startError = useEventFieldError('event-date');
  const endError = useEventFieldError('event-end-date');
  const chooseStart = (iso: string | null) => {
    const value = fromIsoDate(iso);
    onDate(value);
    const end = toIsoDate(endDate);
    if (iso && (!end || end < iso)) onEndDate(value);
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <DatePicker id="event-date" label="Date de début" required size="s" value={toIsoDate(date)} error={startError} onChange={chooseStart} />
        <input type="hidden" data-field="event-date" value={date} />
      </div>
      <div>
        <DatePicker id="event-end-date" label="Date de fin" size="s" value={toIsoDate(endDate)} min={toIsoDate(date) ?? undefined} error={endError} onChange={(iso) => onEndDate(fromIsoDate(iso))} />
        <input type="hidden" data-field="event-end-date" value={endDate} />
      </div>
    </div>
  );
};
