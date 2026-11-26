import { it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventAssigneeSelect } from './EventAssigneeSelect';
import { axe } from 'jest-axe';
it('delegates a real selected assignee while preserving the existing selection', async () => { const onChange = vi.fn(); const { container } = render(<EventAssigneeSelect people={[{ id: 1, name: 'Anne Marie' }, { id: 2, name: 'Jean' }]} value={[1]} onChange={onChange} />); await userEvent.click(screen.getByRole('button', { name: /1 personne sélectionnée/ })); await userEvent.click(screen.getByRole('option', { name: /Jean/ })); expect(onChange).toHaveBeenCalledWith([1, 2]); await userEvent.keyboard('{Escape}'); expect(screen.queryByRole('option')).not.toBeInTheDocument(); expect((await axe(container)).violations).toEqual([]); });

it('MAIR-1222 the people popup is a named dialog whose search field and list have a name (RGAA 11.1, 12.6)', async () => {
  // The field sits in the page's main landmark; its popup is rendered at the end of the body.
  render(<main><EventAssigneeSelect people={[{ id: 1, name: 'Anne Marie' }]} value={[]} onChange={vi.fn()} /></main>);
  await userEvent.click(screen.getByRole('button', { name: /Aucune personne|sélectionn|Choisir/i }));
  const popup = screen.getByRole('dialog', { name: 'Choisir des participants' });
  expect(popup).toContainElement(screen.getByRole('listbox', { name: 'Personnes' }));
  expect(popup).toContainElement(screen.getByRole('searchbox', { name: /Rechercher/ }));
  expect((await axe(document.body)).violations.map((violation) => violation.id)).not.toContain('region');
});
