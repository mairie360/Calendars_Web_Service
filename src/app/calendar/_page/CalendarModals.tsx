"use client";
import { CreateEventModal, EventDetailsModal } from "../_components/validated-event-modals";
import type { useCalendarPage } from "../use-calendar-page";

type Calendar = ReturnType<typeof useCalendarPage>;

/** The creation and detail dialogs wired to the page state. */
export const CalendarModals = ({ calendar }: { calendar: Calendar }) => (
  <>
    <CreateEventModal isOpen={calendar.createModalOpen} people={calendar.people} categories={calendar.categories} initialValues={calendar.createInitialValues}
      title="Nouvel événement" subtitle="Ajoutez une date au calendrier de la mairie." cancelLabel="Annuler" submitLabel="Créer"
      onCancel={() => calendar.setCreateModalOpen(false)} onCreate={calendar.handleCreateEvent} saving={calendar.saving} error={calendar.mutationError} />
    <EventDetailsModal isOpen={Boolean(calendar.selectedEvent)} event={calendar.selectedEvent} people={calendar.people} categories={calendar.categories}
      canEdit={Boolean(calendar.selectedEvent?.canEdit) && !calendar.saving} canDelete={Boolean(calendar.selectedEvent?.canDelete) && !calendar.saving}
      canValidate={Boolean(calendar.selectedEvent?.canValidate) && !calendar.saving}
      closeLabel="Fermer" editLabel="Modifier" deleteLabel="Supprimer" cancelLabel="Annuler" saveLabel="Enregistrer"
      onClose={() => calendar.setSelectedEvent(null)} onSave={calendar.handleSaveEvent} saving={calendar.saving} error={calendar.mutationError}
      onDelete={calendar.handleDeleteEvent} onApprove={(event) => void calendar.handleValidateEvent(event, "approved")} onReject={(event) => void calendar.handleValidateEvent(event, "rejected")} />
  </>
);
