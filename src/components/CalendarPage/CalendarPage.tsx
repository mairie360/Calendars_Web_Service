'use client';

import { CalendarSidebar } from './components/CalendarSidebar';
import { calendarToday } from '@/app/calendar/date-utils';
import { Panel, ToastProvider } from "@mairie360/lib-components/primitives";
import { AppShell } from './components/AppShell';
import { prepareUpcomingScrollRegion } from './upcoming-scroll-region';
import { useCalendarTodayMarker } from './use-calendar-today-marker';
import { useCalendarToasts } from './use-calendar-toasts';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarLoadingStatus } from './components/CalendarLoadingStatus';
import { CalendarModals } from './components/CalendarModals';
import { CalendarViews } from './components/CalendarViews';
import { useCalendarPage } from '../../app/calendar/use-calendar-page';

import type { InitialCalendarPage } from '../../lib/calendar-bootstrap-receipt';

/** The calendar page: header, status bar, the grid of the current view, the side panels and the dialogs. */
export default function CalendarClient({ initial }: { initial?: InitialCalendarPage }) {
  return (
    <ToastProvider regionLabel="Notifications du calendrier" placement="bottom-end">
      <CalendarScreen initial={initial} />
    </ToastProvider>
  );
}

function CalendarScreen({ initial }: { initial?: InitialCalendarPage }) {
  const calendar = useCalendarPage(initial);
  useCalendarToasts(calendar);
  // MAIR-911: one state for the three panels — skeletons during the first read and an explicit refresh,
  // the unavailable states after a failed read; write errors stay in the dialogs and the toasts.
  // Before the browser takes over, a refused server read is shown at once (no endless skeleton).
  const state = !calendar.ready
    ? (calendar.readError ? 'unavailable' : 'loading')
    : calendar.panelsLoading ? 'loading' : calendar.readError ? 'unavailable' : 'default';
  // The grid only exists in the default state: the today marker attaches again when it comes back.
  const gridRef = useCalendarTodayMarker(calendar.view, state === 'default' ? calendar.currentDate.getTime() : -1);

  return (
    <AppShell activeItem="calendar" search={{ value: calendar.searchQuery, onChange: calendar.setSearchQuery }}>
      <CalendarHeader onCreate={calendar.ready ? () => calendar.openCreateModal() : undefined}
        onRefresh={calendar.ready ? () => void calendar.refreshData() : undefined} loading={calendar.loading} />
      {/* RGAA 7.5: mounted with the page, only its text follows the panels' loading state. */}
      <CalendarLoadingStatus state={state} />
      <div className="calendar-board mt-7 grid items-start gap-6" ref={prepareUpcomingScrollRegion}>
        {/* MAIR-893: the panel title is the displayed period (not before the browser initialisation). */}
        <Panel title={calendar.ready ? calendar.periodTitle : 'Calendrier'} className="calendar-panel min-h-[620px] overflow-hidden" aria-busy={state === 'loading' || undefined}>
          <CalendarViews calendar={calendar} gridRef={gridRef} state={state} />
        </Panel>
        <CalendarSidebar className="calendar-sidebar" state={state} onRetry={() => void calendar.refreshData()} upcoming={calendar.upcoming} categories={calendar.categories} today={calendarToday()} stats={calendar.stats} onEventClick={calendar.handleEventClick} />
      </div>
      <CalendarModals calendar={calendar} />
    </AppShell>
  );
}
