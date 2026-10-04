# Calendars_Web_Service — Module overview

## Active-module navigation

Desktop and mobile menus omit the archived E-mails and Files modules, matching
the local presentation. The remaining module order and administrator visibility
are unchanged; Settings remains available. The calendar now uses the shared
AppShell with the existing BFF-backed user session. Its main viewport scrolls
without moving the header or footer. Attachments and business documents inside
active modules are not removed.

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

## Typical workflow

Event dialogs own their draft and keyboard focus until the existing operation
confirms the write or the user cancels. A concurrent category read cannot reset
entered fields or clear a refused-write message. Pending controls stay disabled;
after refusal, only an explicit retry submits again. Closing returns focus to
the opening control, or the selected view if that control has been removed.
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

## Published UI composition — 4 October 2026

The composed candidate includes event refusal/draft protection, modal focus and
published shared UI0.6.10. With the genuine SHA512-verified artifact,217 Node
regressions pass sequentially (91.03% lines/92.54% branches/96.70% functions;
unchanged60% gates). TypeScript, the committed OpenAPI/generated-type check,
lint (four inherited warnings) and the one-worker production build pass.
Native1280x720 and measured390x844 verify a pending/refused edit with retained
title/category, explicit confirmed retry, both keyboard boundaries, focus return,
and cancellation/reopening of a fresh creation draft. Four mock upstream calls
(two GET/two PATCH), identical retry payloads, no validation violations or relevant
console logs. This pin-composed recipe does not repeat the earlier eight-second
read, native create/approval/delete or exhaustive paired-prototype checks; those
historical proofs keep their candidate heads. No deployed rights/persistence,
complete image or global accessibility certification is claimed. Integration and
exact-main snapshot refresh still require actual green CI; never waive a red audit.
Only consumer pin/tests/docs are added here; no API/BFF, contract/client/proxy,
authentication, security policy, demo data or deployment change.
