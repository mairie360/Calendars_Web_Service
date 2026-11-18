import React from 'react';
import { ConfirmModal, Modal, StatusPill } from '@mairie360/lib-components/primitives';
import { getEventTone } from '@/app/calendar/constants';

import { CreateEventModal } from '../CreateEventModal';
import { defaultEventCategories } from '@/components/CalendarPage/calendar-constants';
import { normalizeDateForServer } from '@/components/CalendarPage/calendar-date';
import { EventApprovalActions, EventDetailsActions } from './components/EventDetailsActions';
import { EventFacts, approvalStatusLabels } from './components/EventFacts';
import { defaultEventValues, eventValues, selectedAssignees } from '../CreateEventModal';
import type { CreateCalendarEventValues, EventDetailsModalProps } from '@/components/CalendarPage/calendar-types';

export type { EventDetailsModalProps } from '@/components/CalendarPage/calendar-types';

const approvalTones = { pending: 'warning', approved: 'success', rejected: 'danger' } as const;

/**
 * An event's details in the lib `Modal`, switching to the edit form in place (Figma Calendars F5).
 * MAIR-929: the dialog is titled with the event; category pill and description under the title, four facts
 * with icons, then the extra content (training link, approval actions), « Supprimer » left and « Fermer » /
 * « Modifier » right, each only when allowed.
 */
export const EventDetailsModal = ({
  isOpen, extraContent, event, people = [], categories = defaultEventCategories, canEdit, canDelete = false, canValidate = false, canCreateRecurringEvents = true,
  title, closeLabel = 'Fermer', editLabel = 'Modifier', deleteLabel = 'Supprimer', approveLabel = 'Valider', rejectLabel = 'Refuser',
  cancelLabel = 'Annuler', saveLabel = 'Enregistrer', onClose, onSave, onDelete, onApprove, onReject, saving = false,
}: EventDetailsModalProps) => {
  // MAIR-931: « Supprimer » asks first; cancelling (or a refused deletion) comes back to « Supprimer ».
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const deleteRef = React.useRef<HTMLButtonElement>(null);
  const focusDelete = React.useRef(false);
  React.useEffect(() => {
    if (confirmingDelete || !focusDelete.current) return;
    focusDelete.current = false;
    deleteRef.current?.focus();
  });
  const backToDetails = () => { focusDelete.current = true; setConfirmingDelete(false); };
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
    <Modal open title={title ?? event.title} size="m" closeLabel="Fermer la fenêtre" onClose={onClose}
      footer={<EventDetailsActions event={event} labels={{ close: closeLabel, edit: editLabel, delete: deleteLabel, approve: approveLabel, reject: rejectLabel }}
        showValidation={canValidate && event.approvalStatus === 'pending'} canDelete={canDelete} canEdit={resolvedCanEdit}
        onClose={onClose} onEdit={() => { setValues(eventValues(event)); setEditing(true); }} onDelete={onDelete ? () => setConfirmingDelete(true) : undefined}
        deleteRef={deleteRef} onApprove={onApprove} onReject={onReject} />}>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {categoryLabel && <StatusPill size="s" dot tone={getEventTone(values.category)} label={String(categoryLabel)} />}
            {event.approvalStatus && event.approvalStatus !== 'approved' && (
              <StatusPill size="s" tone={approvalTones[event.approvalStatus]} label={approvalStatusLabels[event.approvalStatus]} />
            )}
          </div>
          {event.description && <p className="whitespace-normal break-words text-sm leading-6 text-[var(--mairie-muted)]">{event.description}</p>}
        </div>
        <EventFacts event={event} assignees={selectedAssignees(people, values.assigneeIds)} />
        {extraContent}
        <EventApprovalActions event={event} labels={{ close: closeLabel, edit: editLabel, delete: deleteLabel, approve: approveLabel, reject: rejectLabel }}
          showValidation={canValidate && event.approvalStatus === 'pending'} onApprove={onApprove} onReject={onReject} />
      </div>
      {/* Nested in the details dialog: the lib gives its keys and focus scope to the topmost dialog. */}
      <ConfirmModal open={confirmingDelete} role="alertdialog" title="Supprimer cet événement ?" busy={saving}
        message={`« ${event.title} » sera retiré du calendrier${event.recurrence && event.recurrence.frequency !== 'none' ? ', avec toutes ses répétitions' : ''}. Cette action est définitive.`}
        onCancel={backToDetails} initialFocus="cancel"
        onConfirm={async () => { if (await onDelete?.(event) === false) backToDetails(); }} />
    </Modal>
  );
};
