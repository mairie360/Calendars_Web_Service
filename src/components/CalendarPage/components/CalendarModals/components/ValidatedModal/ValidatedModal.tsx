import type { FormEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { CalendarRecurrence } from '@/app/calendar/types';
import { validateEventForm } from './validation';

function readFormValue(form: HTMLFormElement, id: string) {
  return form.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)?.value ?? '';
}

function textsFromForm(form: HTMLFormElement) {
  return {
    title: readFormValue(form, 'event-title'),
    description: readFormValue(form, 'event-description'),
    location: readFormValue(form, 'event-location'),
  };
}

function chronologyFromForm(form: HTMLFormElement) {
  const frequency = (readFormValue(form, 'event-recurrence') || 'none') as CalendarRecurrence['frequency'];
  return {
    date: readFormValue(form, 'event-date'),
    endDate: readFormValue(form, 'event-end-date'),
    startTime: readFormValue(form, 'event-start-time'),
    endTime: readFormValue(form, 'event-end-time'),
    recurrence: {
      frequency,
      endsOn: frequency === 'none' ? '' : readFormValue(form, 'event-recurrence-end'),
    },
  };
}

/** Fields whose error a change of the given input clears (a chronology error concerns both ends). */
const relatedFields: Record<string, string[]> = {
  'event-date': ['event-date', 'event-end-date', 'event-end-time', 'event-recurrence-end'],
  'event-end-date': ['event-end-date', 'event-end-time'],
  'event-start-time': ['event-end-time'],
  'event-end-time': ['event-end-time'],
  'event-recurrence': ['event-end-date', 'event-recurrence-end'],
};

/**
 * Validates the event form it wraps on submit (MAIR-926): the errors, keyed by input id, go to `children`
 * (render function) which hands them to the form, the first field in error takes the focus, and a change
 * clears its error.
 */
export function ValidatedModal({
  isOpen,
  resetKey,
  initialFrequency,
  children,
}: {
  isOpen: boolean;
  resetKey: string;
  initialFrequency?: CalendarRecurrence['frequency'];
  children: ReactNode | ((fieldErrors: Record<string, string>) => ReactNode);
}) {
  const [recurring, setRecurring] = useState(initialFrequency !== undefined && initialFrequency !== 'none');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setRecurring(initialFrequency !== undefined && initialFrequency !== 'none');
      setErrors({});
    }
  }, [initialFrequency, isOpen, resetKey]);

  if (!isOpen) return null;

  const handleSubmitCapture = (event: FormEvent<HTMLDivElement>) => {
    const form = event.target as HTMLFormElement;
    if (!form.querySelector<HTMLInputElement>('#event-date')) return;

    const found = validateEventForm({ ...textsFromForm(form), ...chronologyFromForm(form) });
    if (found.length === 0) {
      setErrors({});
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setErrors(Object.fromEntries(found.map(({ field, message }) => [field, message])));
    const first = form.querySelector<HTMLElement>(`#${found[0].field}`);
    if (typeof first?.focus === 'function') first.focus();
  };

  const handleChangeCapture = (event: FormEvent<HTMLDivElement>) => {
    const field = event.target as HTMLInputElement | HTMLSelectElement;
    if (field.id === 'event-recurrence') setRecurring(field.value !== 'none');
    const cleared = relatedFields[field.id] ?? [field.id];
    setErrors((current) => cleared.some((id) => id in current)
      ? Object.fromEntries(Object.entries(current).filter(([id]) => !cleared.includes(id)))
      : current);
  };

  return (
    <div
      className="calendar-validated-modal"
      data-recurring={recurring ? 'true' : 'false'}
      onSubmitCapture={handleSubmitCapture}
      onChangeCapture={handleChangeCapture}
    >
      {typeof children === 'function' ? children(errors) : children}
    </div>
  );
}
