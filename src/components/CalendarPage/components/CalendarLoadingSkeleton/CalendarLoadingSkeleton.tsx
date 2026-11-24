import React from 'react';

import { Skeleton } from '@mairie360/lib-components/primitives';

/**
 * Decorative loading placeholder of a calendar panel: hidden from assistive technologies, the load is
 * announced once by the page's permanent status region (CalendarLoadingStatus).
 */
export const CalendarLoadingSkeleton = ({ className = '', padding = 'var(--mairie-space-m)' }: { className?: string; padding?: string }) => (
  <div aria-busy="true" data-calendar-skeleton="" className={className} style={{ padding }}>
    <Skeleton.TextBlock />
  </div>
);
