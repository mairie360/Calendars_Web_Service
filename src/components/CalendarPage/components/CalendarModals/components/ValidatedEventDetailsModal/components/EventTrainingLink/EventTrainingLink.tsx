"use client";

import { useEffect, useState } from 'react';
import { frontUrl } from '@/lib/front-urls';
import { parseFrontUrl } from '@/lib/front-url';

export interface EventTraining { id: string; title: string }
export interface EventTrainingSource { find: (eventId: string, signal: AbortSignal) => Promise<EventTraining | null> }

export function trainingDestination(base: string | undefined, training: EventTraining | null) {
  if (!training?.id.trim() || !training.title.trim() || !base) return undefined;
  const parsed = parseFrontUrl(base); if (!parsed) return undefined;
  const url = new URL(parsed.href); url.searchParams.set('course', training.id); return url.href;
}

export function EventTrainingLink({ eventId, source, baseUrl = frontUrl('ELEARNING_FRONT_URL') }: {
  eventId: string; source?: EventTrainingSource; baseUrl?: string;
}) {
  const [training, setTraining] = useState<EventTraining | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!source) return;
    const controller = new AbortController();
    void source.find(eventId, controller.signal).then(value => {
      if (controller.signal.aborted) return;
      if (value && (typeof value.id !== 'string' || typeof value.title !== 'string' || !value.id.trim() || !value.title.trim())) throw new Error('L’association à la formation n’a pas pu être confirmée.');
      setTraining(value);
    }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'La formation associée est indisponible.'); });
    return () => controller.abort();
  }, [source, eventId]);
  const href = trainingDestination(baseUrl, training);
  if (error) return <p role="alert">{error}</p>;
  if (!training) return null;
  return <section className="rounded border border-[#d8d2ca] bg-[#f8fafc] p-4 [overflow-wrap:anywhere]"><h3 className="font-semibold">Formation associée</h3><p>{training.title}</p>{href ? <a className="mt-2 inline-block underline" href={href}>Ouvrir la formation</a> : <p>Le module Formation est temporairement inaccessible.</p>}</section>;
}
