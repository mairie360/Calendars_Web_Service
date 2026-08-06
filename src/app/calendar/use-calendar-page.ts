import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  formatCalendarApiError,
  loadCalendarData,
  updateCalendarEvent,
  updateCalendarEventApproval,
} from "./api";
import { getEventColor, initialDate } from "./constants";
import {
  buildCreateInitialValues,
  formatDateForQuery,
  getCalendarPeriodRange,
  getNextPeriod,
  getPeriodTitle,
  getPreviousPeriod,
  parseDateInput,
} from "./date-utils";
import { buildStats } from "./stats";
import type { CalendarReferenceOption } from "./api";
import type {
  CalendarAssignee,
  CalendarEventItem,
  CalendarViewMode,
  CreateCalendarEventValues,
} from "./types";

export function useCalendarPage() {
  const [view, setView] = useState<CalendarViewMode>("month");
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [people, setPeople] = useState<CalendarAssignee[]>([]);
  const [categories, setCategories] = useState<CalendarReferenceOption[]>([]);
  const [services, setServices] = useState<CalendarReferenceOption[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createInitialValues, setCreateInitialValues] = useState(() =>
    buildCreateInitialValues(initialDate),
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => buildStats(events, selectedDate), [events, selectedDate]);
  const periodTitle = useMemo(() => getPeriodTitle(view, currentDate), [currentDate, view]);
  const periodRange = useMemo(
    () => getCalendarPeriodRange(view, currentDate),
    [currentDate, view],
  );
  const rangeFrom = useMemo(() => formatDateForQuery(periodRange.from), [periodRange.from]);
  const rangeTo = useMemo(() => formatDateForQuery(periodRange.to), [periodRange.to]);

  const loadData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);

      try {
        const calendarData = await loadCalendarData({
          from: rangeFrom,
          to: rangeTo,
          signal,
        });

        if (signal?.aborted) return;

        setEvents(calendarData.events);
        setPeople(calendarData.people);
        setCategories(calendarData.categories);
        setServices(calendarData.services);
        setError(null);
      } catch (loadError) {
        if (
          signal?.aborted ||
          (loadError instanceof Error && loadError.name === "AbortError")
        ) {
          return;
        }

        setError(formatCalendarApiError(loadError));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [rangeFrom, rangeTo],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadData(controller.signal);

    return () => controller.abort();
  }, [loadData]);

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

  const handleCreateEvent = async (values: CreateCalendarEventValues) => {
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      const createdEvent = await createCalendarEvent(values, people);

      if (!createdEvent) {
        throw new Error("La réponse du BFF ne contient pas l’événement créé.");
      }

      const enrichedEvent = {
        ...createdEvent,
        colorClassName: getEventColor(createdEvent.category),
      } satisfies CalendarEventItem;

      setEvents((currentEvents) => [...currentEvents, enrichedEvent]);
      setCreateModalOpen(false);
      setSelectedDate(parseDateInput(createdEvent.date));
      setCurrentDate(parseDateInput(createdEvent.date));
    } catch (createError) {
      setError(formatCalendarApiError(createError));
    } finally {
      setSaving(false);
    }
  };

  const handleEventClick = (event: unknown) => {
    setSelectedEvent(event as CalendarEventItem);
  };

  const handleSaveEvent = async (updatedEventPayload: unknown) => {
    if (saving) return;

    const updatedEvent = updatedEventPayload as CalendarEventItem;

    setSaving(true);
    setError(null);

    try {
      const savedEvent = await updateCalendarEvent(updatedEvent, people);

      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          String(event.id) === String(savedEvent.id)
            ? {
                ...event,
                ...savedEvent,
                colorClassName: getEventColor(savedEvent.category),
              }
            : event,
        ),
      );
      setSelectedEvent(null);
    } catch (saveError) {
      setError(formatCalendarApiError(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventToDelete: CalendarEventItem) => {
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      await deleteCalendarEvent(eventToDelete.id);
      setEvents((currentEvents) =>
        currentEvents.filter((event) => String(event.id) !== String(eventToDelete.id)),
      );
      setSelectedEvent(null);
    } catch (deleteError) {
      setError(formatCalendarApiError(deleteError));
    } finally {
      setSaving(false);
    }
  };

  const handleValidateEvent = async (
    eventToValidate: CalendarEventItem,
    approvalStatus: "approved" | "rejected",
  ) => {
    if (saving || !eventToValidate.canValidate) return;

    setSaving(true);
    setError(null);

    try {
      const savedEvent = await updateCalendarEventApproval(
        eventToValidate.id,
        approvalStatus,
        people,
      );

      if (!savedEvent) {
        throw new Error("La réponse du BFF ne contient pas l’événement validé.");
      }

      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          String(event.id) === String(savedEvent.id) ? savedEvent : event,
        ),
      );
      setSelectedEvent(savedEvent);
    } catch (validationError) {
      setError(formatCalendarApiError(validationError));
    } finally {
      setSaving(false);
    }
  };

  return {
    categories,
    createInitialValues,
    createModalOpen,
    currentDate,
    error,
    events,
    handleDeleteEvent,
    handleCreateEvent,
    handleEventClick,
    handleNext,
    handlePrevious,
    handleSaveEvent,
    handleSelectDate,
    handleSelectSlot,
    handleValidateEvent,
    loading,
    openCreateModal,
    people,
    periodTitle,
    refreshData: loadData,
    selectedDate,
    selectedEvent,
    setCreateModalOpen,
    setSelectedEvent,
    setView,
    services,
    saving,
    stats,
    view,
  };
}
