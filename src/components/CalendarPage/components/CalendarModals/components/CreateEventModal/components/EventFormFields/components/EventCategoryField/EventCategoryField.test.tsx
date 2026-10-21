import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EventCategoryField } from './EventCategoryField';

describe('EventCategoryField', () => {
  it('offers the categories and reports the choice', () => {
    const onCategory = vi.fn();
    render(<EventCategoryField categories={[{ value: '', label: 'Choisir' }, { value: 'meeting', label: 'Réunion' }]} value="" onChange={onCategory} />);
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: 'meeting' } }); expect(onCategory).toHaveBeenCalledWith('meeting');
  });
});
