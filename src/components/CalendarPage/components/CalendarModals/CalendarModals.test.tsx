import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render } from '@testing-library/react';

import { CalendarModals } from './CalendarModals';

const calendar = { createModalOpen: false, selectedEvent: null, people: [], categories: [], createInitialValues: undefined, saving: false, mutationError: null, setCreateModalOpen: vi.fn(), handleCreateEvent: vi.fn(), setSelectedEvent: vi.fn(), handleSaveEvent: vi.fn(), handleDeleteEvent: vi.fn(), handleValidateEvent: vi.fn() } as unknown as React.ComponentProps<typeof CalendarModals>;

describe('CalendarModals', () => {
  it('renders no dialog while nothing is open', () => {
    const { container } = render(<CalendarModals calendar={calendar} />);
    expect(container).toBeEmptyDOMElement();
  });
});
