import { Check, X } from 'lucide-react';
import { Button, CancelButton, DeleteButton, EditButton } from '@mairie360/lib-components/primitives';

import type { CalendarEvent } from '../types';

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
}

/** Close, reject / approve (pending events only), delete and edit, each only when allowed. */
export const EventDetailsActions = ({ event, labels, showValidation, canDelete, canEdit, onClose, onEdit, onDelete, onApprove, onReject }: EventDetailsActionsProps) => (
  <>
    <CancelButton label={labels.close} onClick={onClose} />
    {showValidation && onReject && <Button variant="outline" tone="danger" icon={X} label={labels.reject} onClick={() => onReject(event)} />}
    {showValidation && onApprove && <Button tone="success" icon={Check} label={labels.approve} onClick={() => onApprove(event)} />}
    {canDelete && onDelete && <DeleteButton label={labels.delete} variant="outline" onClick={() => onDelete(event)} />}
    {canEdit && <EditButton label={labels.edit} onClick={onEdit} />}
  </>
);
