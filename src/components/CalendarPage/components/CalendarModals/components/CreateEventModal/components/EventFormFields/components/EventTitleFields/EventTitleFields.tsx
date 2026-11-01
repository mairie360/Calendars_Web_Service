import { TextArea, TextField } from '@mairie360/lib-components/primitives';

/** Title and description of the event. */

export const EventTitleFields = ({ title, description, onTitle, onDescription }: { title: string; description: string; onTitle: (value: string) => void; onDescription: (value: string) => void }) => (
  <>
    <TextField id="event-title" name="title" label="Titre" required size="s" value={title} placeholder="Titre de l’événement" onChange={(event) => onTitle(event.target.value)} />
    <TextArea id="event-description" name="description" label="Description" size="s" rows={3} value={description} placeholder="Description de l’événement" onChange={(event) => onDescription(event.target.value)} />
  </>
);

/** Where the event takes place. */
