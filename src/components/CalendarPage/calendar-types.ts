'use client';

import type React from 'react';

export type CalendarViewMode = 'month' | 'week' | 'day';

export type CalendarDateInput = Date | string;

export type CalendarAssigneeId = string | number;

export type CalendarRecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

export type CalendarUserRole = 'user' | 'responsable' | 'mayor';

export type CalendarEventApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface CalendarRecurrence {
  frequency: CalendarRecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[];
  endsOn?: CalendarDateInput;
}

export interface CalendarAssignee {
  id: CalendarAssigneeId;
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
}

export interface CalendarEvent {
  id: string | number;
  title: React.ReactNode;
  date: CalendarDateInput;
  endDate?: CalendarDateInput;
  category?: string;
  service?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: React.ReactNode;
  assigneeIds?: CalendarAssigneeId[];
  assignees?: CalendarAssignee[];
  recurrence?: CalendarRecurrence;
  approvalStatus?: CalendarEventApprovalStatus;
  createdById?: CalendarAssigneeId;
  visibleToRoles?: CalendarUserRole[];
  colorClassName?: string;
  className?: string;
}

export interface CalendarStat {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface ViewSwitcherOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
}

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  children: React.ReactNode;
}

export interface PageTitleBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  action?: React.ReactNode;
  onAction?: () => void;
}

export interface ViewSwitcherProps<T extends string = string> {
  options: ViewSwitcherOption<T>[];
  value: T;
  onChange?: (value: T) => void;
  className?: string;
  'aria-label'?: string;
}

export interface CalendarToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  view: CalendarViewMode;
  viewOptions?: ViewSwitcherOption<CalendarViewMode>[];
  onViewChange?: (view: CalendarViewMode) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  previousLabel?: string;
  nextLabel?: string;
}

export interface CalendarCellProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  muted?: boolean;
  children?: React.ReactNode;
}

export interface MonthGridProps extends React.HTMLAttributes<HTMLDivElement> {
  currentDate: CalendarDateInput;
  selectedDate?: CalendarDateInput;
  events?: CalendarEvent[];
  weekStartsOn?: 0 | 1;
  dayLabels?: string[];
  onSelectDate?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export interface WeekGridProps extends React.HTMLAttributes<HTMLDivElement> {
  currentDate: CalendarDateInput;
  selectedDate?: CalendarDateInput;
  events?: CalendarEvent[];
  hours?: string[];
  weekStartsOn?: 0 | 1;
  dayLabels?: string[];
  onSelectDate?: (date: Date) => void;
  onSelectSlot?: (date: Date, time: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export interface DayScheduleProps extends React.HTMLAttributes<HTMLDivElement> {
  currentDate: CalendarDateInput;
  events?: CalendarEvent[];
  hours?: string[];
  onSelectSlot?: (date: Date, time: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export interface UpcomingEventsPanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  events?: CalendarEvent[];
  title?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  showEmptyState?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
}

export interface StatsPanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  stats: CalendarStat[];
  title?: React.ReactNode;
}

export interface CalendarSidebarProps extends React.HTMLAttributes<HTMLElement> {
  events?: CalendarEvent[];
  currentDate?: CalendarDateInput;
  upcomingEvents?: CalendarEvent[];
  stats?: CalendarStat[];
  showEmptyState?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
}

export interface EventAssigneeSelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  people?: CalendarAssignee[];
  value?: CalendarAssigneeId[];
  onChange?: (assigneeIds: CalendarAssigneeId[]) => void;
  label?: React.ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: React.ReactNode;
  disabled?: boolean;
}

export interface CreateCalendarEventValues {
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
}

export interface EditCalendarEventValues extends CreateCalendarEventValues {
  id: string | number;
}

export interface CalendarEventCategoryOption {
  label: string;
  value: string;
}

export interface CalendarServiceOption {
  label: string;
  value: string;
}

export interface CreateEventModalProps {
  isOpen: boolean;
  people?: CalendarAssignee[];
  categories?: CalendarEventCategoryOption[];
  initialValues?: Partial<CreateCalendarEventValues>;
  canCreateRecurringEvents?: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  cancelLabel?: string;
  submitLabel?: string;
  onCancel: () => void;
  /** Escape, the backdrop and the header close; defaults to `onCancel`. The details editor closes the whole dialog with it. */
  onDismiss?: () => void;
  onCreate: (event: CreateCalendarEventValues) => void;
}

export interface EventDetailsModalProps {
  extraContent?: React.ReactNode;
  isOpen: boolean;
  event?: CalendarEvent | null;
  people?: CalendarAssignee[];
  categories?: CalendarEventCategoryOption[];
  canEdit?: boolean;
  canDelete?: boolean;
  canValidate?: boolean;
  canCreateRecurringEvents?: boolean;
  title?: React.ReactNode;
  closeLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  approveLabel?: string;
  rejectLabel?: string;
  cancelLabel?: string;
  saveLabel?: string;
  onClose: () => void;
  onSave?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  onApprove?: (event: CalendarEvent) => void;
  onReject?: (event: CalendarEvent) => void;
}
