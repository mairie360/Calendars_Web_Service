import React from 'react';
import { CancelButton, CreateButton, Modal } from '@mairie360/lib-components/primitives';

import { defaultEventCategories } from '@/components/CalendarPage/calendar-constants';
import { defaultEventValues, submittedEventValues } from './event-form-values';
import { EventFormFields } from './components/EventFormFields';
import type { CreateCalendarEventValues, CreateEventModalProps } from '@/components/CalendarPage/calendar-types';

export type { CalendarAssignee, CalendarAssigneeId, CalendarEventCategoryOption, CreateCalendarEventValues, CreateEventModalProps } from '@/components/CalendarPage/calendar-types';

/** Create or edit an event in the lib `Modal` (Figma Calendars « Nouvel événement »); the footer submits the form. */
export const CreateEventModal = ({
  isOpen, people = [], categories = defaultEventCategories, initialValues, canCreateRecurringEvents = true,
  title = 'Créer un événement', subtitle = 'Ajouter un nouvel événement au calendrier', cancelLabel = 'Annuler', submitLabel = 'Créer l’événement',
  onCancel, onDismiss = onCancel, onCreate,
}: CreateEventModalProps) => {
  const defaultCategory = categories[0]?.value || '';
  const [values, setValues] = React.useState<CreateCalendarEventValues>(() => defaultEventValues(initialValues, defaultCategory));
  const formId = React.useId();
  React.useEffect(() => { if (isOpen) setValues(defaultEventValues(initialValues, defaultCategory)); }, [defaultCategory, initialValues, isOpen]);
  if (!isOpen) return null;
  const update = <Key extends keyof CreateCalendarEventValues>(key: Key, value: CreateCalendarEventValues[Key]) => setValues((current) => ({ ...current, [key]: value }));
  const updateRecurrence = <Key extends keyof CreateCalendarEventValues['recurrence']>(key: Key, value: CreateCalendarEventValues['recurrence'][Key]) =>
    setValues((current) => ({ ...current, recurrence: { ...current.recurrence, [key]: value } }));
  return (
    <Modal open title={title} description={subtitle} size="m" closeLabel="Fermer" onClose={onDismiss}
      footer={<>
        <CancelButton label={cancelLabel} onClick={onCancel} />
        <CreateButton type="submit" form={formId} label={submitLabel} />
      </>}>
      <form id={formId} onSubmit={(event) => { event.preventDefault(); onCreate(submittedEventValues(values, canCreateRecurringEvents)); }}>
        <EventFormFields values={values} people={people} categories={categories} canRecur={canCreateRecurringEvents} update={update} updateRecurrence={updateRecurrence} />
      </form>
    </Modal>
  );
};
