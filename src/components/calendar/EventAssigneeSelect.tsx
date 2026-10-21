import React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search, Users, X } from 'lucide-react';

import { joinClasses } from './style';
import type { CalendarAssignee, CalendarAssigneeId, EventAssigneeSelectProps } from './types';

export type { CalendarAssignee, CalendarAssigneeId, EventAssigneeSelectProps } from './types';

const idsMatch = (firstId: CalendarAssigneeId, secondId: CalendarAssigneeId) =>
  String(firstId) === String(secondId);

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const getSelectedPeople = (people: CalendarAssignee[], value: CalendarAssigneeId[] = []) =>
  value
    .map((id) => people.find((person) => idsMatch(person.id, id)))
    .filter((person): person is CalendarAssignee => Boolean(person));

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const EventAssigneeSelect = ({
  people = [],
  value = [],
  onChange,
  label = 'Personnes assignées',
  placeholder = 'Sélectionner des personnes',
  searchPlaceholder = 'Rechercher une personne...',
  emptyLabel = 'Aucune personne disponible',
  disabled = false,
  className = '',
  ...props
}: EventAssigneeSelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const selectedPeople = getSelectedPeople(people, value);
  const filteredPeople = people.filter((person) => {
    const haystack = `${person.name} ${person.email || ''} ${person.role || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const updateDropdownPosition = React.useCallback(() => {
    if (!buttonRef.current || typeof window === 'undefined') return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportPadding = 12;
    const gap = 4;
    const idealHeight = 320;
    const minHeight = 180;
    const availableBelow = window.innerHeight - buttonRect.bottom - viewportPadding;
    const availableAbove = buttonRect.top - viewportPadding;
    const placeAbove = availableBelow < minHeight && availableAbove > availableBelow;
    const availableHeight = Math.max(minHeight, placeAbove ? availableAbove : availableBelow);
    const maxHeight = Math.min(idealHeight, availableHeight - gap);
    const width = Math.min(buttonRect.width, window.innerWidth - viewportPadding * 2);
    const left = clamp(buttonRect.left, viewportPadding, window.innerWidth - width - viewportPadding);
    const top = placeAbove
      ? Math.max(viewportPadding, buttonRect.top - maxHeight - gap)
      : Math.min(buttonRect.bottom + gap, window.innerHeight - viewportPadding - maxHeight);

    setDropdownStyle({
      left,
      top,
      width,
      maxHeight,
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!open) return;

    updateDropdownPosition();
  }, [open, selectedPeople.length, updateDropdownPosition]);

  React.useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickInsideRoot = Boolean(rootRef.current?.contains(target));
      const clickInsideDropdown = Boolean(dropdownRef.current?.contains(target));

      if (!clickInsideRoot && !clickInsideDropdown) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    const handleReposition = () => updateDropdownPosition();

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, updateDropdownPosition]);

  const togglePerson = (person: CalendarAssignee) => {
    const isSelected = value.some((id) => idsMatch(id, person.id));
    const nextValue = isSelected
      ? value.filter((id) => !idsMatch(id, person.id))
      : [...value, person.id];

    onChange?.(nextValue);
  };

  const removePerson = (person: CalendarAssignee) => {
    onChange?.(value.filter((id) => !idsMatch(id, person.id)));
  };

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      className="fixed z-[70] flex flex-col overflow-hidden rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] shadow-lg"
      style={dropdownStyle}
    >
      <div className="relative shrink-0 border-b border-[var(--mairie-border)] p-2">
        <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mairie-muted)]" strokeWidth={1.8} />
        <input
          type="search"
          value={search}
          placeholder={searchPlaceholder}
          className="h-9 w-full rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] pl-9 pr-3 text-sm text-[var(--mairie-text)] shadow-sm outline-none placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-border)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20"
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div role="listbox" aria-multiselectable="true" className="min-h-0 flex-1 overflow-y-auto p-1">
        {filteredPeople.length > 0 ? (
          filteredPeople.map((person) => {
            const selected = value.some((id) => idsMatch(id, person.id));

            return (
              <button
                key={person.id}
                type="button"
                role="option"
                aria-selected={selected}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm text-[var(--mairie-text)] hover:bg-[var(--mairie-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/20"
                onClick={() => togglePerson(person)}
              >
                {person.avatarUrl ? (
                  <img
                    src={person.avatarUrl}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--mairie-action-background)] text-[11px] font-semibold text-[var(--mairie-on-action)]">
                    {getInitials(person.name)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{person.name}</span>
                  {(person.role || person.email) && (
                    <span className="block truncate text-xs text-[var(--mairie-muted)]">{person.role || person.email}</span>
                  )}
                </span>
                {selected && <Check className="h-4 w-4 shrink-0 text-[var(--mairie-success-text)]" strokeWidth={2} />}
              </button>
            );
          })
        ) : (
          <div className="px-3 py-2 text-sm text-[var(--mairie-muted)]">{emptyLabel}</div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={rootRef} className={joinClasses('relative', className)} {...props}>
      <label className="mb-1 block text-sm font-semibold text-[var(--mairie-text)]">{label}</label>

      <button
        ref={buttonRef}
        type="button"
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 text-left text-sm text-[var(--mairie-text)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/20 disabled:cursor-not-allowed disabled:opacity-60"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Users className="h-4 w-4 shrink-0 text-[var(--mairie-muted)]" strokeWidth={1.8} />
          <span className={joinClasses('truncate', selectedPeople.length === 0 && 'text-[var(--mairie-muted)]')}>
            {selectedPeople.length > 0
              ? `${selectedPeople.length} personne${selectedPeople.length > 1 ? 's' : ''} sélectionnée${
                  selectedPeople.length > 1 ? 's' : ''
                }`
              : placeholder}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[var(--mairie-muted)]" strokeWidth={1.8} />
      </button>

      {selectedPeople.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedPeople.map((person) => (
            <span
              key={person.id}
              className="inline-flex max-w-full items-center gap-1 rounded-md bg-[var(--mairie-success-surface)] px-2 py-1 text-xs font-semibold text-[var(--mairie-success-text)]"
            >
              <span className="truncate">{person.name}</span>
              <button
                type="button"
                aria-label={`Retirer ${person.name}`}
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm hover:bg-[var(--mairie-success-action-background)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35"
                onClick={() => removePerson(person)}
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}

      {dropdown && typeof document !== 'undefined' ? createPortal(dropdown, document.body) : dropdown}
    </div>
  );
};
