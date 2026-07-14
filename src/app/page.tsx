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
import { AppShell } from "./_components/app-shell";
import { categories, people } from "./calendar/constants";
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
        people={people}
        categories={categories}
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
        people={people}
        categories={categories}
        closeLabel="Fermer"
        editLabel="Modifier"
        cancelLabel="Annuler"
        saveLabel="Enregistrer"
        onClose={() => calendar.setSelectedEvent(null)}
        onSave={calendar.handleSaveEvent}
      />
    </AppShell>
  );
}
