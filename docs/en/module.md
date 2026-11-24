# Calendars_Web_Service — Module overview

## Active-module navigation

Desktop and mobile menus omit the archived E-mails and Files modules, matching
the local presentation. The remaining module order and administrator visibility
are unchanged; Settings remains available. The calendar now uses the shared
AppShell with the existing BFF-backed user session. Its main viewport scrolls
without moving the header or footer. Attachments and business documents inside
active modules are not removed.

Calendar-scoped styles preserve the reference sidebar's 44px navigation targets
and separating shadow. The mobile sidebar stays below the published Close
control; keyboard dismissal and focus management remain owned by the shared
component. No prototype identity, notifications or appearance data are copied.

## One account destination

Profile access now opens **Settings**. Existing `/profile` bookmarks and subpaths
redirect to the configured Settings frontend. The sidebar keeps Settings without
a duplicate Profile entry. If Settings is not configured correctly, an explicit
uncached 503 replaces the redirect; no demo identity or simulated save is shown.

## Prototype presentation (MAIR-383)

Calendar-specific styles restore the preserved prototype's 17px system typography,
28px desktop padding, 20px/14px mobile padding, upcoming-list inner spacing
and card shadows. Below 1700px,
long upcoming lists use the viewport-based `clamp(320px, 100dvh - 440px, 560px)`
cap; short and empty lists remain compact. From 1700px the 310px sidebar fits
the calendar grid height, with only the upcoming list scrolling. The existing
named region, focus outline, Home/End keys and event controls are unchanged.
Dark/density presentation attributes are honored if supplied; this does not
provide unavailable persisted appearance preferences or change business data,
contracts, APIs/BFFs, shared package or another frontend.

## Opening dates and midnight (MAIR-407, date scope only)

Each mounted page initializes its calendar from the current browser-local date,
not a timestamp captured when the module/server started. Server and initial
hydration show a date-free loading state before the browser resolves today or
a valid linked date. A new event opened after midnight refreshes an implicit
today default; deliberate date selection, a linked date or a time slot keeps
its own date/time. Browsing periods is never forcibly reset at midnight.
The existing today marker and contract-backed requests remain unchanged.
Period arrows keep the title, selected day, schedule, statistics, read range
and new-event default aligned. Switching month/week/day cannot restore a stale
selection; consecutive arrow actions retain functional date updates. A navigated
period is deliberate and is not replaced by today when creation opens after midnight.
This does not resolve the separate timezone, proxy, logout or infrastructure
audit points in MAIR-407 and changes no API/BFF or environment.

## Refused event saves (MAIR-387)

Create/edit drafts remain open until the existing BFF confirms a save. Pending
controls are disabled and a synchronous guard prevents duplicate mutations.
Status/errors are announced inside the form; refused edits retain all fields
for correction and retry. Explicit cancellation discards the submitted draft;
reopening starts from official event data. Chronology/recurrence validation and
published permissions are unchanged. This corrects a defect inherited from the
preserved prototype, without changing the shared package, API/BFF or data.

Read failures and refused writes keep separate feedback. A late or retried
bootstrap cannot clear a refused save or its in-form message; opening a form
cannot clear a failed read. The calendar's **Retry** only reloads data, never
replays an event write. Both failures remain visible when they coexist; only
the corresponding successful read, a new write attempt or an explicit new
form resets its own feedback. Existing draft and latest-read guards are preserved.

Delete and approve/reject outcomes are also announced **inside the event details
dialog**, through the shared component's public title slot. Pending controls stay
locked; a refused operation keeps the official event and authorized actions
available for an explicit retry. A successful read cannot erase that refusal.
Only the existing mutation response confirms removal or a changed approval status.
The shared component, permissions and details content remain unchanged.

## Confirmed results and delayed reads (MAIR-447)

A calendar read started before a confirmed create, edit, delete or approval
cannot replace that confirmed result. Concurrent retries accept only the latest
response, including its error/loading state; a later fresh read remains authoritative.
The hook also isolates completion callbacks from a different or explicitly closed
event selection. A confirmed deletion closes any reopened copy of that deleted
event, never another event. These selection checks are defensive: the current
form continues to lock cancellation and writes while saving. Refused drafts,
permissions and the existing contract/client are unchanged. No optimistic event,
new endpoint, persistence guarantee or environment change is introduced.

