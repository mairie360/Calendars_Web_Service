import { SelectField } from '@mairie360/lib-components/primitives';

import type { CalendarEventCategoryOption } from '@/components/CalendarPage/calendar-types';
import { categoryChoices } from '@/components/CalendarPage/components/CalendarModals/components/CreateEventModal/event-form-values';

/** Category of the event; an empty first category is the placeholder. */
export const EventCategoryField = ({ categories, value, onChange }: { categories: CalendarEventCategoryOption[]; value: string; onChange: (value: string) => void }) => {
  const { placeholder, options } = categoryChoices(categories);
  return <SelectField id="event-category" name="category" label="Catégorie" size="s" placeholder={placeholder} value={value} options={options.map((category) => ({ value: category.value, label: String(category.label) }))} onChange={onChange} />;
};
