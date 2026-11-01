"use client";
import type { Ref } from "react";

import { CalendarToolbar } from './components/CalendarToolbar';
import { DaySchedule } from './components/DaySchedule';
import { MonthGrid } from './components/MonthGrid';
import { WeekGrid } from './components/WeekGrid';
import type { useCalendarPage } from '@/app/calendar/use-calendar-page';

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
