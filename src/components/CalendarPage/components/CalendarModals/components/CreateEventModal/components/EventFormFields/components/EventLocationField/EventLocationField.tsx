import { TextArea, TextField } from '@mairie360/lib-components/primitives';

/** Title and description of the event. */

export const EventLocationField = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <TextField id="event-location" name="location" label="Lieu" size="s" value={value} placeholder="Lieu de l’événement" onChange={(event) => onChange(event.target.value)} />
);
