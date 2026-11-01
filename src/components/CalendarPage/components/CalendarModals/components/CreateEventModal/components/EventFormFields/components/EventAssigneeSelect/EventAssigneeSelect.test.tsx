import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventAssigneeSelect } from './EventAssigneeSelect';
import { axe } from 'jest-axe';
it('delegates a real selected assignee while preserving the existing selection', async () => { const onChange = vi.fn(); const { container } = render(<EventAssigneeSelect people={[{ id: 1, name: 'Anne Marie' }, { id: 2, name: 'Jean' }]} value={[1]} onChange={onChange} />); await userEvent.click(screen.getByRole('button', { name: /1 personne sélectionnée/ })); await userEvent.click(screen.getByRole('option', { name: /Jean/ })); expect(onChange).toHaveBeenCalledWith([1, 2]); await userEvent.keyboard('{Escape}'); expect(screen.queryByRole('option')).not.toBeInTheDocument(); expect((await axe(container)).violations).toEqual([]); });
