import type { ComponentProps } from 'react';
import type { CreateEventModal } from './components/CreateEventModal';

/** The shared form resets when its first category changes: keep a stable placeholder first, then every real option received from the BFF. */
export function formCategories(categories: ComponentProps<typeof CreateEventModal>['categories']) {
  return [{ label: 'Sélectionner une catégorie', value: '' }, ...(categories ?? []).filter(category => category.value !== '')];
}
