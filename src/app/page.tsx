'use client';

import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarSidebar,
  CalendarToolbar,
  Card,
  CreateEventModal,
  DaySchedule,
  EventDetailsModal,
  Footer,
  Header,
  MonthGrid,
  PageTitleBar,
  Sidebar,
  WeekGrid,
} from "@mairie360/lib-components";

type CalendarViewMode = "month" | "week" | "day";
type CalendarAssigneeId = string | number;
type CalendarDateInput = Date | string;

type CalendarRecurrence = {
  frequency: "none" | "daily" | "weekly" | "monthly";
  interval?: number;
  daysOfWeek?: number[];
  endsOn?: CalendarDateInput;
};

type CalendarAssignee = {
  id: CalendarAssigneeId;
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
};

type CalendarEventItem = {
  id: string | number;
  title: ReactNode;
  date: CalendarDateInput;
  endDate?: CalendarDateInput;
  category?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: ReactNode;
  assigneeIds?: CalendarAssigneeId[];
  assignees?: CalendarAssignee[];
  recurrence?: CalendarRecurrence;
  colorClassName?: string;
};

type CreateCalendarEventValues = {
  title: string;
  description: string;
  date: string;
  endDate: string;
  category: string;
  startTime: string;
  endTime: string;
  location: string;
  assigneeIds: CalendarAssigneeId[];
  recurrence: CalendarRecurrence;
};

const initialDate = new Date(2026, 5, 15);

const people: CalendarAssignee[] = [
  {
    id: "as",
    name: "Admin Systeme",
    email: "admin@mairie360.fr",
    role: "Administrateur",
  },
  {
    id: "ma",
    name: "Marie Armand",
    email: "marie.armand@mairie360.fr",
    role: "Coordination",
  },
  {
    id: "jl",
    name: "Jean Laurent",
    email: "jean.laurent@mairie360.fr",
    role: "Animation",
  },
];

const categories = [
  { label: "Réunion", value: "meeting" },
  { label: "Animation", value: "activity" },
  { label: "Cérémonie", value: "ceremony" },
  { label: "Autre", value: "other" },
];

const eventColors: Record<string, string> = {
  meeting: "bg-[#e9f2ff] text-[#1256a6]",
  activity: "bg-[#eaf7ee] text-[#257444]",
  ceremony: "bg-[#fff5d8] text-[#8a5d00]",
  other: "bg-[#f3f4f6] text-[#4c5258]",
};

