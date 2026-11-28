import { fireEvent, screen } from '@testing-library/react';

const monthYear = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' });
const month = new Intl.DateTimeFormat('fr-FR', { month: 'long' });

/** Accessible name of a day of the lib DatePicker (« lundi 1er juin 2026 »). */
export const dayName = (iso: string) => {
  const date = new Date(`${iso}T12:00:00`);
  const day = date.getDate();
  return `${weekday.format(date)} ${day === 1 ? '1er' : day} ${month.format(date)} ${date.getFullYear()}`;
};

/**
 * MAIR-1256: picks `iso` (YYYY-MM-DD) in the lib DatePicker whose trigger has `id`, as a user does:
 * open it, move month by month to the right one, click the day.
 */
export function pickDate(id: string, iso: string) {
  fireEvent.click(document.getElementById(id)!);
  const wanted = `${monthYear.format(new Date(`${iso}T12:00:00`))} : choisir un autre mois`;
  const shown = () => screen.queryByRole('button', { name: wanted });
  for (let step = 0; step < 36 && !shown(); step += 1) fireEvent.click(screen.getByRole('button', { name: 'Mois suivant' }));
  for (let step = 0; step < 72 && !shown(); step += 1) fireEvent.click(screen.getByRole('button', { name: 'Mois précédent' }));
  fireEvent.click(screen.getByRole('button', { name: dayName(iso) }));
}
