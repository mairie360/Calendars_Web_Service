"use client";
import { Card, Skeleton } from "@mairie360/lib-components/primitives";

/** The board before the first confirmed read (Figma 07 « Chargement », 06 « Erreur de lecture »). */
export const CalendarLoadingCard = ({ readError }: { readError?: string | null }) => (
  <Card className="mt-7 min-h-[620px] rounded-lg px-6 py-6">
    {readError ? <p role="alert">{readError}</p> : null}
    <span role="status">Chargement des données du calendrier…</span>
    {!readError && <Skeleton shape="block" size="xl" className="mt-6" />}
  </Card>
);
