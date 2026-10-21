import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EventTitleFields } from './EventTitleFields';

describe('EventTitleFields', () => {
  it('reports the title and the description with their historical ids', () => {
    const onTitle = vi.fn(); const onDescription = vi.fn();
    render(<EventTitleFields title="" description="" onTitle={onTitle} onDescription={onDescription} />);
    fireEvent.change(screen.getByLabelText(/Titre/), { target: { value: 'Conseil' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Ordre du jour' } });
    expect([onTitle.mock.calls[0][0], onDescription.mock.calls[0][0]]).toEqual(['Conseil', 'Ordre du jour']);
    expect(document.getElementById('event-title')).toBeRequired();
  });
});
