// The custom calendar widgets (date picker, assignee combobox) keep their own markup; they share
// the lib control look (--mairie-control-* tokens, Text/Label style) with the lib fields around them.
export const fieldClassName =
  'h-9 w-full rounded-md border border-[var(--mairie-control-border)] bg-[var(--mairie-control-background)] px-3 text-sm text-[var(--mairie-text)] shadow-sm outline-none transition-colors placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20';
export const labelClassName = 'mb-1 block text-sm font-medium text-[var(--mairie-text)]';