[Technical documentation](technical.md) · [Français](../fr/module.md) · [README](../../README.md)

Display and operate the municipal calendar in the browser using events, assignments and approvals supplied by BFF Calendar.

## Audience and value

Staff organizing their calendars and managers approving events.

Business domain: Calendar.

## Available capabilities

- Browse the calendar and load a date range.
- Follow a Dashboard event link to its date and details.
- Create, edit and delete events according to permissions.
- Select people, categories and services; display approval and recurrence.
- Event texts (title, description, location) refuse `<` and `>` before the request, with a French message per field (MAIR-514); a BFF refusal with field details is listed per field.

## Typical workflow

Event dialogs own their draft until the existing operation
confirms the write or the user cancels. A concurrent category read cannot reset
entered fields or clear a refused-write message. Pending controls stay disabled;
after refusal, only an explicit retry submits again. The dedicated dialog-focus
correction (MAIR-318/#208) is postponed with RGAA and is not included in this
functional-only composition. Historical focus evidence does not certify it.
These frontend behaviors do not imply deployed permission/persistence or full
accessibility certification; those require their own acceptance evidence.

1. Load a date range through `/calendar/bootstrap`, including the month in a valid event link.
2. Create or update an event and choose authorized assignees.
3. Inspect approval status and reload the date range after a mutation.

## Role within Mairie360

Associated repositories: [BFF_Calendar](https://github.com/mairie360/BFF_Calendar).

This repository contains the browser interface and its Next.js adapters. The associated BFF supplies business data and coordinates its sources.

## Data and current state

Calendar API supplies event operations. `calendarAccessRepository.ts` accesses PostgreSQL directly for the directory, assignments, some updates and metadata. The `calendar_event_metadata` table, created by the BFF when needed, references `events.id` and stores category, service, location and recurrence. Categories and services include reference lists defined in the helpers.

## Scope and limitations

Operation depends on consistent user identifiers between Core and Calendar and the expected SQL schema. The Docker stack uses the database shared with BFF User; start that stack first. Metadata and direct SQL access remain current BFF responsibilities.

## Developing or operating this module

The [technical guide](technical.md) covers architecture, configuration, routes, session handling, persistence, tests and CI/CD. It describes sources of truth and contract synchronization with associated repositories.


## Shared visual direction — MAIR-547

Approved light option 1: shared tokens and font, accessible navigation, and preserved business layouts. See the [visual QA](../qa/design-qa.md) for evidence, checks, and RGAA limitations.

## V2 screen (epic MAIR-820)

The calendar follows the agreed V2 mockup ([Figma, journeys F1–F9](https://www.figma.com/design/TaP7bHBB2E4uyTEJ5wg6Df/Mairie360-%E2%80%93-Calendars_Web_Service?node-id=19-794)) on `@mairie360/lib-components` 2.

- **Foundation (MAIR-879).** Lib 2.1.0: collapsible teal navigation band, tinted top bar and full-width
  footer owned by the lib frame (the calendar no longer reshapes it), always-light theme. Action results
  float in the lib toasts (`ToastProvider`, bottom right): a success disappears after 5 s, a refused write
  stays until dismissed.
- **Loading and unavailable states (MAIR-911).** The first read and « Réessayer » show
  skeletons in the three panels (calendar, upcoming events, statistics); a period change keeps the grid.
  When the calendar cannot be read, the toolbar stays and the panels show « Calendrier indisponible. »
  (with the error and « Réessayer »), an unavailable alert with « Réessayer » and « Statistiques
  indisponibles. ». The former status bar is gone: write errors stay in the dialogs and the toasts.
- **Page header (MAIR-884).** Subtitle « Planifiez et organisez les activités de la mairie »; actions
  « Actualiser » (rereads the displayed period, disabled while a read runs) then « Créer » (opens « Nouvel
  événement », shown once the data is ready).
- **Calendar panel (MAIR-893).** The calendar sits in a lib `Panel` titled with the displayed period
  (« Novembre 2026 », « 9 – 15 novembre 2026 », « Jeudi 12 novembre 2026 »). Toolbar: lib Précédent /
  Suivant (one month, week or day), « Aujourd’hui » (back to the period holding today) and the view choice
  as a lib `SegmentedControl` (Mois / Semaine / Jour, arrow keys). The URL keeps following `view` and `date`.
- **Overlapping meetings (MAIR-1123).** In the week view, each group of overlapping meetings shows one of them,
  readable at the full width of the day (title on two lines at most, start time), with a « +N » button (label « N
  autres rendez-vous le …, ouvrir la vue Jour ») that opens the Day view on that date; a lone meeting keeps the
  full width. The Day view lays overlapping meetings side by side.
- **Month grid (MAIR-905).** Clicking a day (or Enter / Space on it) keeps it selected and opens « Nouvel
  événement » on that day, 09:00 – 10:00; clicking a pill still opens its details. Cells follow the mockup:
  Default, Selected, Today (accent border, number on an accent pill) and Outside (days of the adjacent
  months on `surface-raised`, not interactive). Pills take the tone of their category and show their start
  time only while their day holds a single event.
- **Colours and legend (MAIR-1121).** No grey nor neutral event: meeting navy (`secondary` / `on-secondary`),
  activity success, ceremony warning, other purple (`purple-surface` / `purple-text`), in the three views and
  on the `StatusPill`s (lib 2.3 tones `secondary-strong` and `purple`). A « Légende du calendrier » under the
  grid shows exactly these colours.
- **My participation (MAIR-1122).** A meeting follows my answer to its invitation, in the three views: accepted =
  solid navy; pending = surface with a dashed navy border; declined = surface, thin navy border and struck-through
  title (the state is also read by screen readers). The details of a meeting I am invited to show the « Ma
  participation » block (state, « Je décline » / « Je participe »); an answer gives the « Réponse envoyée » toast
  and the pill changes at once, a refusal gives an error toast and keeps the previous state. The legend shows the
  three looks.
- **Right column (MAIR-918).** « À venir » comes first: the next three occurrences from now (recurrences
  included, an event of today stays until its end time), each row with its title, category pill, day
  (« Aujourd’hui », « Demain », « ven. 20 nov. ») and hours, and participants; a row opens the event details.
  Then « Statistiques »: « N événements en <mois> » for the displayed month and one metric card per API
  category (Réunions, Animations, Cérémonies, Autres), recomputed when the month changes.
- **Event details (MAIR-929).** The dialog is titled with the event; under the title the category pill
  (and « En attente » / « Refusé » when relevant) and the description; then four facts with icons: Date
  with the recurrence (« Jeudi 12 novembre 2026 · chaque mois »), Horaire, Lieu, Participants. The training
  link and the approve / reject actions of pending events follow. Footer: « Supprimer » on the left,
  « Fermer » and « Modifier » on the right, each only when allowed. Saving and refusals no longer show in the
  title: the dialog is busy while saving and the outcome goes to the toasts.
- **Deletion (MAIR-931).** « Supprimer » opens a danger confirmation (« Supprimer cet événement ? », « « <titre> »
  sera retiré du calendrier[, avec toutes ses répétitions]. Cette action est définitive. »). « Annuler », ✕ or
  Escape return to the details with focus on « Supprimer »; « Confirmer la suppression » loads during the call.
  Success closes every dialog and toasts « Événement supprimé »; a refusal returns to the details and toasts
  « Suppression impossible — <raison> ».
- **Event form (MAIR-926).** « Nouvel événement » and « Modifier l’événement » have no subtitle and save with
  « Enregistrer », which loads during the call (no double submit). Fields: Titre*, Description, Date de début* +
  Date de fin, Heure de début + Heure de fin, Catégorie + Récurrence (recurrence details below), Lieu,
  Participants (« Les participants reçoivent l’événement dans leur calendrier. »). Errors show under their field
  (« Donnez un titre à l’événement. », « La date de fin doit suivre la date de début. », « L’heure de fin doit
  suivre l’heure de début. ») and the first one takes the focus. A refusal shows « Impossible d’enregistrer » at
  the top of the dialog, keeps the entries and toasts the error; success closes the dialog, moves the calendar to
  the event date and toasts « Événement créé » / « Événement modifié ».
- **Search (MAIR-935).** The top-bar « Rechercher un événement » filters on every keystroke, ignoring case and
  accents, on the title and the location: in the month, week and day views the events that do not match fade to
  30 % and stay clickable (no match fades everything, no dedicated message); clearing it (✕ or Escape) shows
  every event again. The query survives period and view changes.
