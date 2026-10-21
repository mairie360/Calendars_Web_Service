import type { CalendarAssignee, CalendarEvent, CalendarServiceOption } from '@/components/CalendarPage';

// Storybook-only sample records. Production consumers supply their own data.
export const calendarPeople: CalendarAssignee[] = [
  { id: 'alice', name: 'Alice Dupont', role: 'Communication' },
  { id: 'karim', name: 'Karim Payet', role: 'Logistique' },
  { id: 'lea', name: 'Léa Martin', role: 'Culture' },
];

export const calendarServices: CalendarServiceOption[] = [
  { label: 'Direction générale', value: 'direction' },
  { label: 'Culture', value: 'culture' },
  { label: 'Logistique', value: 'logistique' },
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: 'council',
    title: 'Conseil municipal',
    date: '15-06-2026',
    category: 'meeting',
    service: 'direction',
    startTime: '09:00',
    endTime: '10:30',
    assigneeIds: ['alice', 'karim'],
    approvalStatus: 'approved',
  },
  {
    id: 'culture-review',
    title: 'Atelier culture proposé',
    date: '17-06-2026',
    category: 'activity',
    service: 'culture',
    startTime: '14:00',
    endTime: '15:30',
    assigneeIds: ['lea'],
    approvalStatus: 'pending',
    createdById: 'lea',
  },
  {
    id: 'market',
    title: 'Marché local',
    date: '20-06-2026',
    endDate: '21-06-2026',
    category: 'activity',
    service: 'logistique',
    startTime: '08:00',
    endTime: '12:00',
    assigneeIds: ['karim'],
    approvalStatus: 'approved',
  },
];
