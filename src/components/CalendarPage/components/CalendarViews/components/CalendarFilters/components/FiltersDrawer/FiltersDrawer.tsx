import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import { Button, Counter, Drawer } from '@mairie360/lib-components/primitives';
import { joinClasses } from '@/components/CalendarPage/calendar-style';

export interface FiltersDrawerProps {
  /** Number of active filters, shown on the button. */
  activeCount: number;
  /** Occurrences of the displayed period kept by the filters (« Voir N événements »). */
  shownCount: number;
  onClear: () => void;
  /** The filter fields, applied as they change. */
  children: React.ReactNode;
  className?: string;
}

/** On small screens, the filters live in a side drawer opened by « Filtres » (with the count of active filters). */
export const FiltersDrawer = ({ activeCount, shownCount, onClear, children, className }: FiltersDrawerProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={joinClasses('calendar-filters-drawer', className)}>
      <span className="relative inline-flex">
        <Button variant="outline" tone="neutral" size="s" icon={SlidersHorizontal} label="Filtres" aria-haspopup="dialog"
          aria-label={activeCount > 0 ? `Filtres, ${activeCount} actif${activeCount > 1 ? 's' : ''}` : 'Filtres'} onClick={() => setOpen(true)} />
        {activeCount > 0 && <Counter value={activeCount} className="absolute -right-1.5 -top-1.5" />}
      </span>
      <Drawer open={open} title="Filtres" onClose={() => setOpen(false)} closeLabel="Fermer les filtres"
        footer={(
          <div className="flex w-full items-center justify-between gap-2">
            <Button variant="ghost" tone="neutral" label="Effacer les filtres" disabled={activeCount === 0} onClick={onClear} />
            <Button label={`Voir ${shownCount} événement${shownCount > 1 ? 's' : ''}`} onClick={() => setOpen(false)} />
          </div>
        )}>
        {children}
      </Drawer>
    </div>
  );
};
