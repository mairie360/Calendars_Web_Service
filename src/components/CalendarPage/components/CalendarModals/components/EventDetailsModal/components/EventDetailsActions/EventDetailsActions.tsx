import type React from 'react';
import { Check, X } from 'lucide-react';
import { Button, CancelButton, DeleteButton, EditButton } from '@mairie360/lib-components/primitives';

import type { CalendarEvent } from '@/components/CalendarPage/calendar-types';

export interface EventDetailsActionsProps {
  event: CalendarEvent;
  labels: { close: string; edit: string; delete: string; approve: string; reject: string };
  showValidation: boolean;
  canDelete: boolean;
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: (event: CalendarEvent) => void;
  onApprove?: (event: CalendarEvent) => void;
  onReject?: (event: CalendarEvent) => void;
  /** Focus target when the delete confirmation is cancelled (MAIR-931). */
  deleteRef?: React.Ref<HTMLButtonElement>;
}

/**
 * MAIR-929 C3: « Supprimer » (outline, danger) on the left, « Fermer » and « Modifier » on the right; each
 * action only when allowed. Approve / reject are not in the mockup: they stay in the body
 * (`EventApprovalActions`), between the facts and this footer.
 */
export const EventDetailsActions = ({ event, labels, canDelete, canEdit, onClose, onEdit, onDelete, deleteRef }: EventDetailsActionsProps) => (
  <div className="flex w-full flex-wrap items-center justify-between gap-2">
    <div className="flex gap-2">
      {canDelete && onDelete && <DeleteButton ref={deleteRef} label={labels.delete} variant="outline" onClick={() => onDelete(event)} />}
    </div>
    <div className="flex flex-wrap justify-end gap-2">
      <CancelButton label={labels.close} onClick={onClose} />
      {canEdit && <EditButton label={labels.edit} onClick={onEdit} />}
    </div>
  </div>
);

/** Reject / approve a pending event (kept from V1, placed between the facts and the footer). */
export const EventApprovalActions = ({ event, labels, showValidation, onApprove, onReject }: Pick<EventDetailsActionsProps, 'event' | 'labels' | 'showValidation' | 'onApprove' | 'onReject'>) =>
  showValidation && (onApprove || onReject) ? (
    <div className="flex flex-wrap items-center justify-end gap-2 rounded-lg border border-[var(--mairie-border)] p-3" role="group" aria-label="Validation de l’événement">
      <span className="mr-auto text-sm text-[var(--mairie-muted)]">Cet événement attend une validation.</span>
      {onReject && <Button variant="outline" tone="danger" icon={X} label={labels.reject} onClick={() => onReject(event)} />}
      {onApprove && <Button tone="success" icon={Check} label={labels.approve} onClick={() => onApprove(event)} />}
    </div>
  ) : null;
