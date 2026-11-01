import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { formatDateForQuery } from '@/app/calendar/date-utils';
import { CreateEventModal } from '../CreateEventModal';
import { EventDetailsModal } from '../EventDetailsModal';
import { ModalFeedback, type SaveFeedback } from '../ModalFeedback';
import { ValidatedModal } from '../ValidatedModal';
import { formCategories } from '../../form-categories';
import { EventTrainingLink, type EventTrainingSource } from './components/EventTrainingLink';

type CreateProps = ComponentProps<typeof CreateEventModal>;
type DetailsProps = ComponentProps<typeof EventDetailsModal>;
type SaveEvent = Parameters<NonNullable<DetailsProps['onSave']>>[0];
type ControlledDetailsProps = Omit<DetailsProps, 'onSave'> & SaveFeedback & {
  trainingSource?: EventTrainingSource;
  onSave?: (event: SaveEvent) => boolean | Promise<boolean>;
};

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

function EventDetailsSession({ trainingSource, ...props }: ControlledDetailsProps & { event: SaveEvent }) {
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
          <CreateEventModal
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
          <EventDetailsModal
            {...props}
            extraContent={<EventTrainingLink key={String(props.event.id)} eventId={String(props.event.id)} source={trainingSource} />}
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

/** The detail dialog with the page's validation, save feedback and the linked training; one session per event. */
export function ValidatedEventDetailsModal(props: ControlledDetailsProps) {
  return props.isOpen && props.event
    ? <EventDetailsSession key={String(props.event.id)} {...props} event={props.event} />
    : null;
}
