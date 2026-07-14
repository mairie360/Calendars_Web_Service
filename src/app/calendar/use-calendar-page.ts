import { useMemo, useState } from "react";
import { currentUserCalendarService, currentUserId } from "../current-user";
import { getEventColor, initialDate, resolveAssignees } from "./constants";
import {
  buildCreateInitialValues,
  getNextPeriod,
  getPeriodTitle,
  getPreviousPeriod,
  parseDateInput,
} from "./date-utils";
import { buildStats } from "./stats";
import type { CalendarEventItem, CalendarViewMode, CreateCalendarEventValues } from "./types";

export function useCalendarPage() {
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
    setCurrentDate((date) => getPreviousPeriod(date, view));
  };

  const handleNext = () => {
    setCurrentDate((date) => getNextPeriod(date, view));
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
    const createdEvent: CalendarEventItem = {
      id: `event-${Date.now()}`,
      title: values.title,
      description: values.description,
      date: values.date,
      endDate: values.endDate || undefined,
      category,
      service: values.service || currentUserCalendarService,
      startTime: values.startTime,
      endTime: values.endTime,
      location: values.location,
      assigneeIds: values.assigneeIds,
      assignees: resolveAssignees(values.assigneeIds),
      recurrence: values.recurrence,
      approvalStatus: "approved",
      createdById: currentUserId,
      colorClassName: getEventColor(category),
    };

    setEvents((currentEvents) => [...currentEvents, createdEvent]);
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
              assignees: resolveAssignees(updatedEvent.assigneeIds || []),
              colorClassName: getEventColor(updatedEvent.category),
            }
          : event,
      ),
    );
    setSelectedEvent(null);
  };

  return {
    createInitialValues,
    createModalOpen,
    currentDate,
    events,
    handleCreateEvent,
    handleEventClick,
    handleNext,
    handlePrevious,
    handleSaveEvent,
    handleSelectDate,
    handleSelectSlot,
    openCreateModal,
    periodTitle,
    selectedDate,
    selectedEvent,
    setCreateModalOpen,
    setSelectedEvent,
    setView,
    stats,
    view,
  };
}
