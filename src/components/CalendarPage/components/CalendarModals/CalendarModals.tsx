"use client";
import { ValidatedCreateEventModal } from "./components/ValidatedCreateEventModal";
import { ValidatedEventDetailsModal } from "./components/ValidatedEventDetailsModal";
import type { useCalendarPage } from '@/app/calendar/use-calendar-page';

type Calendar = ReturnType<typeof useCalendarPage>;

/** The creation and detail dialogs wired to the page state. */
export const CalendarModals = ({ calendar }: { calendar: Calendar }) => (
  <>
    <ValidatedCreateEventModal isOpen={calendar.createModalOpen} people={calendar.people} categories={calendar.categories} initialValues={calendar.createInitialValues}
      title="Nouvel événement" subtitle="Ajoutez une date au calendrier de la mairie." cancelLabel="Annuler" submitLabel="Créer"
      onCancel={() => calendar.setCreateModalOpen(false)} onCreate={calendar.handleCreateEvent} saving={calendar.saving} error={calendar.mutationError} />
    <ValidatedEventDetailsModal isOpen={Boolean(calendar.selectedEvent)} event={calendar.selectedEvent} people={calendar.people} categories={calendar.categories}
      canEdit={Boolean(calendar.selectedEvent?.canEdit) && !calendar.saving} canDelete={Boolean(calendar.selectedEvent?.canDelete) && !calendar.saving}
      canValidate={Boolean(calendar.selectedEvent?.canValidate) && !calendar.saving}
      closeLabel="Fermer" editLabel="Modifier" deleteLabel="Supprimer" cancelLabel="Annuler" saveLabel="Enregistrer"
      onClose={() => calendar.setSelectedEvent(null)} onSave={calendar.handleSaveEvent} saving={calendar.saving} error={calendar.mutationError}
      onDelete={calendar.handleDeleteEvent} onApprove={(event) => void calendar.handleValidateEvent(event, "approved")} onReject={(event) => void calendar.handleValidateEvent(event, "rejected")} />
  </>
);
