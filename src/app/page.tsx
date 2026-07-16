'use client';

import {
  CalendarSidebar,
  CalendarToolbar,
  Card,
  CreateEventModal,
  DaySchedule,
  EventDetailsModal,
  MonthGrid,
  PageTitleBar,
  WeekGrid,
} from "@mairie360/lib-components";
import { RefreshCw } from "lucide-react";
import { AppShell } from "./_components/app-shell";
import { useCalendarPage } from "./calendar/use-calendar-page";

export default function Page() {
  const calendar = useCalendarPage();

  return (
    <AppShell activeItem="calendar">
      <PageTitleBar
        title="Calendrier & Événements"
        subtitle="Planifiez et organisez vos activités"
        actionLabel="Nouvel événement"
        className="calendar-title-bar"
        onAction={() => calendar.openCreateModal()}
      />

      <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <Card className="min-h-[620px] overflow-hidden rounded-lg">
          <div className="px-6 pb-8 pt-6">
            {calendar.loading || calendar.saving || calendar.error ? (
              <div className="mb-5 flex flex-col gap-3 rounded-md border border-[#d8d2ca] bg-[#fbfaf9] px-4 py-3 text-sm text-[#334155] sm:flex-row sm:items-center sm:justify-between">
                <span role={calendar.error ? "alert" : "status"}>
                  {calendar.error
                    ? `BFF calendrier : ${calendar.error}`
                    : calendar.saving
                      ? "Synchronisation avec le BFF calendrier…"
                      : "Chargement des données du calendrier…"}
                </span>
                {calendar.error ? (
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#d8d2ca] bg-white px-3 text-sm font-semibold text-[#172033] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/25"
                    onClick={() => void calendar.refreshData()}
                  >
                    <RefreshCw className="size-4" strokeWidth={1.8} />
                    <span>Réessayer</span>
                  </button>
                ) : null}
              </div>
            ) : null}

            <CalendarToolbar
              title={calendar.periodTitle}
              view={calendar.view}
              onPrevious={calendar.handlePrevious}
              onNext={calendar.handleNext}
              onViewChange={calendar.setView}
            />

            <div className="mt-9 overflow-x-auto">
              {calendar.view === "month" && (
                <MonthGrid
                  currentDate={calendar.currentDate}
                  selectedDate={calendar.selectedDate}
                  events={calendar.events}
                  onSelectDate={calendar.handleSelectDate}
                  onEventClick={calendar.handleEventClick}
                />
              )}

              {calendar.view === "week" && (
                <WeekGrid
                  currentDate={calendar.currentDate}
                  selectedDate={calendar.selectedDate}
                  events={calendar.events}
                  onSelectDate={calendar.handleSelectDate}
                  onSelectSlot={calendar.handleSelectSlot}
                  onEventClick={calendar.handleEventClick}
                />
              )}

              {calendar.view === "day" && (
                <DaySchedule
                  currentDate={calendar.selectedDate}
                  events={calendar.events}
                  onSelectSlot={calendar.handleSelectSlot}
                  onEventClick={calendar.handleEventClick}
                />
              )}
            </div>
          </div>
        </Card>

        <CalendarSidebar
          events={calendar.events}
          currentDate={calendar.selectedDate}
          stats={calendar.stats}
          showEmptyState={false}
          onEventClick={calendar.handleEventClick}
        />
      </div>

      <CreateEventModal
        isOpen={calendar.createModalOpen}
        people={calendar.people}
        categories={calendar.categories}
        initialValues={calendar.createInitialValues}
        title="Nouvel événement"
        subtitle="Ajoutez une date au calendrier de la mairie."
        cancelLabel="Annuler"
        submitLabel="Créer"
        onCancel={() => calendar.setCreateModalOpen(false)}
        onCreate={calendar.handleCreateEvent}
      />

      <EventDetailsModal
        isOpen={Boolean(calendar.selectedEvent)}
        event={calendar.selectedEvent}
        people={calendar.people}
        categories={calendar.categories}
        canEdit={Boolean(calendar.selectedEvent?.canEdit) && !calendar.saving}
        canDelete={Boolean(calendar.selectedEvent?.canDelete) && !calendar.saving}
        canValidate={Boolean(calendar.selectedEvent?.canValidate) && !calendar.saving}
        closeLabel="Fermer"
        editLabel="Modifier"
        deleteLabel="Supprimer"
        cancelLabel="Annuler"
        saveLabel="Enregistrer"
        onClose={() => calendar.setSelectedEvent(null)}
        onSave={calendar.handleSaveEvent}
        onDelete={calendar.handleDeleteEvent}
        onApprove={(event) => void calendar.handleValidateEvent(event, "approved")}
        onReject={(event) => void calendar.handleValidateEvent(event, "rejected")}
      />
    </AppShell>
  );
}
