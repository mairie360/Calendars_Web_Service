import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  formatCalendarApiError,
  loadCalendarData,
  updateCalendarEvent,
  updateCalendarEventApproval,
} from "./api";
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

function calendarDateFromLink(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = parseDateInput(value);
  return formatDateForQuery(date) === value ? date : null;
}

export function useCalendarPage() {
  const [view, setView] = useState<CalendarViewMode>("month");
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const selectionFollowsToday = useRef(true);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [people, setPeople] = useState<CalendarAssignee[]>([]);
  const [categories, setCategories] = useState<CalendarReferenceOption[]>([]);
  const [services, setServices] = useState<CalendarReferenceOption[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createInitialValues, setCreateInitialValues] = useState(() =>
    buildCreateInitialValues(currentDate),
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const mutationInFlight = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<{ ready: boolean; eventId: string | null }>({
    ready: false,
    eventId: null,
  });

  const stats = useMemo(() => buildStats(events, selectedDate), [events, selectedDate]);
  const periodTitle = useMemo(() => getPeriodTitle(view, currentDate), [currentDate, view]);
  const periodRange = useMemo(
    () => getCalendarPeriodRange(view, currentDate),
    [currentDate, view],
  );
  const rangeFrom = useMemo(() => formatDateForQuery(periodRange.from), [periodRange.from]);
  const rangeTo = useMemo(() => formatDateForQuery(periodRange.to), [periodRange.to]);

  useEffect(() => {
    const params = new URLSearchParams(
      typeof window === "undefined" ? "" : window.location.search,
    );
    const linkedDate = calendarDateFromLink(params.get("date"));
    // Date-dependent UI stays hidden until this browser-local initialization.
    // A server process/module date must not leak into the hydration markup.
    const openingDate = linkedDate ?? new Date();
    selectionFollowsToday.current = !linkedDate;
    setCurrentDate(openingDate);
    setSelectedDate(openingDate);
    setLink({ ready: true, eventId: linkedDate ? params.get("event") || null : null });
  }, []);

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
    if (!link.ready) return;

    const controller = new AbortController();
    void loadData(controller.signal);

    return () => controller.abort();
  }, [link.ready, loadData]);

  useEffect(() => {
    if (loading || error || !link.eventId) return;

    const linkedEvent = events.find((event) => String(event.id) === link.eventId);
    if (linkedEvent) setSelectedEvent(linkedEvent);
    setLink({ ready: true, eventId: null });
  }, [error, events, link.eventId, loading]);

  const handlePrevious = () => {
    setCurrentDate((date) => getPreviousPeriod(date, view));
  };

  const handleNext = () => {
    setCurrentDate((date) => getNextPeriod(date, view));
  };

  const handleSelectDate = (date: Date) => {
    selectionFollowsToday.current = false;
    setSelectedDate(date);
    setCurrentDate(date);
  };

  const openCreateModal = (date?: Date, startTime = "09:00") => {
    if (!link.ready) return;
    // Refresh an implicit "today" when a tab crosses midnight, but never
    // overwrite a deliberately selected date, deep link or time slot.
    const creationDate = date ?? (selectionFollowsToday.current ? new Date() : selectedDate);
    setError(null);
    setCreateInitialValues(buildCreateInitialValues(creationDate, startTime));
    setCreateModalOpen(true);
  };

  const handleSelectSlot = (date: Date, time: string) => {
    handleSelectDate(date);
    openCreateModal(date, time);
  };

  const handleCreateEvent = async (values: CreateCalendarEventValues) => {
    if (mutationInFlight.current) return;
    mutationInFlight.current = true;

    setSaving(true);
    setError(null);

    try {
      const createdEvent = await createCalendarEvent(values, people);

      setEvents((currentEvents) => [...currentEvents, createdEvent]);
      setCreateModalOpen(false);
      selectionFollowsToday.current = false;
      setSelectedDate(parseDateInput(createdEvent.date));
      setCurrentDate(parseDateInput(createdEvent.date));
    } catch (createError) {
      setError(formatCalendarApiError(createError));
    } finally {
      mutationInFlight.current = false;
      setSaving(false);
    }
  };

  const handleEventClick = (event: unknown) => {
    setError(null);
    setSelectedEvent(event as CalendarEventItem);
  };

  const handleSaveEvent = async (updatedEventPayload: unknown) => {
    if (mutationInFlight.current) return false;
    mutationInFlight.current = true;

    const updatedEvent = updatedEventPayload as CalendarEventItem;

    setSaving(true);
    setError(null);

    try {
      const savedEvent = await updateCalendarEvent(updatedEvent, people);

      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          String(event.id) === String(savedEvent.id)
            ? { ...event, ...savedEvent }
            : event,
        ),
      );
      setSelectedEvent(null);
      return true;
    } catch (saveError) {
      setError(formatCalendarApiError(saveError));
      return false;
    } finally {
      mutationInFlight.current = false;
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventToDelete: CalendarEventItem) => {
    if (mutationInFlight.current) return;
    mutationInFlight.current = true;

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
      mutationInFlight.current = false;
      setSaving(false);
    }
  };

  const handleValidateEvent = async (
    eventToValidate: CalendarEventItem,
    approvalStatus: "approved" | "rejected",
  ) => {
    // Simple garde d'affichage : le BFF reste seul juge du droit de valider (403 sinon).
    if (mutationInFlight.current || !eventToValidate.canValidate) return;
    mutationInFlight.current = true;

    setSaving(true);
    setError(null);

    try {
      const savedEvent = await updateCalendarEventApproval(
        eventToValidate.id,
        approvalStatus,
        people,
      );

      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          String(event.id) === String(savedEvent.id) ? savedEvent : event,
        ),
      );
      setSelectedEvent(savedEvent);
    } catch (validationError) {
      setError(formatCalendarApiError(validationError));
    } finally {
      mutationInFlight.current = false;
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
    ready: link.ready,
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
