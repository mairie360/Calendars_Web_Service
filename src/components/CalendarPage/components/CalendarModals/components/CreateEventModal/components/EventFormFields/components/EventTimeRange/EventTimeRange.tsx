import { SelectField } from '@mairie360/lib-components/primitives';

import { timeOptions } from '@/components/CalendarPage/components/CalendarModals/components/CreateEventModal/event-form-values';

/** Start and end times by quarter hour. */
export const EventTimeRange = ({ startTime, endTime, onStart, onEnd }: { startTime: string; endTime: string; onStart: (value: string) => void; onEnd: (value: string) => void }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <SelectField id="event-start-time" name="startTime" label="Heure de début" size="s" placeholder="Sélectionner une heure" value={startTime} options={timeOptions} onChange={onStart} />
    <SelectField id="event-end-time" name="endTime" label="Heure de fin" size="s" placeholder="Sélectionner une heure" value={endTime} options={timeOptions} onChange={onEnd} />
  </div>
);
