import { Users } from 'lucide-react';
import { Icon } from '@mairie360/lib-components/primitives';

import type { CalendarAssignee } from '../types';

/** The people assigned to the event, or « Aucune personne assignée ». */
export const EventAssigneesList = ({ assignees }: { assignees: CalendarAssignee[] }) => (
  <div className="rounded-md bg-[var(--mairie-surface-raised)] px-3 py-2 text-sm">
    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--mairie-muted)]"><Icon icon={Users} size="s" />Assignés</div>
    {assignees.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {assignees.map((assignee) => <span key={assignee.id} className="inline-flex items-center rounded-md bg-[var(--mairie-accent-surface)] px-2 py-1 text-xs font-semibold text-[var(--mairie-accent)]">{assignee.name}</span>)}
      </div>
    ) : <div className="text-[var(--mairie-muted)]">Aucune personne assignée</div>}
  </div>
);
