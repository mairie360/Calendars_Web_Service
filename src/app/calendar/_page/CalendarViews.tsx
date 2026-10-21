"use client";
import type { Ref } from "react";

import { CalendarToolbar, DaySchedule, MonthGrid, WeekGrid } from "@/components/calendar";
import type { useCalendarPage } from "../use-calendar-page";

type Calendar = ReturnType<typeof useCalendarPage>;

/** Toolbar and the month, week or day grid of the current view. */
export const CalendarViews = ({ calendar, gridRef }: { calendar: Calendar; gridRef: Ref<HTMLDivElement> }) => (
  <>
    <CalendarToolbar title={calendar.periodTitle} view={calendar.view} onPrevious={calendar.handlePrevious} onNext={calendar.handleNext} onViewChange={calendar.setView} />
    <div className="calendar-grid-viewport mt-9" ref={gridRef}>
      {calendar.view === "month" && <MonthGrid className="calendar-month-grid" currentDate={calendar.currentDate} selectedDate={calendar.selectedDate} events={calendar.events} onSelectDate={calendar.handleSelectDate} onEventClick={calendar.handleEventClick} />}
      {calendar.view === "week" && <WeekGrid className="calendar-week-grid" currentDate={calendar.currentDate} selectedDate={calendar.selectedDate} events={calendar.events} onSelectDate={calendar.handleSelectDate} onSelectSlot={calendar.handleSelectSlot} onEventClick={calendar.handleEventClick} />}
      {calendar.view === "day" && <DaySchedule currentDate={calendar.selectedDate} events={calendar.events} onSelectSlot={calendar.handleSelectSlot} onEventClick={calendar.handleEventClick} />}
    </div>
  </>
);
