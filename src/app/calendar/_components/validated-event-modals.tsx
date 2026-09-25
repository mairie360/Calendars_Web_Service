import {
  CreateEventModal as LibraryCreateEventModal,
  EventDetailsModal as LibraryEventDetailsModal,
} from '@mairie360/lib-components';
import type { ComponentProps, FormEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { CalendarRecurrence } from '../types';
import { validateEventChronology } from './validation';

type CreateProps = ComponentProps<typeof LibraryCreateEventModal>;
type DetailsProps = ComponentProps<typeof LibraryEventDetailsModal>;

function readFormValue(form: HTMLFormElement, id: string) {
  return form.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)?.value ?? '';
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

function ValidatedModal({
  isOpen,
  resetKey,
  initialFrequency,
  children,
}: {
  isOpen: boolean;
  resetKey: string;
  initialFrequency?: CalendarRecurrence['frequency'];
  children: ReactNode;
}) {
  const [recurring, setRecurring] = useState(initialFrequency !== undefined && initialFrequency !== 'none');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRecurring(initialFrequency !== undefined && initialFrequency !== 'none');
      setValidationError('');
    }
  }, [initialFrequency, isOpen, resetKey]);

  if (!isOpen) return null;

  const handleSubmitCapture = (event: FormEvent<HTMLDivElement>) => {
    const form = event.target as HTMLFormElement;
    if (!form.querySelector<HTMLInputElement>('#event-date')) return;

    const error = validateEventChronology(chronologyFromForm(form));
    if (!error) {
      setValidationError('');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setValidationError(error);
  };

  const handleChangeCapture = (event: FormEvent<HTMLDivElement>) => {
    const field = event.target as HTMLInputElement | HTMLSelectElement;
    if (field.id === 'event-recurrence') setRecurring(field.value !== 'none');
    setValidationError('');
  };

  return (
    <div
      className="calendar-validated-modal"
      data-recurring={recurring ? 'true' : 'false'}
      onSubmitCapture={handleSubmitCapture}
      onChangeCapture={handleChangeCapture}
    >
      {children}
      {validationError && (
        <p
          role="alert"
          className="fixed inset-x-4 top-20 z-[60] mx-auto max-w-[470px] rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 shadow-lg"
        >
          {validationError}
        </p>
      )}
    </div>
  );
}

export function CreateEventModal(props: CreateProps) {
  const initialFrequency = props.initialValues?.recurrence?.frequency;
  return (
    <ValidatedModal isOpen={props.isOpen} resetKey={String(props.initialValues?.date ?? '')} initialFrequency={initialFrequency}>
      <LibraryCreateEventModal
        {...props}
        onCreate={(event) => props.onCreate({
          ...event,
          endDate: event.recurrence.frequency === 'none' ? event.endDate : event.date,
        })}
      />
    </ValidatedModal>
  );
}

export function EventDetailsModal(props: DetailsProps) {
  const initialFrequency = props.event?.recurrence?.frequency;
  return (
    <ValidatedModal isOpen={props.isOpen && Boolean(props.event)} resetKey={String(props.event?.id ?? '')} initialFrequency={initialFrequency}>
      <LibraryEventDetailsModal
        {...props}
        onSave={props.onSave ? (event) => props.onSave?.({
          ...event,
          endDate: event.recurrence && event.recurrence.frequency !== 'none' ? event.date : event.endDate,
        }) : undefined}
      />
    </ValidatedModal>
  );
}
