import React from 'react';
import { X } from 'lucide-react';

import { CalendarDateField } from './CalendarDateField';
import { EventAssigneeSelect } from './EventAssigneeSelect';
import { defaultEventCategories, weekDayOptions } from './constants';
import { normalizeDateForServer } from './date';
import { joinClasses } from './style';
import type { CalendarRecurrenceFrequency, CreateCalendarEventValues, CreateEventModalProps } from './types';

export type {
  CalendarAssignee,
  CalendarAssigneeId,
  CalendarEventCategoryOption,
  CreateCalendarEventValues,
  CreateEventModalProps,
} from './types';

const getDefaultValues = (
  initialValues: Partial<CreateCalendarEventValues> | undefined,
  defaultCategory: string
): CreateCalendarEventValues => {
  const defaultRecurrence: CreateCalendarEventValues['recurrence'] = {
    frequency: 'none',
    interval: 1,
    daysOfWeek: [],
    endsOn: '',
  };

  return {
    title: '',
    description: '',
    service: '',
    category: defaultCategory,
    startTime: '',
    endTime: '',
    location: '',
    ...initialValues,
    date: normalizeDateForServer(initialValues?.date),
    endDate: normalizeDateForServer(initialValues?.endDate),
    assigneeIds: initialValues?.assigneeIds || [],
    recurrence: {
      ...defaultRecurrence,
      ...initialValues?.recurrence,
      endsOn: normalizeDateForServer(initialValues?.recurrence?.endsOn),
    },
  };
};

const fieldClassName =
  'h-9 w-full rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 text-sm text-[var(--mairie-text)] shadow-sm outline-none transition-colors placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-border)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20';

const labelClassName = 'mb-1 block text-sm font-semibold text-[var(--mairie-text)]';

const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');

  return {
    value: `${hours}:${minutes}`,
    label: `${hours} h ${minutes}`,
  };
});

