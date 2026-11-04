import { expect, test, type Page } from '@playwright/test';
import { cookieHeader, signInAs, users } from './support/session';

// Critical journeys of the Calendars front (MAIR-603), on the real stack of docker-compose-e2e.yml
// (BFF Calendar, BFF User, Core and Calendar APIs, seeded database): an administrator creates an
// event and invites an agent; the invited agent sees it but may neither change nor delete it.
// The texts asserted are the French ones displayed on screen.

const stamp = Date.now().toString(36);
const title = `Réunion E2E ${stamp}`;
let eventId = '';

async function openEvent(page: Page) {
  await page.goto('/');
  await page.getByText(title, { exact: true }).first().click();
  const details = page.getByRole('dialog', { name: 'Détail de l’événement' });
  await expect(details).toContainText(title);
  await expect(details).toBeVisible();
  return details;
}

test.describe.configure({ mode: 'serial' });

test('an administrator creates an event and invites an agent', async ({ page, context, baseURL }) => {
  await signInAs(context, baseURL!, users.manager);
  await page.goto('/');
  await page.getByRole('button', { name: 'Nouvel événement' }).first().click();

  const dialog = page.getByRole('dialog', { name: 'Nouvel événement' });
  await dialog.getByRole('textbox', { name: 'Titre' }).fill(title);
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Réunion créée par le parcours de bout en bout.');
  // Today by default: the event is listed in the current month and in « Événements à venir ».
  await dialog.getByRole('textbox', { name: 'Date de fin' }).fill(await dialog.getByRole('textbox', { name: 'Date de début' }).inputValue());
  await dialog.getByRole('combobox', { name: 'Heure de début' }).selectOption({ label: '09 h 00' });
  await dialog.getByRole('combobox', { name: 'Heure de fin' }).selectOption({ label: '23 h 00' });
  await dialog.getByRole('textbox', { name: 'Lieu' }).fill('Salle du conseil');
  await dialog.getByRole('button', { name: 'Sélectionner des personnes' }).click();
  await page.getByRole('option', { name: /Membre Lecteur/ }).click();
  await page.keyboard.press('Escape');

  const created = page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/calendar/events'));
  await dialog.getByRole('button', { name: 'Créer' }).click();
  const response = await created;
  expect(response.status()).toBe(201);
  const body = await response.json();
  eventId = String(body.id);
  expect(body.assigneeIds).toContain(`user-${users.member.id}`);

  await expect(dialog).toBeHidden();
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
});

test('the invited agent sees the event, without the actions to change it', async ({ page, context, baseURL }) => {
  await signInAs(context, baseURL!, users.member);
  const details = await openEvent(page);
  await expect(details).toContainText('Salle du conseil');
  await expect(details).toContainText('Membre Lecteur');
  await expect(details.getByRole('button', { name: 'Supprimer', exact: true })).toHaveCount(0);
  await expect(details.getByRole('button', { name: 'Modifier', exact: true })).toHaveCount(0);
});

test('the invited agent is refused when deleting the event directly', async ({ request }) => {
  expect(eventId).not.toBe('');
  const response = await request.delete(`/calendar/events/${eventId}`, {
    headers: { Cookie: cookieHeader(users.member), Accept: 'application/json' },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(403);
});

test('the administrator deletes the event', async ({ page, context, baseURL }) => {
  await signInAs(context, baseURL!, users.manager);
  const details = await openEvent(page);
  // The creator gets the actions the invited agent does not.
  await expect(details.getByRole('button', { name: 'Modifier', exact: true })).toBeVisible();
  await details.getByRole('button', { name: 'Supprimer', exact: true }).click();

  await expect(page.getByText(`Événement « ${title} » supprimé.`)).toBeVisible();
  await expect(page.getByText(title, { exact: true })).toHaveCount(0);
});

test('without a session, the calendar is not served', async ({ request }) => {
  const response = await request.get('/', { maxRedirects: 0 });
  expect(response.status()).toBe(307);
});
