import {
  CreateEventModal as LibraryCreateEventModal,
  EventDetailsModal as LibraryEventDetailsModal,
} from '@mairie360/lib-components';
import type { ComponentProps, FormEvent, ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { formatDateForQuery } from '../date-utils';
import type { CalendarRecurrence } from '../types';
import { validateEventChronology } from './validation';
import { manageCalendarModalFocus } from './modal-focus';

type CreateProps = ComponentProps<typeof LibraryCreateEventModal>;
type DetailsProps = ComponentProps<typeof LibraryEventDetailsModal>;
type SaveEvent = Parameters<NonNullable<DetailsProps['onSave']>>[0];
type SaveFeedback = { saving?: boolean; error?: string | null };
type ControlledDetailsProps = Omit<DetailsProps, 'onSave'> & SaveFeedback & {
  onSave?: (event: SaveEvent) => boolean | Promise<boolean>;
};

function ModalFeedback({ subtitle, saving, error }: SaveFeedback & { subtitle?: ReactNode }) {
  return (
    <>
      {subtitle}
      {saving || error ? (
        <span role={saving ? 'status' : 'alert'} className="mt-2 block font-semibold text-[#334155]">
          {saving ? 'Enregistrement en cours…' : error}
        </span>
      ) : null}
    </>
  );
}

function valuesFromSubmittedEvent(event: SaveEvent): CreateProps['initialValues'] {
  const dateText = (date: SaveEvent['date'] | undefined) =>
    date instanceof Date ? formatDateForQuery(date) : date ?? '';
  const nodeText = (value: ReactNode) => typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  return {
    title: nodeText(event.title),
    description: nodeText(event.description),
    date: dateText(event.date),
    endDate: dateText(event.endDate ?? event.date),
    category: event.category ?? '',
    service: event.service ?? '',
    startTime: event.startTime ?? '',
    endTime: event.endTime ?? '',
    location: event.location ?? '',
    assigneeIds: event.assigneeIds ?? event.assignees?.map(person => person.id) ?? [],
    recurrence: {
      ...event.recurrence,
      frequency: event.recurrence?.frequency ?? 'none',
      endsOn: dateText(event.recurrence?.endsOn),
    },
  };
}

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
  const modalRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isOpen && modalRef.current) return manageCalendarModalFocus(modalRef.current);
  }, [isOpen]);

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
      ref={modalRef}
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

function formCategories(categories: CreateProps['categories']) {
  // The shared form resets when its first category changes. Keep a stable UI
  // placeholder first, while exposing every real option received from the BFF.
  return [{ label: 'Sélectionner une catégorie', value: '' }, ...(categories ?? []).filter(category => category.value !== '')];
}

function CreateEventSession({ saving = false, error, ...props }: CreateProps & SaveFeedback) {
  // A draft belongs to this opening, not to subsequent reference-data reads.
  // Preserve the existing initial default when categories are already loaded.
  const [initialValues] = useState(() => ({
    ...props.initialValues,
    category: props.initialValues?.category ?? props.categories?.[0]?.value ?? '',
  }));
  const initialFrequency = initialValues.recurrence?.frequency;
  return (
    <ValidatedModal isOpen={props.isOpen} resetKey={String(initialValues.date ?? '')} initialFrequency={initialFrequency}>
      <fieldset disabled={saving} aria-busy={saving} className="m-0 min-w-0 border-0 p-0">
        <LibraryCreateEventModal
          {...props}
          categories={formCategories(props.categories)}
          initialValues={initialValues}
          subtitle={<ModalFeedback subtitle={props.subtitle} saving={saving} error={error} />}
          onCancel={() => { if (!saving) props.onCancel(); }}
          onCreate={(event) => {
            if (!saving) props.onCreate({
              ...event,
              endDate: event.recurrence.frequency === 'none' ? event.endDate : event.date,
            });
          }}
        />
      </fieldset>
    </ValidatedModal>
  );
}

export function CreateEventModal(props: CreateProps & SaveFeedback) {
  return props.isOpen ? <CreateEventSession {...props} /> : null;
}

function EventDetailsSession(props: ControlledDetailsProps & { event: SaveEvent }) {
  // The published details component exits edit mode synchronously on submit.
  // Own the submitted draft here until the existing BFF confirms the write.
  const [draft, setDraft] = useState<CreateProps['initialValues']>();
  const initialFrequency = draft?.recurrence?.frequency ?? props.event.recurrence?.frequency;
  const saveDraft = async (event: SaveEvent) => {
    if (props.saving || !props.onSave) return;
    if (!draft) setDraft(valuesFromSubmittedEvent(event));
    if (await props.onSave(event)) setDraft(undefined);
  };
  return (
    <ValidatedModal isOpen={props.isOpen} resetKey={String(props.event.id)} initialFrequency={initialFrequency}>
      <fieldset disabled={props.saving} aria-busy={Boolean(props.saving)} className="m-0 min-w-0 border-0 p-0">
        {draft ? (
          <LibraryCreateEventModal
            isOpen
            people={props.people}
            categories={formCategories(props.categories)}
            initialValues={draft}
            canCreateRecurringEvents={props.canCreateRecurringEvents}
            title="Modifier l’événement"
            subtitle={<ModalFeedback subtitle="Modifier les informations de l’événement sélectionné" saving={props.saving} error={props.error} />}
            cancelLabel={props.cancelLabel}
            submitLabel={props.saveLabel ?? 'Enregistrer'}
            onCancel={() => { if (!props.saving) setDraft(undefined); }}
            onCreate={values => void saveDraft({
              ...props.event,
              ...values,
              endDate: values.recurrence.frequency === 'none' ? values.endDate : values.date,
              assignees: props.people?.filter(person => values.assigneeIds.some(id => String(id) === String(person.id))),
            })}
          />
        ) : (
          <LibraryEventDetailsModal
            {...props}
            categories={formCategories(props.categories)}
            title={props.saving || props.error ? (
              <>
                {props.title ?? 'Détail de l’événement'}
                <span
                  role={props.saving ? 'status' : 'alert'}
                  className={`mt-2 block whitespace-normal break-words text-sm font-normal leading-5 ${props.saving ? 'text-[#e2e8f0]' : 'text-[#fecaca]'}`}
                >
                  {props.saving ? 'Enregistrement en cours…' : props.error}
                </span>
              </>
            ) : props.title}
            onClose={() => { if (!props.saving) props.onClose(); }}
            onSave={props.onSave ? (event) => void saveDraft({
              ...event,
              endDate: event.recurrence && event.recurrence.frequency !== 'none' ? event.date : event.endDate,
            }) : undefined}
          />
        )}
      </fieldset>
    </ValidatedModal>
  );
}

export function EventDetailsModal(props: ControlledDetailsProps) {
  return props.isOpen && props.event
    ? <EventDetailsSession key={String(props.event.id)} {...props} event={props.event} />
    : null;
}
