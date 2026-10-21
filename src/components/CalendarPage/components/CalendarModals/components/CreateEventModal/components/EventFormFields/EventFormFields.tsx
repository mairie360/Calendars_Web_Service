import { EventAssigneeSelect } from './components/EventAssigneeSelect';
import type { CalendarAssignee, CalendarEventCategoryOption, CreateCalendarEventValues } from '@/components/CalendarPage/calendar-types';
import { EventCategoryField } from './components/EventCategoryField';
import { EventDateRange } from './components/EventDateRange';
import { EventRecurrenceFields } from './components/EventRecurrenceFields';
import { EventLocationField } from './components/EventLocationField';
import { EventTitleFields } from './components/EventTitleFields';
import { EventTimeRange } from './components/EventTimeRange';

type Recurrence = CreateCalendarEventValues['recurrence'];
export interface EventFormFieldsProps {
  values: CreateCalendarEventValues;
  people: CalendarAssignee[];
  categories: CalendarEventCategoryOption[];
  canRecur: boolean;
  update: <Key extends keyof CreateCalendarEventValues>(key: Key, value: CreateCalendarEventValues[Key]) => void;
  updateRecurrence: <Key extends keyof Recurrence>(key: Key, value: Recurrence[Key]) => void;
}

/** Every field of the event form, in the Figma order (Calendars « Nouvel événement »). */
export const EventFormFields = ({ values, people, categories, canRecur, update, updateRecurrence }: EventFormFieldsProps) => (
  <div className="space-y-3">
    <EventTitleFields title={values.title} description={values.description} onTitle={(value) => update('title', value)} onDescription={(value) => update('description', value)} />
    <EventDateRange date={values.date} endDate={values.endDate} onDate={(value) => update('date', value)} onEndDate={(value) => update('endDate', value)} />
    <EventCategoryField categories={categories} value={values.category} onChange={(value) => update('category', value)} />
    {canRecur && <EventRecurrenceFields recurrence={values.recurrence} onChange={updateRecurrence} />}
    <EventTimeRange startTime={values.startTime} endTime={values.endTime} onStart={(value) => update('startTime', value)} onEnd={(value) => update('endTime', value)} />
    <EventLocationField value={values.location} onChange={(value) => update('location', value)} />
    <EventAssigneeSelect people={people} value={values.assigneeIds} onChange={(assigneeIds) => update('assigneeIds', assigneeIds)} />
  </div>
);
