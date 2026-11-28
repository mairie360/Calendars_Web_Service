import { Globe, Lock } from 'lucide-react';
import { RadioGroup } from '@mairie360/lib-components/primitives';

import type { CalendarVisibility } from '@/components/CalendarPage/calendar-types';

/** The two choices of the mockup, public first (the default of a new event). */
export const visibilityOptions = [
  { value: 'public', label: 'Public', hint: 'Visible par tous les agents', icon: Globe },
  { value: 'private', label: 'Privé', hint: 'Visible seulement par vous et les invités', icon: Lock },
] as const;

/** Who can read the event: every agent, or only its creator and its participants. */
export const EventVisibilityField = ({ value, onChange }: { value: CalendarVisibility; onChange: (value: CalendarVisibility) => void }) => (
  <RadioGroup<CalendarVisibility> id="event-visibility" name="visibility" label="Visibilité" size="s" variant="card" inline className="calendar-visibility"
    options={visibilityOptions} value={value} onChange={onChange} />
);
