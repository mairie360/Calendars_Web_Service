import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Icon } from '@mairie360/lib-components/primitives';

import { joinClasses } from '@/components/CalendarPage/calendar-style';

/** One fact of an event with its icon (MAIR-929: `surface-raised`, radius 8), « Non renseigné » when missing. */
export const EventDetailRow = ({ icon, label, value, className = '' }: { icon: LucideIcon; label: React.ReactNode; value?: React.ReactNode; className?: string }) => (
  <div className={joinClasses('flex items-start gap-3 rounded-lg bg-[var(--mairie-surface-raised)] px-3 py-2 text-sm', className)}>
    <span className="mt-0.5 shrink-0 text-[var(--mairie-muted)]" aria-hidden="true"><Icon icon={icon} size="s" /></span>
    <div className="min-w-0">
      <dt className="sr-only">{label}</dt>
      <dd className="m-0 whitespace-normal break-words font-medium text-[var(--mairie-text)]">{value || 'Non renseigné'}</dd>
    </div>
  </div>
);
