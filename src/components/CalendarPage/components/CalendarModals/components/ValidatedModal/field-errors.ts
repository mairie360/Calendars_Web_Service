import { createContext, useContext } from 'react';

/** MAIR-926: the errors of the event form being validated, keyed by input id (`event-title`…). */
export const EventFieldErrorsContext = createContext<Record<string, string>>({});

/** The error to show under the field whose input has this id. */
export function useEventFieldError(id: string): string | undefined {
  return useContext(EventFieldErrorsContext)[id];
}
