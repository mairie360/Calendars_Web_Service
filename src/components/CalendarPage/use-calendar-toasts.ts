'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@mairie360/lib-components/primitives';

type CalendarFeedback = {
  feedback: string | null;
  dismissFeedback: () => void;
  mutationError: string | null;
};

/**
 * MAIR-879: action results float in the lib toasts. A success is shown for 5 s, a write error
 * stays until dismissed; the page hook keeps the outcome, this bridge only announces it once.
 */
export function useCalendarToasts({ feedback, dismissFeedback, mutationError }: CalendarFeedback) {
  const toast = useToast();
  useEffect(() => {
    if (!feedback) return;
    toast.success(feedback);
    dismissFeedback();
  }, [feedback, dismissFeedback, toast]);

  const announcedError = useRef<string | null>(null);
  useEffect(() => {
    if (mutationError && mutationError !== announcedError.current) toast.error(mutationError);
    announcedError.current = mutationError;
  }, [mutationError, toast]);
}
