import React from 'react';
import { X } from 'lucide-react';

import { Button, DataState } from '@mairie360/lib-components/primitives';

export interface NoMatchingEventsProps {
  onClear: () => void;
  className?: string;
}

/** Shown instead of the grid when the filters hide every event of the displayed period. */
export const NoMatchingEvents = ({ onClear, className }: NoMatchingEventsProps) => (
  <DataState className={className} state="empty" title="Aucun événement ne correspond aux filtres"
    description="Modifiez la date, le type ou le service, ou effacez les filtres pour revoir tous vos événements."
    action={<Button variant="ghost" tone="neutral" icon={X} label="Effacer les filtres" onClick={onClear} />} />
);
