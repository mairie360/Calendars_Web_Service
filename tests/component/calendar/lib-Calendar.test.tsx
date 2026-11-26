import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CalendarSidebar } from '@/components/CalendarPage/components/CalendarSidebar';
import { CalendarToolbar } from '@/components/CalendarPage/components/CalendarViews/components/CalendarToolbar';
import { DaySchedule } from '@/components/CalendarPage/components/CalendarViews/components/DaySchedule';
import { MonthGrid } from '@/components/CalendarPage/components/CalendarViews/components/MonthGrid';
import { EventPill } from '@/components/CalendarPage/components/CalendarViews/components/EventPill';

describe('Calendar components', () => {
  it('triggers toolbar navigation and view changes', () => {
    const handlePrevious = vi.fn();
    const handleNext = vi.fn();
    const handleViewChange = vi.fn();
    const handleToday = vi.fn();

    render(
      <CalendarToolbar
        title="Juin 2026"
        view="month"
        onPrevious={handlePrevious}
        onNext={handleNext}
        onViewChange={handleViewChange}
        onToday={handleToday}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Période précédente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Période suivante' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aujourd’hui' }));
    // MAIR-893: the view choice is the lib SegmentedControl (a radio group).
    expect(screen.getByRole('radiogroup', { name: 'Changer de vue' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Mois' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('radio', { name: 'Jour' }));

    expect(handleToday).toHaveBeenCalledTimes(1);
    expect(handlePrevious).toHaveBeenCalledTimes(1);
    expect(handleNext).toHaveBeenCalledTimes(1);
    expect(handleViewChange).toHaveBeenCalledWith('day');
  });

  it('renders month days and calls date selection', () => {
    const handleSelectDate = vi.fn();

    render(
      <MonthGrid onShowDay={vi.fn()}
        currentDate="2026-06-15"
        selectedDate="2026-06-15"
        onSelectDate={handleSelectDate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sélectionner le 16 Juin 2026' }));

    expect(screen.getByText('30')).toBeInTheDocument();
    expect(handleSelectDate).toHaveBeenCalledWith(new Date(2026, 5, 16));
  });

  it('calls event click without selecting the day cell', () => {
    const handleSelectDate = vi.fn();
    const handleEventClick = vi.fn();

    render(
      <MonthGrid onShowDay={vi.fn()}
        currentDate="2026-06-15"
        selectedDate="2026-06-15"
        events={[
          {
            id: 'event-1',
            title: 'Conseil municipal',
            date: '2026-06-15',
          },
        ]}
        onSelectDate={handleSelectDate}
        onEventClick={handleEventClick}
      />
    );

    fireEvent.click(screen.getByText('Conseil municipal'));

    expect(handleEventClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'event-1',
        title: 'Conseil municipal',
      })
    );
    expect(handleSelectDate).not.toHaveBeenCalled();
  });

  it('exposes a compact event’s full title and preserves keyboard activation', () => {
    const onClick = vi.fn();
    const event = {
      id: 'event-long-title',
      title: 'Réunion de coordination des services de la mairie',
      date: '2026-06-15',
    };

    render(<EventPill event={event} onClick={onClick} />);

    const pill = screen.getByRole('button', { name: event.title });
    expect(pill).toHaveAttribute('title', event.title);
    expect(screen.getByText(event.title)).toHaveClass('truncate');

    fireEvent.keyDown(pill, { key: 'Enter' });
    fireEvent.keyDown(pill, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledWith(event);
  });

  it('does not invent a native title for React-node event titles', () => {
    const { container } = render(
      <EventPill
        event={{ id: 'event-node-title', title: <span>Conseil municipal</span>, date: '2026-06-15' }}
      />
    );

    expect(screen.getByText('Conseil municipal')).toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveAttribute('title');
  });

  it('renders multi-day and recurring events on matching days', () => {
    render(
      <MonthGrid onShowDay={vi.fn()}
        currentDate="2026-06-15"
        selectedDate="2026-06-15"
        events={[
          {
            id: 'multi-day',
            title: 'Festival',
            date: '2026-06-15',
            endDate: '2026-06-16',
          },
          {
            id: 'weekly',
            title: 'Permanence',
            date: '2026-06-15',
            recurrence: {
              frequency: 'weekly',
              interval: 1,
              daysOfWeek: [1, 3],
              endsOn: '2026-06-30',
            },
          },
        ]}
      />
    );

    const festivalEvents = screen.getAllByText('Festival');
    expect(festivalEvents).toHaveLength(2);
    expect(festivalEvents[0].parentElement).toHaveStyle({ gridColumn: '1' });
    expect(festivalEvents[1].parentElement).toHaveStyle({ gridColumn: '2' });
    expect(screen.getAllByText('Permanence')).toHaveLength(5);
  });

  it('renders day schedule events', () => {
    render(
      <DaySchedule
        currentDate="2026-06-15"
        events={[
          {
            id: 'event-1',
            title: 'Conseil municipal',
            date: '2026-06-15',
            startTime: '09:00',
          },
        ]}
      />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Juin 2026')).toBeInTheDocument();
    expect(screen.getByText('Conseil municipal')).toBeInTheDocument();
  });

  it('renders event duration visually in day schedule', () => {
    render(
      <DaySchedule
        currentDate="2026-06-15"
        events={[
          {
            id: 'event-1',
            title: 'Atelier',
            date: '2026-06-15',
            startTime: '09:00',
            endTime: '10:30',
          },
        ]}
      />
    );

    expect(screen.getByText('Atelier').parentElement).toHaveStyle({ height: '92px' });
  });

  it('renders the visible part of multi-day events in day schedule', () => {
    render(
      <DaySchedule
        currentDate="2026-06-16"
        events={[
          {
            id: 'event-1',
            title: 'Formation',
            date: '2026-06-15',
            endDate: '2026-06-16',
            startTime: '09:00',
            endTime: '10:30',
          },
          {
            id: 'event-2',
            title: 'Nocturne',
            date: '2026-06-15',
            endDate: '2026-06-16',
            startTime: '20:00',
            endTime: '05:00',
          },
        ]}
      />
    );

    expect(screen.getByText('Formation').parentElement).toHaveStyle({ top: '0px', height: '284px' });
    expect(screen.queryByText('Nocturne')).not.toBeInTheDocument();
  });

  it('only compresses events when their times overlap', () => {
    render(
      <DaySchedule
        currentDate="2026-06-15"
        events={[
          {
            id: 'event-1',
            title: 'Début',
            date: '2026-06-15',
            startTime: '09:00',
            endTime: '10:00',
          },
          {
            id: 'event-2',
            title: 'Chevauchement',
            date: '2026-06-15',
            startTime: '09:30',
            endTime: '10:30',
          },
          {
            id: 'event-3',
            title: 'Libre',
            date: '2026-06-15',
            startTime: '12:00',
            endTime: '13:00',
          },
        ]}
      />
    );

    expect(screen.getByText('Début').parentElement).toHaveAttribute(
      'style',
      expect.stringContaining('width: calc(50% - 4px);')
    );
    expect(screen.getByText('Libre').parentElement).toHaveAttribute(
      'style',
      expect.stringContaining('width: calc(100% - 4px);')
    );
  });

  it('renders all events in a month cell', () => {
    render(
      <MonthGrid onShowDay={vi.fn()}
        currentDate="2026-06-15"
        selectedDate="2026-06-15"
        events={[
          {
            id: 'event-1',
            title: 'Matin',
            date: '2026-06-15',
            startTime: '08:00',
          },
          {
            id: 'event-2',
            title: 'Midi',
            date: '2026-06-15',
            startTime: '12:00',
          },
          {
            id: 'event-3',
            title: 'Soir',
            date: '2026-06-15',
            startTime: '17:00',
          },
        ]}
      />
    );

    expect(screen.getByText('Matin')).toBeInTheDocument();
    expect(screen.getByText('Midi')).toBeInTheDocument();
    expect(screen.getByText('Soir')).toBeInTheDocument();
  });

  it('MAIR-1222 month cells keep a fixed height and show « + N » past three events', () => {
    const onEventClick = vi.fn();
    const onShowDay = vi.fn();
    const events = ['Matin', 'Midi', 'Après-midi', 'Soir'].map((title, index) => ({
      id: `event-${index}`,
      title,
      date: '2026-06-15',
      startTime: `${String(8 + index * 3).padStart(2, '0')}:00`,
    }));

    const { container } = render(
      <MonthGrid
        className="month-spacing-test"
        currentDate="2026-06-15"
        events={events}
        onEventClick={onEventClick}
        onShowDay={onShowDay}
      />
    );

    const weeks = Array.from(container.querySelectorAll<HTMLElement>('.month-spacing-test > div:nth-child(2) > div'));
    expect(weeks).toHaveLength(5);
    // The mockup's cell height, whatever the number of events.
    expect(weeks.every((week) => week.style.height === '104px')).toBe(true);
    expect(screen.getByText('Matin').parentElement).toHaveStyle({ gridRow: '1' });
    expect(screen.getByText('Midi').parentElement).toHaveStyle({ gridRow: '2' });
    expect(screen.queryByText('Après-midi')).not.toBeInTheDocument();
    expect(screen.queryByText('Soir')).not.toBeInTheDocument();
    const more = screen.getByRole('button', { name: /^Plus d’événements le .* : 2 autres, ouvrir la vue Jour$/ });
    expect(more).toHaveTextContent('+ 2');
    expect(more).toHaveStyle({ gridRow: '3' });

    fireEvent.click(more);
    expect(onShowDay).toHaveBeenCalledWith(new Date(2026, 5, 15));
    fireEvent.click(screen.getByText('Midi').parentElement!);
    expect(onEventClick).toHaveBeenCalledWith(events[1]);
  });

  it('MAIR-918: renders « À venir » first, then the statistics of the displayed month', () => {
    const { container } = render(
      <CalendarSidebar upcoming={[]} stats={{ month: 'juin', total: 12, items: [{ category: 'meeting', label: 'Réunions', value: 12 }] }} />
    );

    expect(screen.getByRole('heading', { name: 'À venir' })).toBeInTheDocument();
    expect(screen.getByText('Aucun événement à venir.')).toBeInTheDocument();
    expect(screen.getByText('12 événements en juin')).toBeInTheDocument();

    const panels = container.querySelectorAll('aside > section');
    expect(panels).toHaveLength(2);
    expect(panels[0]).toHaveClass('calendar-upcoming-panel');
    expect(panels[0]).toHaveTextContent('Les 3 prochains événements');
    expect(panels[1]).toHaveTextContent('Statistiques');
  });
});
