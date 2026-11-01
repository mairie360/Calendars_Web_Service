'use client';

import { CalendarSidebar } from './components/CalendarSidebar';
import { Card, Toast } from "@mairie360/lib-components/primitives";
import { AppShell } from './components/AppShell';
import { prepareUpcomingScrollRegion } from './upcoming-scroll-region';
import { useCalendarTodayMarker } from './use-calendar-today-marker';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarLoadingCard } from './components/CalendarLoadingCard';
import { CalendarModals } from './components/CalendarModals';
import { CalendarStatusBar } from './components/CalendarStatusBar';
import { CalendarViews } from './components/CalendarViews';
import { useCalendarPage } from '../../app/calendar/use-calendar-page';

import type { InitialCalendarPage } from '../../lib/calendar-bootstrap-receipt';

/** The calendar page: header, status bar, the grid of the current view, the side panels and the dialogs. */
export default function CalendarClient({ initial }: { initial?: InitialCalendarPage }) {
  const calendar = useCalendarPage(initial);
  const gridRef = useCalendarTodayMarker(calendar.view, calendar.ready ? calendar.currentDate.getTime() : -1);

  if (!calendar.ready) {
    return (
      <AppShell activeItem="calendar">
        <CalendarHeader />
        <CalendarLoadingCard readError={calendar.readError} />
      </AppShell>
    );
  }

  return (
    <AppShell activeItem="calendar">
      {calendar.feedback && <Toast tone="success" message={calendar.feedback} onClose={calendar.dismissFeedback} className="mb-5" />}
      <CalendarHeader onCreate={() => calendar.openCreateModal()} />
      <div className="calendar-board mt-7 grid items-start gap-6" ref={prepareUpcomingScrollRegion}>
        <Card className="min-h-[620px] overflow-hidden rounded-lg">
          <div className="px-6 pb-8 pt-6">
            <CalendarStatusBar readError={calendar.readError} mutationError={calendar.mutationError} loading={calendar.loading} saving={calendar.saving} onRetry={() => void calendar.refreshData()} />
            <CalendarViews calendar={calendar} gridRef={gridRef} />
          </div>
        </Card>
        <CalendarSidebar className="calendar-sidebar" events={calendar.events} currentDate={calendar.selectedDate} stats={calendar.stats} showEmptyState={false} onEventClick={calendar.handleEventClick} />
      </div>
      <CalendarModals calendar={calendar} />
    </AppShell>
  );
}
