import type { ReactNode } from "react";

export type CalendarViewMode = "month" | "week" | "day";
export type CalendarAssigneeId = string | number;
export type CalendarDateInput = Date | string;
export type CalendarUserRole = "user" | "responsable" | "mayor";
export type CalendarEventApprovalStatus = "pending" | "approved" | "rejected";

export type CalendarRecurrence = {
  frequency: "none" | "daily" | "weekly" | "monthly";
  interval?: number;
  daysOfWeek?: number[];
  endsOn?: CalendarDateInput;
};

export type CalendarAssignee = {
  id: CalendarAssigneeId;
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
};

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
  createdById?: CalendarAssigneeId;
  visibleToRoles?: CalendarUserRole[];
  colorClassName?: string;
  className?: string;
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
