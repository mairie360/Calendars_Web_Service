import { normalizeDateForServer } from '../date';
import type { CalendarAssignee, CalendarAssigneeId, CalendarEvent, CalendarEventCategoryOption, CreateCalendarEventValues } from '../types';

export const noRecurrence: CreateCalendarEventValues['recurrence'] = { frequency: 'none', interval: 1, daysOfWeek: [], endsOn: '' };

/** The form draft of a new event (normalised dates, empty recurrence). */
export function defaultEventValues(initialValues: Partial<CreateCalendarEventValues> | undefined, defaultCategory: string): CreateCalendarEventValues {
  return {
    title: '', description: '', service: '', category: defaultCategory, startTime: '', endTime: '', location: '',
    ...initialValues,
    date: normalizeDateForServer(initialValues?.date),
    endDate: normalizeDateForServer(initialValues?.endDate),
    assigneeIds: initialValues?.assigneeIds || [],
    recurrence: { ...noRecurrence, ...initialValues?.recurrence, endsOn: normalizeDateForServer(initialValues?.recurrence?.endsOn) },
  };
}

/** The submitted values: normalised dates, the end date defaults to the start, no recurrence when it is off or not allowed. */
export function submittedEventValues(values: CreateCalendarEventValues, canRecur: boolean): CreateCalendarEventValues {
  const date = normalizeDateForServer(values.date);
  const endDate = normalizeDateForServer(values.endDate || values.date);
  const recurrence = canRecur && values.recurrence.frequency !== 'none'
    ? { ...values.recurrence, endsOn: normalizeDateForServer(values.recurrence.endsOn) }
    : noRecurrence;
  return { ...values, date, endDate, recurrence };
}

/** Quarter-hour choices of the time selects (« 08 h 15 »). */
export const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return { value: `${hours}:${minutes}`, label: `${hours} h ${minutes}` };
});

/** Days picked for a weekly recurrence, kept sorted. */
export const toggleDay = (selected: number[] = [], day: number) =>
  selected.includes(day) ? selected.filter((value) => value !== day) : [...selected, day].sort((first, second) => first - second);

/** A placeholder category (empty value) becomes the select placeholder; the rest are the real choices. */
export function categoryChoices(categories: CalendarEventCategoryOption[]) {
  const [first, ...rest] = categories;
  return first && first.value === '' ? { placeholder: String(first.label), options: rest } : { placeholder: null, options: categories };
}

const stringifyNode = (node: unknown) => (typeof node === 'string' || typeof node === 'number' ? String(node) : '');
export const idsMatch = (first: CalendarAssigneeId, second: CalendarAssigneeId) => String(first) === String(second);
export const eventAssigneeIds = (event: CalendarEvent) => event.assigneeIds || event.assignees?.map((assignee) => assignee.id) || [];

/** The form draft of an existing event. */
export const eventValues = (event: CalendarEvent): CreateCalendarEventValues => ({
  title: stringifyNode(event.title),
  description: stringifyNode(event.description),
  date: normalizeDateForServer(event.date),
  endDate: event.endDate ? normalizeDateForServer(event.endDate) : normalizeDateForServer(event.date),
  category: event.category || '',
  service: event.service || '',
  startTime: event.startTime || '',
  endTime: event.endTime || '',
  location: event.location || '',
  assigneeIds: eventAssigneeIds(event),
  recurrence: {
    frequency: event.recurrence?.frequency || 'none',
    interval: event.recurrence?.interval || 1,
    daysOfWeek: event.recurrence?.daysOfWeek || [],
    endsOn: normalizeDateForServer(event.recurrence?.endsOn),
  },
});

export const selectedAssignees = (people: CalendarAssignee[], value: CalendarAssigneeId[]) =>
  value.map((id) => people.find((person) => idsMatch(person.id, id))).filter((person): person is CalendarAssignee => Boolean(person));
