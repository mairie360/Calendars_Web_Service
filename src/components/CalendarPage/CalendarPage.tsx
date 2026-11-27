'use client';

import { CalendarSidebar } from './components/CalendarSidebar';
import { calendarToday } from '@/app/calendar/date-utils';
import { Button, Card, ErrorAlert, RetryButton, ToastProvider } from "@mairie360/lib-components/primitives";
import { AccessibleShell, createBffSearchSource } from "@mairie360/lib-components/shell";
import { navigateToLogin } from '@/lib/logout';
import { getActiveFrontHrefs } from '@/app/navigation';
import { prepareUpcomingScrollRegion } from './upcoming-scroll-region';
import { useCalendarTodayMarker } from './use-calendar-today-marker';
import { useCalendarToasts } from './use-calendar-toasts';
import { useShellSession } from './use-shell-session';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarLoadingStatus } from './components/CalendarLoadingStatus';
import { CalendarModals } from './components/CalendarModals';
import { CalendarViews } from './components/CalendarViews';
import { useCalendarPage } from '../../app/calendar/use-calendar-page';

import type { InitialCalendarPage } from '../../lib/calendar-bootstrap-receipt';

/**
 * Global search of the shared header: the same-origin `GET /search`, which the contract proxy forwards to
 * BFF_Calendar. Created once so the header does not restart its debounced search on every render. A result
 * opens its module through the shell `hrefs`; an event comes back here as `?date=<day>&event=<id>`.
 */
const globalSearchSource = createBffSearchSource();

/** Id of the period heading, which names the calendar card. */
const PERIOD_TITLE_ID = 'calendar-period-title';

/** The calendar page: header, status bar, the grid of the current view, the side panels and the dialogs. */
export default function CalendarClient({ initial, commune }: { initial?: InitialCalendarPage; commune?: string }) {
  return (
    <ToastProvider regionLabel="Notifications du calendrier" placement="bottom-end">
      <CalendarScreen initial={initial} commune={commune} />
    </ToastProvider>
  );
}

function CalendarScreen({ initial, commune }: { initial?: InitialCalendarPage; commune?: string }) {
  const calendar = useCalendarPage(initial);
  useCalendarToasts(calendar);
  // MAIR-911: one state for the three panels — skeletons during the first read and an explicit refresh,
  // the unavailable states after a failed read; write errors stay in the dialogs and the toasts.
  // Before the browser takes over, a refused server read is shown at once (no endless skeleton).
  const state = !calendar.ready
    ? (calendar.readError ? 'unavailable' : 'loading')
    : calendar.panelsLoading ? 'loading' : calendar.readError ? 'unavailable' : 'default';
  // The grid only exists in the default state: the today marker attaches again when it comes back.
  const gridRef = useCalendarTodayMarker(calendar.view, state === 'default' && !calendar.noMatchingEvents ? calendar.currentDate.getTime() : -1);

  const shell = useShellSession(calendar.currentUser);
  const frontHrefs = getActiveFrontHrefs();

  return (
    <AccessibleShell
      activeItem="calendar"
      user={shell.user}
      onLogout={() => void shell.logout()}
      hrefs={{ ...frontHrefs, calendar: frontHrefs.calendar ?? "/" }}
      commune={commune}
      searchSource={globalSearchSource}
      // The calendar's own search: the events are dimmed on every keystroke while the header lists the global
      // results, and « Rechercher « q » dans Calendrier » keeps that filter.
      headerProps={{ searchScopeLabel: "Calendrier", searchValue: calendar.searchQuery, onSearchChange: calendar.setSearchQuery, onSearch: calendar.setSearchQuery }}
    >
      {/* The module area of the shared shell has no padding: the page gives the mockup's 32 px (16 px on a phone). */}
      <div className="calendar-page p-4 sm:p-8">
      {shell.logoutError && <div className="mb-4">
        <ErrorAlert title={shell.logoutError} onDismiss={shell.dismissLogoutError} />
        <div className="mt-3 flex flex-wrap gap-3">
          <RetryButton variant="outline" tone="neutral" onClick={() => void shell.logout()} />
          <Button variant="outline" tone="neutral" label="Retour à la connexion" onClick={() => navigateToLogin({ explicit: true })} />
        </div>
      </div>}
      <CalendarHeader onCreate={calendar.ready ? () => calendar.openCreateModal() : undefined}
        onRefresh={calendar.ready ? () => void calendar.refreshData() : undefined} loading={calendar.loading} />
      {/* RGAA 7.5: mounted with the page, only its text follows the panels' loading state. */}
      <CalendarLoadingStatus state={state} />
      <div className="calendar-board mt-6 grid items-start gap-6" ref={prepareUpcomingScrollRegion}>
        {/* The card is named by the period heading of its one-line toolbar (« Calendrier » before the browser initialisation). */}
        <Card className="calendar-panel min-h-[620px] overflow-hidden px-5 pb-5 pt-4" style={{ borderRadius: 'var(--mairie-radius-xl)' }}
          aria-labelledby={calendar.ready ? PERIOD_TITLE_ID : undefined} aria-label={calendar.ready ? undefined : 'Calendrier'}
          aria-busy={state === 'loading' || undefined}>
          <CalendarViews calendar={calendar} gridRef={gridRef} state={state} titleId={PERIOD_TITLE_ID} />
        </Card>
        <CalendarSidebar className="calendar-sidebar" state={state} onRetry={() => void calendar.refreshData()} upcoming={calendar.upcoming} upcomingFiltered={calendar.activeFilterCount > 0} categories={calendar.categories} today={calendarToday()} stats={calendar.stats} onEventClick={calendar.handleEventClick} />
      </div>
      </div>
      <CalendarModals calendar={calendar} />
    </AccessibleShell>
  );
}