function parseDateInput(date: CalendarDateInput = new Date()) {
  if (date instanceof Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  const normalizedDate = date.trim();
  const serverDateMatch = normalizedDate.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (serverDateMatch) {
    const [, day, month, year] = serverDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const isoDateMatch = normalizedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsedDate = new Date(normalizedDate);
  return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
}

function addDays(date: CalendarDateInput, amount: number) {
  const nextDate = parseDateInput(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function addMonths(date: CalendarDateInput, amount: number) {
  const parsedDate = parseDateInput(date);
  return new Date(parsedDate.getFullYear(), parsedDate.getMonth() + amount, 1);
}

function formatDateForServer(date: CalendarDateInput) {
  const parsedDate = parseDateInput(date);
  const day = `${parsedDate.getDate()}`.padStart(2, "0");
  const month = `${parsedDate.getMonth() + 1}`.padStart(2, "0");
  const year = parsedDate.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatMonthYear(date: CalendarDateInput) {
  const parsedDate = parseDateInput(date);
  const month = new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(parsedDate);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${parsedDate.getFullYear()}`;
}

function formatFullDate(date: CalendarDateInput) {
  const parsedDate = parseDateInput(date);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function startOfWeek(date: CalendarDateInput) {
  const parsedDate = parseDateInput(date);
  const day = parsedDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(parsedDate, diff);
}

function getPeriodTitle(view: CalendarViewMode, date: CalendarDateInput) {
  if (view === "week") {
    return `Semaine du ${formatFullDate(startOfWeek(date))}`;
  }

  if (view === "day") {
    return formatFullDate(date);
  }

  return formatMonthYear(date);
}

function eventOccursOnDate(event: CalendarEventItem, date: CalendarDateInput) {
  const dateToCheck = parseDateInput(date);
  const start = parseDateInput(event.date);
  const end = event.endDate ? parseDateInput(event.endDate) : start;

  return start.getTime() <= dateToCheck.getTime() && end.getTime() >= dateToCheck.getTime();
}

function countEventsBetween(events: CalendarEventItem[], startDate: Date, endDate: Date) {
  let count = 0;

  for (let date = parseDateInput(startDate); date.getTime() <= endDate.getTime(); date = addDays(date, 1)) {
    count += events.filter((event) => eventOccursOnDate(event, date)).length;
  }

  return count;
}

function buildStats(events: CalendarEventItem[], selectedDate: Date) {
  if (events.length === 0) {
    return [
      { label: "Ce mois", value: "12 événements" },
      { label: "Cette semaine", value: "3 événements" },
      { label: "Aujourd'hui", value: "1 événement" },
    ];
  }

  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = addDays(weekStart, 6);
  const todayCount = countEventsBetween(events, selectedDate, selectedDate);
  const weekCount = countEventsBetween(events, weekStart, weekEnd);
  const monthCount = countEventsBetween(events, monthStart, monthEnd);
  const labelFor = (count: number) => `${count} événement${count > 1 ? "s" : ""}`;

  return [
    { label: "Ce mois", value: labelFor(monthCount) },
    { label: "Cette semaine", value: labelFor(weekCount) },
    { label: "Aujourd'hui", value: labelFor(todayCount) },
  ];
}

function resolveAssignees(assigneeIds: CalendarAssigneeId[]) {
  return people.filter((person) =>
    assigneeIds.some((assigneeId) => String(assigneeId) === String(person.id)),
  );
}

function addOneHour(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");
  const date = new Date(2026, 0, 1, Number(hours), Number(minutes));
  date.setHours(date.getHours() + 1);
  return `${date.getHours()}`.padStart(2, "0") + ":" + `${date.getMinutes()}`.padStart(2, "0");
}

function buildCreateInitialValues(date: CalendarDateInput, startTime = "09:00") {
  return {
    date: formatDateForServer(date),
    endDate: "",
    startTime,
    endTime: addOneHour(startTime),
  };
}

export default function Page() {
  const [view, setView] = useState<CalendarViewMode>("month");
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createInitialValues, setCreateInitialValues] = useState(() =>
    buildCreateInitialValues(initialDate),
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);

  const stats = useMemo(() => buildStats(events, selectedDate), [events, selectedDate]);
  const periodTitle = useMemo(() => getPeriodTitle(view, currentDate), [currentDate, view]);

  const handlePrevious = () => {
    setCurrentDate((date) => {
      if (view === "month") return addMonths(date, -1);
      if (view === "week") return addDays(date, -7);
      return addDays(date, -1);
    });
  };

  const handleNext = () => {
    setCurrentDate((date) => {
      if (view === "month") return addMonths(date, 1);
      if (view === "week") return addDays(date, 7);
      return addDays(date, 1);
    });
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
  };

  const openCreateModal = (date = selectedDate, startTime = "09:00") => {
    setCreateInitialValues(buildCreateInitialValues(date, startTime));
    setCreateModalOpen(true);
  };

  const handleSelectSlot = (date: Date, time: string) => {
    handleSelectDate(date);
    openCreateModal(date, time);
  };

  const handleCreateEvent = (values: CreateCalendarEventValues) => {
    const category = values.category || "other";
    const event: CalendarEventItem = {
      id: `event-${Date.now()}`,
      title: values.title,
      description: values.description,
      date: values.date,
      endDate: values.endDate || undefined,
      category,
      startTime: values.startTime,
      endTime: values.endTime,
      location: values.location,
      assigneeIds: values.assigneeIds,
      assignees: resolveAssignees(values.assigneeIds),
      recurrence: values.recurrence,
      colorClassName: eventColors[category] || eventColors.other,
    };

    setEvents((currentEvents) => [...currentEvents, event]);
    setCreateModalOpen(false);
    setSelectedDate(parseDateInput(values.date));
    setCurrentDate(parseDateInput(values.date));
  };

  const handleEventClick = (event: unknown) => {
    setSelectedEvent(event as CalendarEventItem);
  };

  const handleSaveEvent = (updatedEventPayload: unknown) => {
    const updatedEvent = updatedEventPayload as CalendarEventItem;

    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        String(event.id) === String(updatedEvent.id)
          ? {
              ...event,
              ...updatedEvent,
              colorClassName: eventColors[updatedEvent.category || "other"] || eventColors.other,
              assignees: resolveAssignees(updatedEvent.assigneeIds || []),
            }
          : event,
      ),
    );
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f3f0] text-[#172033]">
      <div className="flex min-h-screen">
        <div className="desktop-sidebar shrink-0">
          <Sidebar activeItem="calendar" isAdmin brandLogoSrc={null} />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header
            isAdmin
            user={{
              name: "Admin Systeme",
              email: "admin@mairie360.fr",
              role: "admin",
            }}
          />

          <main className="calendar-main flex-1">
            <PageTitleBar
              title="Calendrier & Événements"
              subtitle="Planifiez et organisez vos activités"
              actionLabel="Nouvel événement"
              className="calendar-title-bar"
              onAction={() => openCreateModal()}
            />

            <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
              <Card className="min-h-[620px] overflow-hidden rounded-lg">
                <div className="px-6 pb-8 pt-6">
                  <CalendarToolbar
                    title={periodTitle}
                    view={view}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onViewChange={(nextView) => setView(nextView)}
                  />

                  <div className="mt-9 overflow-x-auto">
                    {view === "month" && (
                      <MonthGrid
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        events={events}
                        onSelectDate={handleSelectDate}
                        onEventClick={handleEventClick}
                      />
                    )}

                    {view === "week" && (
                      <WeekGrid
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        events={events}
                        onSelectDate={handleSelectDate}
                        onSelectSlot={handleSelectSlot}
                        onEventClick={handleEventClick}
                      />
                    )}

                    {view === "day" && (
                      <DaySchedule
                        currentDate={selectedDate}
                        events={events}
                        onSelectSlot={handleSelectSlot}
                        onEventClick={handleEventClick}
                      />
                    )}
                  </div>
                </div>
              </Card>

              <CalendarSidebar
                events={events}
                currentDate={selectedDate}
                stats={stats}
                showEmptyState={false}
                onEventClick={handleEventClick}
              />
            </div>
          </main>

          <Footer year={2026} version="2.1.0" className="app-footer" />
        </div>
      </div>

      <CreateEventModal
        isOpen={createModalOpen}
        people={people}
        categories={categories}
        initialValues={createInitialValues}
        title="Nouvel événement"
        subtitle="Ajoutez une date au calendrier de la mairie."
        cancelLabel="Annuler"
        submitLabel="Créer"
        onCancel={() => setCreateModalOpen(false)}
        onCreate={handleCreateEvent}
      />

      <EventDetailsModal
        isOpen={Boolean(selectedEvent)}
        event={selectedEvent}
        people={people}
        categories={categories}
        closeLabel="Fermer"
        editLabel="Modifier"
        cancelLabel="Annuler"
        saveLabel="Enregistrer"
        onClose={() => setSelectedEvent(null)}
        onSave={handleSaveEvent}
      />
    </div>
  );
}