export const CreateEventModal = ({
  isOpen,
  people = [],
  categories = defaultEventCategories,
  initialValues,
  canCreateRecurringEvents = true,
  title = 'Créer un événement',
  subtitle = 'Ajouter un nouvel événement au calendrier',
  cancelLabel = 'Annuler',
  submitLabel = 'Créer l’événement',
  onCancel,
  onCreate,
}: CreateEventModalProps) => {
  const defaultCategory = categories[0]?.value || '';
  const [values, setValues] = React.useState<CreateCalendarEventValues>(() =>
    getDefaultValues(initialValues, defaultCategory)
  );
  const titleId = React.useId();
  const subtitleId = React.useId();

  React.useEffect(() => {
    if (isOpen) {
      setValues(getDefaultValues(initialValues, defaultCategory));
    }
  }, [defaultCategory, initialValues, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const updateValue = <Key extends keyof CreateCalendarEventValues>(
    key: Key,
    value: CreateCalendarEventValues[Key]
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const date = normalizeDateForServer(values.date);
    const endDate = normalizeDateForServer(values.endDate || values.date);

    const recurrence =
      canCreateRecurringEvents && values.recurrence.frequency !== 'none'
        ? {
            ...values.recurrence,
            endsOn: normalizeDateForServer(values.recurrence.endsOn),
          }
        : { frequency: 'none' as const, interval: 1, daysOfWeek: [], endsOn: '' };

    onCreate({
      ...values,
      date,
      endDate,
      recurrence,
    });
  };

  const updateRecurrence = <Key extends keyof CreateCalendarEventValues['recurrence']>(
    key: Key,
    value: CreateCalendarEventValues['recurrence'][Key]
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      recurrence: {
        ...currentValues.recurrence,
        [key]: value,
      },
    }));
  };

  const toggleRecurrenceDay = (day: number) => {
    const selectedDays = values.recurrence.daysOfWeek || [];
    updateRecurrence(
      'daysOfWeek',
      selectedDays.includes(day)
        ? selectedDays.filter((selectedDay) => selectedDay !== day)
        : [...selectedDays, day].sort((firstDay, secondDay) => firstDay - secondDay)
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mairie-overlay-background)]/20 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
    >
      <form
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-[510px] flex-col overflow-hidden rounded-md bg-[var(--mairie-background)] text-[var(--mairie-text)] shadow-xl"
        onSubmit={handleSubmit}
      >
        <div className="flex min-h-14 items-center justify-between gap-4 bg-[var(--mairie-navigation-background)] px-5 py-3 text-[var(--mairie-on-action)]">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-base font-semibold leading-6">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--mairie-navigation-text)] transition-colors hover:bg-[var(--mairie-on-action)]/10 hover:text-[var(--mairie-on-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-navigation-text)]/35"
            onClick={onCancel}
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {subtitle && (
            <p id={subtitleId} className="text-sm leading-5 text-[var(--mairie-muted)]">
              {subtitle}
            </p>
          )}

          <div>
            <label htmlFor="event-title" className={labelClassName}>
              Titre
            </label>
            <input
              id="event-title"
              name="title"
              type="text"
              required
              value={values.title}
              placeholder="Titre de l’événement"
              className={fieldClassName}
              onChange={(event) => updateValue('title', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="event-description" className={labelClassName}>
              Description
            </label>
            <textarea
              id="event-description"
              name="description"
              value={values.description}
              placeholder="Description de l’événement"
              className={joinClasses(fieldClassName, 'h-20 resize-none py-2')}
              onChange={(event) => updateValue('description', event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <CalendarDateField
              id="event-date"
              label="Date de début"
              required
              value={values.date}
              inputClassName={fieldClassName}
              labelClassName={labelClassName}
              onChange={(value) => updateValue('date', value)}
            />

            <CalendarDateField
              id="event-end-date"
              label="Date de fin"
              value={values.endDate}
              inputClassName={fieldClassName}
              labelClassName={labelClassName}
              onChange={(value) => updateValue('endDate', value)}
            />
          </div>

          <div>
            <label htmlFor="event-category" className={labelClassName}>
              Catégorie
            </label>
            <select
              id="event-category"
              name="category"
              value={values.category}
              className={fieldClassName}
              onChange={(event) => updateValue('category', event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {canCreateRecurringEvents && (
            <div className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] p-3">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="event-recurrence" className={labelClassName}>
                    Récurrence
                  </label>
                  <select
                    id="event-recurrence"
                    value={values.recurrence.frequency}
                    className={fieldClassName}
                    onChange={(event) => updateRecurrence('frequency', event.target.value as CalendarRecurrenceFrequency)}
                  >
                    <option value="none">Ne se répète pas</option>
                    <option value="daily">Tous les jours</option>
                    <option value="weekly">Chaque semaine</option>
                    <option value="monthly">Chaque mois</option>
                  </select>
                </div>
                {values.recurrence.frequency !== 'none' && (
                  <div>
                    <label htmlFor="event-recurrence-interval" className={labelClassName}>
                      Intervalle
                    </label>
                    <input
                      id="event-recurrence-interval"
                      type="number"
                      min={1}
                      value={values.recurrence.interval || 1}
                      className={fieldClassName}
                      onChange={(event) => updateRecurrence('interval', Number(event.target.value) || 1)}
                    />
                  </div>
                )}
              </div>

              {values.recurrence.frequency === 'weekly' && (
                <div className="mt-3">
                  <div className={labelClassName}>Jours</div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {weekDayOptions.map((day) => {
                      const selected = values.recurrence.daysOfWeek?.includes(day.value);

                      return (
                        <button
                          key={day.value}
                          type="button"
                          className={joinClasses(
                            'h-8 rounded-md border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25',
                            selected
                              ? 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]'
                              : 'border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] text-[var(--mairie-text)] hover:bg-[var(--mairie-surface)]'
                          )}
                          onClick={() => toggleRecurrenceDay(day.value)}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {values.recurrence.frequency !== 'none' && (
                <div className="mt-3">
                  <CalendarDateField
                    id="event-recurrence-end"
                    label="Fin de récurrence"
                    value={String(values.recurrence.endsOn || '')}
                    inputClassName={fieldClassName}
                    labelClassName={labelClassName}
                    onChange={(value) => updateRecurrence('endsOn', value)}
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="event-start-time" className={labelClassName}>
                Heure de début
              </label>
              <select
                id="event-start-time"
                name="startTime"
                value={values.startTime}
                className={fieldClassName}
                onChange={(event) => updateValue('startTime', event.target.value)}
              >
                <option value="">Sélectionner une heure</option>
                {timeOptions.map((timeOption) => (
                  <option key={timeOption.value} value={timeOption.value}>
                    {timeOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="event-end-time" className={labelClassName}>
                Heure de fin
              </label>
              <select
                id="event-end-time"
                name="endTime"
                value={values.endTime}
                className={fieldClassName}
                onChange={(event) => updateValue('endTime', event.target.value)}
              >
                <option value="">Sélectionner une heure</option>
                {timeOptions.map((timeOption) => (
                  <option key={timeOption.value} value={timeOption.value}>
                    {timeOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="event-location" className={labelClassName}>
              Lieu
            </label>
            <input
              id="event-location"
              name="location"
              type="text"
              value={values.location}
              placeholder="Lieu de l’événement"
              className={fieldClassName}
              onChange={(event) => updateValue('location', event.target.value)}
            />
          </div>

          <EventAssigneeSelect
            people={people}
            value={values.assigneeIds}
            onChange={(assigneeIds) => updateValue('assigneeIds', assigneeIds)}
          />
        </div>

        <div className="shrink-0 flex justify-end gap-3 bg-[var(--mairie-background)] px-6 py-3">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-4 text-sm font-semibold text-[var(--mairie-text)] shadow-sm transition-colors hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--mairie-success-action-background)] px-4 text-sm font-semibold text-[var(--mairie-on-action)] shadow-sm transition-colors hover:bg-[var(--mairie-success-action-hover-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};
