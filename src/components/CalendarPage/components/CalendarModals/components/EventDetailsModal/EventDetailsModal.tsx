import React from 'react';
import { Modal } from '@mairie360/lib-components/primitives';

import { CreateEventModal } from '../CreateEventModal';
import { defaultEventCategories } from '@/components/CalendarPage/calendar-constants';
import { normalizeDateForServer } from '@/components/CalendarPage/calendar-date';
import { EventAssigneesList } from './components/EventAssigneesList';
import { EventDetailsActions } from './components/EventDetailsActions';
import { EventFacts } from './components/EventFacts';
import { defaultEventValues, eventValues, selectedAssignees } from '../CreateEventModal';
import type { CreateCalendarEventValues, EventDetailsModalProps } from '@/components/CalendarPage/calendar-types';

export type { EventDetailsModalProps } from '@/components/CalendarPage/calendar-types';

/** An event's details in the lib `Modal`, switching to the edit form in place (Figma Calendars « Détail de l’événement »). */
export const EventDetailsModal = ({
  isOpen, extraContent, event, people = [], categories = defaultEventCategories, canEdit, canDelete = false, canValidate = false, canCreateRecurringEvents = true,
  title = 'Détail de l’événement', closeLabel = 'Fermer', editLabel = 'Modifier', deleteLabel = 'Supprimer', approveLabel = 'Valider', rejectLabel = 'Refuser',
  cancelLabel = 'Annuler', saveLabel = 'Enregistrer', onClose, onSave, onDelete, onApprove, onReject,
}: EventDetailsModalProps) => {
  const [editing, setEditing] = React.useState(false);
  const [values, setValues] = React.useState<CreateCalendarEventValues>(() => event ? eventValues(event) : defaultEventValues(undefined, categories[0]?.value || ''));
  const eventId = event ? String(event.id) : null;
  const previousEventIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!isOpen || !event || !eventId) { previousEventIdRef.current = null; setEditing(false); return; }
    if (previousEventIdRef.current !== eventId) { setValues(eventValues(event)); setEditing(false); previousEventIdRef.current = eventId; }
  }, [event, eventId, isOpen]);
  React.useEffect(() => { if (isOpen && event && !editing) setValues(eventValues(event)); }, [editing, event, isOpen]);

  if (!isOpen || !event) return null;
  const categoryLabel = categories.find((category) => category.value === values.category)?.label || values.category || undefined;
  const resolvedCanEdit = (canEdit ?? Boolean(onSave)) && Boolean(onSave);

  const handleSave = (submitted: CreateCalendarEventValues) => {
    onSave?.({
      ...event,
      id: event.id,
      title: submitted.title,
      description: submitted.description,
      date: normalizeDateForServer(submitted.date),
      endDate: normalizeDateForServer(submitted.endDate || submitted.date),
      category: submitted.category,
      service: submitted.service,
      startTime: submitted.startTime,
      endTime: submitted.endTime,
      location: submitted.location,
      assigneeIds: submitted.assigneeIds,
      assignees: selectedAssignees(people, submitted.assigneeIds),
      recurrence: submitted.recurrence.frequency === 'none'
        ? { frequency: 'none', interval: 1, daysOfWeek: [], endsOn: '' }
        : { ...submitted.recurrence, endsOn: normalizeDateForServer(submitted.recurrence.endsOn) },
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <CreateEventModal isOpen people={people} categories={categories} initialValues={values} canCreateRecurringEvents={canCreateRecurringEvents}
        title="Modifier l’événement" subtitle="Modifier les informations de l’événement sélectionné" cancelLabel={cancelLabel} submitLabel={saveLabel}
        onCancel={() => { setValues(eventValues(event)); setEditing(false); }} onDismiss={onClose} onCreate={handleSave} />
    );
  }

  return (
    <Modal open title={title} size="m" closeLabel="Fermer" onClose={onClose}
      footer={<EventDetailsActions event={event} labels={{ close: closeLabel, edit: editLabel, delete: deleteLabel, approve: approveLabel, reject: rejectLabel }}
        showValidation={canValidate && event.approvalStatus === 'pending'} canDelete={canDelete} canEdit={resolvedCanEdit}
        onClose={onClose} onEdit={() => { setValues(eventValues(event)); setEditing(true); }} onDelete={onDelete} onApprove={onApprove} onReject={onReject} />}>
      <div className="space-y-4">
        <div>
          <div className="whitespace-normal break-words text-xl font-semibold leading-7 text-[var(--mairie-text)]">{event.title}</div>
          {event.description && <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-[var(--mairie-muted)]">{event.description}</p>}
        </div>
        {extraContent}
        <EventFacts event={event} categoryLabel={categoryLabel ? String(categoryLabel) : undefined} />
        <EventAssigneesList assignees={selectedAssignees(people, values.assigneeIds)} />
      </div>
    </Modal>
  );
};
