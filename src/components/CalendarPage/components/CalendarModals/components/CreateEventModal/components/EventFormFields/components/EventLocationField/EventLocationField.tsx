import { TextField } from '@mairie360/lib-components/primitives';
import { useEventFieldError } from '@/components/CalendarPage/components/CalendarModals/components/ValidatedModal';

/** Where the event takes place. */
export const EventLocationField = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <TextField id="event-location" name="location" label="Lieu" size="s" value={value} placeholder="Lieu de l’événement" error={useEventFieldError('event-location')} onChange={(event) => onChange(event.target.value)} />
);
