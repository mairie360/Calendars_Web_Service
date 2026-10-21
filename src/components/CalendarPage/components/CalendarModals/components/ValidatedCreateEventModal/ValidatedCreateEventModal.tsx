import type { ComponentProps } from 'react';
import { useState } from 'react';
import { CreateEventModal } from '../CreateEventModal';
import { ModalFeedback, type SaveFeedback } from '../ModalFeedback';
import { ValidatedModal } from '../ValidatedModal';
import { formCategories } from '../../form-categories';

type CreateProps = ComponentProps<typeof CreateEventModal>;

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
        <CreateEventModal
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

/** The creation dialog with the page's validation and save feedback; one session per opening. */
export function ValidatedCreateEventModal(props: CreateProps & SaveFeedback) {
  return props.isOpen ? <CreateEventSession {...props} /> : null;
}
