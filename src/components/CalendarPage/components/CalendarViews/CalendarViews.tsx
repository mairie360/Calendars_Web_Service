"use client";
import type { Ref } from "react";
import { DataState } from "@mairie360/lib-components/primitives";

import { CalendarLoadingSkeleton } from '../CalendarLoadingSkeleton';
import { CalendarToolbar } from './components/CalendarToolbar';
import { DaySchedule } from './components/DaySchedule';
import { MonthGrid } from './components/MonthGrid';
import { WeekGrid } from './components/WeekGrid';
import type { useCalendarPage } from '@/app/calendar/use-calendar-page';
import type { CalendarPanelState } from '../../calendar-types';

type Calendar = ReturnType<typeof useCalendarPage>;

type CalendarViewsProps = { calendar: Calendar; gridRef: Ref<HTMLDivElement>; state?: CalendarPanelState };

/**
 * Toolbar and the month, week or day grid of the current view. MAIR-911: the toolbar stays while the
 * period loads (skeleton) or cannot be read (unavailable state with « Réessayer »).
 */
export const CalendarViews = ({ calendar, gridRef, state = "default" }: CalendarViewsProps) => (
  <>
    {/* Before the browser initialisation the period would be the server's date: no toolbar yet. */}
    {calendar.ready && <CalendarToolbar title={calendar.periodTitle} view={calendar.view} onPrevious={calendar.handlePrevious} onNext={calendar.handleNext} onToday={calendar.handleToday} onViewChange={calendar.setView} />}
    {/* Decorative skeleton, the load is announced by the page's permanent status region. */}
    {state === "loading" && <CalendarLoadingSkeleton className="mt-9" padding="var(--mairie-space-l)" />}
    {state === "unavailable" && (
      <DataState className="mt-9" state="unavailable" title="Calendrier indisponible."
        description={<span role="alert">Calendrier : {calendar.readError}</span>} onRetry={() => void calendar.refreshData()} />
    )}
    {state === "default" && <div className="calendar-grid-viewport mt-9" ref={gridRef}>
      {calendar.view === "month" && <MonthGrid className="calendar-month-grid" currentDate={calendar.currentDate} selectedDate={calendar.selectedDate} events={calendar.displayedEvents} onSelectDate={(date) => calendar.handleSelectSlot(date, "09:00")} onEventClick={calendar.handleEventClick} />}
      {calendar.view === "week" && <WeekGrid className="calendar-week-grid" currentDate={calendar.currentDate} selectedDate={calendar.selectedDate} events={calendar.displayedEvents} onSelectDate={calendar.handleSelectDate} onSelectSlot={calendar.handleSelectSlot} onEventClick={calendar.handleEventClick} onShowDay={calendar.handleShowDay} />}
      {calendar.view === "day" && <DaySchedule currentDate={calendar.selectedDate} events={calendar.displayedEvents} onSelectSlot={calendar.handleSelectSlot} onEventClick={calendar.handleEventClick} />}
    </div>}
  </>
);
