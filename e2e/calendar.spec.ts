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
  const details = page.getByRole('dialog', { name: title });
  await expect(details).toContainText(title);
  await expect(details).toBeVisible();
  return details;
}

test.describe.configure({ mode: 'serial' });

test('an administrator creates an event and invites an agent', async ({ page, context, baseURL }) => {
  await signInAs(context, baseURL!, users.manager);
  await page.goto('/');
  await page.getByRole('button', { name: 'Créer', exact: true }).first().click();

  const dialog = page.getByRole('dialog', { name: 'Nouvel événement' });
  await dialog.getByRole('textbox', { name: 'Titre' }).fill(title);
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Réunion créée par le parcours de bout en bout.');
  // Today by default: the event is listed in the current month and in « À venir » until 23:00.
  await dialog.getByRole('textbox', { name: 'Date de fin' }).fill(await dialog.getByRole('textbox', { name: 'Date de début' }).inputValue());
  await dialog.getByRole('combobox', { name: 'Heure de début' }).selectOption({ label: '09 h 00' });
  await dialog.getByRole('combobox', { name: 'Heure de fin' }).selectOption({ label: '23 h 00' });
  await dialog.getByRole('textbox', { name: 'Lieu' }).fill('Salle du conseil');
  await dialog.getByRole('button', { name: 'Sélectionner des personnes' }).click();
  await page.getByRole('option', { name: /Membre Lecteur/ }).click();
  await page.keyboard.press('Escape');

  const created = page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/calendar/events'));
  await dialog.getByRole('button', { name: 'Enregistrer' }).click();
  const response = await created;
  expect(response.status()).toBe(201);
  const body = await response.json();
  eventId = String(body.id);
  expect(body.assigneeIds).toContain(`user-${users.member.id}`);

  // MAIR-926 C6: the dialog closes on the event's date with the « Événement créé » toast.
  await expect(dialog).toBeHidden();
  await expect(page.getByText('Événement créé', { exact: true })).toBeVisible();
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
});

test('MAIR-484: the event is read back at the hours it was created with, in the instance time zone', async ({ page, context, baseURL }) => {
  await signInAs(context, baseURL!, users.manager);
  const details = await openEvent(page);
  // Created 09 h 00 – 23 h 00 in Europe/Paris: a front left on UTC would show 08:00 – 22:00.
  await expect(details).toContainText('09:00 – 23:00');
});

test('MAIR-484: one main landmark and one status region, mounted before the loading text (RGAA 9.2, 12.6, 7.5)', async ({ page, context, baseURL }) => {
  await signInAs(context, baseURL!, users.manager);
  await page.goto('/');
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('main')).toHaveCount(1);
  const status = page.locator('p[role="status"]');
  await expect(status).toHaveCount(1);
  await expect(status).toHaveText('');
  await status.evaluate((node) => { (window as unknown as { calendarStatus?: Element }).calendarStatus = node; });

  // Hold the next read so the loading state can be observed.
  let release: () => void = () => {};
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/calendar/bootstrap**', async (route) => { await held; await route.continue(); });
  await page.getByRole('button', { name: 'Actualiser' }).click();
  await expect(status).toHaveText('Chargement des données du calendrier…');
  // The same node announces the load: it was not inserted together with its text.
  expect(await status.evaluate((node) => (window as unknown as { calendarStatus?: Element }).calendarStatus === node)).toBe(true);
  await expect(page.locator('[role="status"]', { hasText: /Chargement des (statistiques|événements à venir)/ })).toHaveCount(0);
  release();
  await expect(status).toHaveText('');
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  await page.unroute('**/calendar/bootstrap**');
});

test('MAIR-935: the top-bar search dims the events that do not match and Escape restores them', async ({ page, context, baseURL }) => {
  await signInAs(context, baseURL!, users.manager);
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Rechercher un événement' });
  const pill = page.locator('[data-tone]', { hasText: title }).first();
  await expect(pill).toBeVisible();
  await search.fill(title.toUpperCase());
  await expect(pill).not.toHaveAttribute('data-dimmed', 'true');
  await search.fill('aucun-evenement-ne-correspond');
  await expect(pill).toHaveAttribute('data-dimmed', 'true');
  await search.press('Escape');
  await expect(search).toHaveValue('');
  await expect(pill).not.toHaveAttribute('data-dimmed', 'true');
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
  // MAIR-931: nothing is deleted before the confirmation.
  const confirm = page.getByRole('alertdialog', { name: 'Supprimer cet événement ?' });
  await expect(confirm).toContainText(`« ${title} » sera retiré du calendrier`);
  await confirm.getByRole('button', { name: 'Confirmer la suppression' }).click();

  await expect(page.getByRole('region', { name: 'Notifications du calendrier' }).getByText('Événement supprimé', { exact: true })).toBeVisible();
  await expect(page.getByText(title, { exact: true })).toHaveCount(0);
});

test('without a session, the calendar is not served', async ({ request }) => {
  const response = await request.get('/', { maxRedirects: 0 });
  expect(response.status()).toBe(307);
});
