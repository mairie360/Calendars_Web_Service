import React from 'react';
import { CancelButton, ErrorAlert, Modal, SaveButton } from '@mairie360/lib-components/primitives';

import { defaultEventCategories } from '@/components/CalendarPage/calendar-constants';
import { defaultEventValues, submittedEventValues } from './event-form-values';
import { EventFormFields } from './components/EventFormFields';
import { EventFieldErrorsContext } from '../ValidatedModal';
import type { CreateCalendarEventValues, CreateEventModalProps } from '@/components/CalendarPage/calendar-types';

export type { CalendarAssignee, CalendarAssigneeId, CalendarEventCategoryOption, CreateCalendarEventValues, CreateEventModalProps } from '@/components/CalendarPage/calendar-types';

/**
 * Create or edit an event in the lib `Modal` (Figma Calendars F4 « Nouvel événement », F6 « Modifier
 * l’événement »); the footer submits the form. MAIR-926: no subtitle, « Enregistrer » loading while saving,
 * « Impossible d’enregistrer » at the top after a refusal (the entries stay), errors under the fields.
 */
const noFieldErrors: Record<string, string> = {};

export const CreateEventModal = ({
  isOpen, people = [], categories = defaultEventCategories, initialValues, canCreateRecurringEvents = true,
  title = 'Nouvel événement', subtitle, cancelLabel = 'Annuler', submitLabel = 'Enregistrer', saving = false, error, fieldErrors,
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
        <SaveButton type="submit" form={formId} label={submitLabel} loading={saving} />
      </>}>
      {error && <ErrorAlert className="mb-4" title="Impossible d’enregistrer" description={error} />}
      {/* The page validates the form itself (errors under the fields), not the browser bubbles. */}
      <form id={formId} noValidate onSubmit={(event) => { event.preventDefault(); if (!saving) onCreate(submittedEventValues(values, canCreateRecurringEvents)); }}>
        <EventFieldErrorsContext.Provider value={fieldErrors ?? noFieldErrors}>
          <EventFormFields values={values} people={people} categories={categories} canRecur={canCreateRecurringEvents} update={update} updateRecurrence={updateRecurrence} />
        </EventFieldErrorsContext.Provider>
      </form>
    </Modal>
  );
};
