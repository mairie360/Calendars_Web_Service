# Calendars_Web_Service — Module overview

[Technical documentation](technical.md) · [Français](../fr/module.md) · [README](../../README.md)

Display and operate the municipal calendar in the browser using events, assignments and approvals supplied by BFF Calendar.

## Audience and value

Staff organizing their calendars and managers approving events.

Business domain: Calendar.

## Available capabilities

- Browse the calendar and load a date range.
- Create, edit and delete events according to permissions.
- Select people, categories and services; display approval and recurrence.

## Typical workflow

1. Load a date range through `/calendar/bootstrap`.
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
