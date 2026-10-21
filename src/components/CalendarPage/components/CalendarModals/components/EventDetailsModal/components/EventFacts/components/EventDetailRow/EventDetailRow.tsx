import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Icon } from '@mairie360/lib-components/primitives';

import { joinClasses } from '@/components/CalendarPage/calendar-style';

/** One labelled fact of an event (date, time, place…), « Non renseigné » when missing. */
export const EventDetailRow = ({ icon, label, value, className = '' }: { icon: LucideIcon; label: React.ReactNode; value?: React.ReactNode; className?: string }) => (
  <div className={joinClasses('flex gap-3 rounded-md bg-[var(--mairie-surface-raised)] px-3 py-2 text-sm', className)}>
    <span className="mt-0.5 shrink-0 text-[var(--mairie-muted)]"><Icon icon={icon} size="s" /></span>
    <div className="min-w-0">
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--mairie-muted)]">{label}</div>
      <div className="mt-0.5 whitespace-normal break-words font-medium text-[var(--mairie-text)]">{value || 'Non renseigné'}</div>
    </div>
  </div>
);
