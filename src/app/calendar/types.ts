import type { components } from '@/contracts/bff';
import type { ReactNode } from "react";
import type { CalendarOccurrenceWindow } from './filters';

export type CalendarViewMode = "month" | "week" | "day";
export type CalendarAssigneeId = string | number;
export type CalendarDateInput = Date | string;
export type CalendarUserRole = "user" | "responsable" | "mayor";
export type CalendarEventApprovalStatus = "pending" | "approved" | "rejected";
/** The current user's answer to the invitation to an event (absent when they are not assigned). */
export type CalendarParticipation = "accepted" | "pending" | "declined";

export type CalendarRecurrence = {
  frequency: "none" | "daily" | "weekly" | "monthly";
  interval?: number;
  daysOfWeek?: number[];
  endsOn?: CalendarDateInput;
};

export type CalendarAssignee = components['schemas']['CalendarAssignee'];

export type CalendarEventItem = {
  id: string | number;
  title: ReactNode;
  date: CalendarDateInput;
  endDate?: CalendarDateInput;
  category?: string;
  service?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: ReactNode;
  assigneeIds?: CalendarAssigneeId[];
  assignees?: CalendarAssignee[];
  recurrence?: CalendarRecurrence;
  approvalStatus?: CalendarEventApprovalStatus;
  myParticipation?: CalendarParticipation;
  canRespond?: boolean;
  createdById?: CalendarAssigneeId;
  canValidate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  visibleToRoles?: CalendarUserRole[];
  colorClassName?: string;
  className?: string;
  /** MAIR-935: does not match the top-bar search (shown at 30 % opacity). */
  searchDimmed?: boolean;
  /** Date range of the filters: only the occurrences overlapping it are shown. */
  occurrenceWindow?: CalendarOccurrenceWindow;
};

export type CreateCalendarEventValues = {
  title: string;
  description: string;
  date: string;
  endDate: string;
  category: string;
  service?: string;
  startTime: string;
  endTime: string;
  location: string;
  assigneeIds: CalendarAssigneeId[];
  recurrence: CalendarRecurrence;
};
