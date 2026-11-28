import { TextArea, TextField } from '@mairie360/lib-components/primitives';
import { useEventFieldError } from '@/components/CalendarPage/components/CalendarModals/components/ValidatedModal';

/** Title and description of the event; MAIR-926: their validation errors show under them. */
export const EventTitleFields = ({ title, description, onTitle, onDescription }: { title: string; description: string; onTitle: (value: string) => void; onDescription: (value: string) => void }) => {
  const titleError = useEventFieldError('event-title');
  const descriptionError = useEventFieldError('event-description');
  return (
    <>
      <TextField id="event-title" name="title" label="Titre" required size="s" value={title} placeholder="Titre de l’événement" error={titleError} onChange={(event) => onTitle(event.target.value)} />
      <TextArea id="event-description" name="description" label="Description" size="s" rows={3} value={description} placeholder="Ordre du jour, informations pratiques…" error={descriptionError} onChange={(event) => onDescription(event.target.value)} />
    </>
  );
};
