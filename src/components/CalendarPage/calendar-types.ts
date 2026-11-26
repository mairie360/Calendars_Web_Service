'use client';

import type React from 'react';
import type { CalendarOccurrenceWindow } from '@/app/calendar/filters';

export type CalendarViewMode = 'month' | 'week' | 'day';

export type CalendarDateInput = Date | string;

export type CalendarAssigneeId = string | number;

export type CalendarRecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

export type CalendarUserRole = 'user' | 'responsable' | 'mayor';

export type CalendarEventApprovalStatus = 'pending' | 'approved' | 'rejected';
export type CalendarParticipation = 'accepted' | 'pending' | 'declined';
/** Who can read an event: everyone (`public`) or only its creator and its participants (`private`). */
export type CalendarVisibility = 'public' | 'private';

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
  /** MAIR-935: does not match the top-bar search (shown at 30 % opacity, still clickable). */
  searchDimmed?: boolean;
  /** Date range of the filters: only the occurrences overlapping it are shown. */
  occurrenceWindow?: CalendarOccurrenceWindow;
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
  /** MAIR-1122: the current user's answer to the invitation, absent when they are not assigned. */
  myParticipation?: CalendarParticipation;
  /** MAIR-1122: the current user may answer (an assigned member, BFF decision). */
  canRespond?: boolean;
  /** Absent on an event read before the BFF relayed it: shown as public. */
  visibility?: CalendarVisibility;
  createdById?: CalendarAssigneeId;
  visibleToRoles?: CalendarUserRole[];
  colorClassName?: string;
  className?: string;
}

/** A view of the calendar offered by the toolbar SegmentedControl (MAIR-893). */
export interface ViewSwitcherOption<T extends string = string> {
  value: T;
  label: string;
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

export interface CalendarToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** MAIR-893: the period is the title of the calendar panel; the toolbar only names its controls. */
  title?: string;
  view: CalendarViewMode;
  onToday?: () => void;
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
  /** MAIR-905: a day of the previous or next month (not interactive). */
  outside?: boolean;
  /** Day number shown in the top-left corner. */
  day?: number;
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
  /** « + N » of a full day: opens that day (day view). */
  onShowDay?: (date: Date) => void;
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
  /** MAIR-1123: « +N » of an overlapping group opens the Day view on that date. */
  onShowDay?: (date: Date) => void;
}

export interface DayScheduleProps extends React.HTMLAttributes<HTMLDivElement> {
  currentDate: CalendarDateInput;
  events?: CalendarEvent[];
  hours?: string[];
  onSelectSlot?: (date: Date, time: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

/** MAIR-911: what a calendar panel shows instead of its data while it loads or after a failed read. */
export type CalendarPanelState = 'default' | 'loading' | 'unavailable';

/** MAIR-918: one upcoming occurrence (recurrences expanded) and the month statistics. */
export interface CalendarUpcomingItem {
  event: CalendarEvent;
  date: Date;
}

export interface CalendarMonthStats {
  month: string;
  total: number;
  items: Array<{ category: string; label: string; value: number }>;
}

export interface CalendarCategoryOption {
  value: string;
  label: string;
}

export interface UpcomingEventsPanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  state?: CalendarPanelState;
  onRetry?: () => void;
  items?: CalendarUpcomingItem[];
  categories?: CalendarCategoryOption[];
  /** Today in the instance time zone, for « Aujourd’hui » / « Demain ». */
  today?: Date;
  emptyLabel?: React.ReactNode;
  /** The events are filtered: the description and the empty text say so. */
  filtered?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
}

export interface StatsPanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  state?: CalendarPanelState;
  stats: CalendarMonthStats;
}

export interface CalendarSidebarProps extends React.HTMLAttributes<HTMLElement> {
  state?: CalendarPanelState;
  onRetry?: () => void;
  upcoming: CalendarUpcomingItem[];
  /** « À venir » follows the calendar filters (the statistics do not). */
  upcomingFiltered?: boolean;
  categories?: CalendarCategoryOption[];
  today?: Date;
  stats: CalendarMonthStats;
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
  visibility: CalendarVisibility;
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
  /** MAIR-926: the mockup windows have no subtitle; kept for callers that still pass one. */
  subtitle?: React.ReactNode;
  cancelLabel?: string;
  submitLabel?: string;
  /** MAIR-926 C4: « Enregistrer » loads while the write runs. */
  saving?: boolean;
  /** MAIR-926 C5: the refused write, shown as « Impossible d’enregistrer » at the top of the window. */
  error?: string | null;
  /** MAIR-926 C3: validation errors keyed by input id (`event-title`…), shown under their fields. */
  fieldErrors?: Record<string, string>;
  onCancel: () => void;
  /** Escape, the backdrop and the header close; defaults to `onCancel`. The details editor closes the whole dialog with it. */
  onDismiss?: () => void;
  onCreate: (event: CreateCalendarEventValues) => void;
}

export interface EventDetailsModalProps {
  extraContent?: React.ReactNode;
  /** MAIR-926: validation errors of the edit form, forwarded to it. */
  fieldErrors?: Record<string, string>;
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
  /** MAIR-931: runs after the confirmation; resolves `false` when the deletion was refused (back to the details). */
  onDelete?: (event: CalendarEvent) => void | boolean | Promise<void | boolean>;
  /** A write is running: the delete confirmation shows its button loading. */
  saving?: boolean;
  onApprove?: (event: CalendarEvent) => void;
  onReject?: (event: CalendarEvent) => void;
  /** MAIR-1122: answers the invitation (« Je participe » / « Je décline »). */
  onRespond?: (event: CalendarEvent, status: 'accepted' | 'declined') => void;
}
