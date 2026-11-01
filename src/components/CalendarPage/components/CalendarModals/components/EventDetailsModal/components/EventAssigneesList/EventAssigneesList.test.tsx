import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
const event = { id: 5, title: 'Conseil municipal', date: '2026-10-21', startTime: '18:00', endTime: '20:00', location: 'Salle du conseil', category: 'meeting', approvalStatus: 'pending' as const, assigneeIds: ['alice'] };

import { EventAssigneesList } from './EventAssigneesList';
import { eventValues, selectedAssignees } from '../../../CreateEventModal';

describe('EventAssigneesList', () => {
  it('lists the assignees or says nobody is assigned', () => {
    const people = [{ id: 'alice', name: 'Alice Dupont' }, { id: 'karim', name: 'Karim Payet' }];
    expect(selectedAssignees(people as never, ['alice', 'nobody'])).toEqual([people[0]]);
    expect(eventValues(event as never).assigneeIds).toEqual(['alice']);
    const { rerender } = render(<EventAssigneesList assignees={[people[0]] as never} />);
    expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
    rerender(<EventAssigneesList assignees={[]} />); expect(screen.getByText('Aucune personne assignée')).toBeInTheDocument();
  });
});
