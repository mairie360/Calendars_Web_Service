import { useEffect, useRef } from 'react';

import { observeTodayInGrid } from './today-marker';

export function useCalendarTodayMarker(view: string, periodTime: number) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => observeTodayInGrid(gridRef.current), [view, periodTime]);

  return gridRef;
}
