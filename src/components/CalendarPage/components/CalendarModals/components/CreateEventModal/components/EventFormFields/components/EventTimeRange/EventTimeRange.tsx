import { TimeField } from '@mairie360/lib-components/primitives';

import { useEventFieldError } from '@/components/CalendarPage/components/CalendarModals/components/ValidatedModal';

/**
 * Start and end times on the lib `TimeField` (« 09:00 », MAIR-1256 artifact), by quarter hour;
 * MAIR-926: « L’heure de fin doit suivre l’heure de début. » under the end.
 */
export const EventTimeRange = ({ startTime, endTime, onStart, onEnd }: { startTime: string; endTime: string; onStart: (value: string) => void; onEnd: (value: string) => void }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <TimeField id="event-start-time" name="startTime" label="Heure de début" size="s" step={900} value={startTime} error={useEventFieldError('event-start-time')} onChange={(event) => onStart(event.target.value)} />
    <TimeField id="event-end-time" name="endTime" label="Heure de fin" size="s" step={900} value={endTime} error={useEventFieldError('event-end-time')} onChange={(event) => onEnd(event.target.value)} />
  </div>
);
