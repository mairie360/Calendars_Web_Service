# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "c82f8ab292e5d39e58d60e8bb9b8427b4c48a980", "prod": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "prod_tag": "v0.5.0", "staging": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "updated": {"dev": "2026-11-02 18:21 UTC", "prod": "2026-10-21 11:08 UTC", "staging": "2026-10-21 11:05 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.5.0 | `c4beb3a` | 2026-10-21 11:08 UTC |
| staging | — | `c4beb3a` | 2026-10-21 11:05 UTC |
| dev | — | `c82f8ab` | 2026-11-02 18:21 UTC |

## Ajouté sur main depuis la dernière release prod (v0.5.0)

#### Changements de comportement
- Les fenêtres de création et de détail d'événement utilisent désormais le composant `Modal` de la lib `@mairie360/lib-components` (piège de focus, Escape, titre et description). Depuis l'éditeur de détails, Escape, le clic sur le fond et le bouton de fermeture ferment toute la fenêtre ; « Annuler » revient aux détails. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Corrections
- `follow-redirects` est passé de 1.16.0–1.16.1 (via `axios`) à 1.16.2 : les identifiants personnalisés ne sont plus transmis aux redirections cross-origin (GHSA-mrwp-f3q8-3g9p), ce qui faisait échouer `npm audit --omit=dev`. (sans clé Jira, [#307](https://github.com/mairie360/Calendars_Web_Service/pull/307))

#### Technique
- Calendrier : les composants calendrier sortent de la lib pour vivre dans `src/components/CalendarPage/` (un dossier par composant, tests co-localisés), la lib passe à 1.0.3, le shell local est remplacé par `AccessibleShell` de la lib, et Vitest et Testing Library sont ajoutés (MAIR-607, MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287)).
- Sécurité Zod : Zod 3 est vendorisé dans `vendor/zod` avec un backport de validation bornée des collections ; `prebuild`, `pretest` et `postinstall` vérifient ce backport, et les locks sont réparés (MAIR-? sans clé Jira, [#299](https://github.com/mairie360/Calendars_Web_Service/pull/299)). Le diff est tronqué : les limites exactes ne sont pas visibles.
- Node 24.22.1 dans le Dockerfile, les workflows et la doc, Next.js et `eslint-config-next` en 16.4.2 selon la description, jsdom 30.1.3 et playwright-core 1.64.1 (sans clé Jira, [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298) et [#297](https://github.com/mairie360/Calendars_Web_Service/pull/297)).
- CICD est épinglé à v4.5.0 puis à v4.12.0 (sans clé Jira, [#296](https://github.com/mairie360/Calendars_Web_Service/pull/296) et [#301](https://github.com/mairie360/Calendars_Web_Service/pull/301)). `promote-prod.yml` passe désormais `ANTHROPIC_WORKSPACE_ID` au pré-audit IA RGAA (MAIR-316, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218)).
- Accessibilité RGAA : nouvelle stack de test (`accessibility_test.sh`, `docker-compose-accessibility.yml`, `rgaa.yaml`, `init-accessibility.sql`) séparée de la stack ZAP, avec son propre nom de projet et des boucles de readiness bornées (MAIR-316, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218)). Le script vide `rgaa-report/` à chaque run, prend un verrou `.rgaa-run.lock`, et s'arrête au lieu de supprimer un `cicd-repo/` non récupéré par lui (MAIR-768, [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305)).
- Checklist RGPD : nouveau workflow `gdpr-pr.yml` qui vérifie la section « Personal data » de chaque PR, et règle Renovate pour le tag CICD de ce workflow (MAIR-295, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223)). Le check doit être rendu obligatoire dans la protection de `main`.
- Performance : la source map n'est générée que dans le build CI isolé, et la baseline reçoit une provenance de lock archivée (sans clé Jira, [#299](https://github.com/mairie360/Calendars_Web_Service/pull/299)).

## Différence dev → staging (en dev, pas encore en staging)

#### Changements de comportement
- Les fenêtres de création et de détail d'événement utilisent désormais le composant `Modal` de la lib `@mairie360/lib-components` (piège de focus, Escape, titre et description). Depuis l'éditeur de détails, Escape, le clic sur le fond et le bouton de fermeture ferment toute la fenêtre ; « Annuler » revient aux détails. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Corrections
- `follow-redirects` est passé de 1.16.0–1.16.1 (via `axios`) à 1.16.2 : les identifiants personnalisés ne sont plus transmis aux redirections cross-origin (GHSA-mrwp-f3q8-3g9p), ce qui faisait échouer `npm audit --omit=dev`. (sans clé Jira, [#307](https://github.com/mairie360/Calendars_Web_Service/pull/307))

#### Technique
- Calendrier : les composants calendrier sortent de la lib pour vivre dans `src/components/CalendarPage/` (un dossier par composant, tests co-localisés), la lib passe à 1.0.3, le shell local est remplacé par `AccessibleShell` de la lib, et Vitest et Testing Library sont ajoutés (MAIR-607, MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287)).
- Sécurité Zod : Zod 3 est vendorisé dans `vendor/zod` avec un backport de validation bornée des collections ; `prebuild`, `pretest` et `postinstall` vérifient ce backport, et les locks sont réparés (sans clé Jira, [#299](https://github.com/mairie360/Calendars_Web_Service/pull/299)). Le diff est tronqué : les limites exactes ne sont pas visibles.
- Node 24.22.1 dans le Dockerfile, les workflows et la doc, Next.js et `eslint-config-next` en 16.4.2 selon la description, jsdom 30.1.3 et playwright-core 1.64.1 (sans clé Jira, [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298) et [#297](https://github.com/mairie360/Calendars_Web_Service/pull/297)).
- CICD est épinglé à v4.5.0 puis à v4.12.0 (sans clé Jira, [#296](https://github.com/mairie360/Calendars_Web_Service/pull/296) et [#301](https://github.com/mairie360/Calendars_Web_Service/pull/301)). `promote-prod.yml` passe désormais `ANTHROPIC_WORKSPACE_ID` au pré-audit IA RGAA (MAIR-316, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218)).
- Accessibilité RGAA : nouvelle stack de test (`accessibility_test.sh`, `docker-compose-accessibility.yml`, `rgaa.yaml`, `init-accessibility.sql`) séparée de la stack ZAP, avec son propre nom de projet et des boucles de readiness bornées (MAIR-316, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218)). Le script vide `rgaa-report/` à chaque run, prend un verrou `.rgaa-run.lock`, et s'arrête au lieu de supprimer un `cicd-repo/` non récupéré par lui (MAIR-768, [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305)).
- Checklist RGPD : nouveau workflow `gdpr-pr.yml` qui vérifie la section « Personal data » de chaque PR, et règle Renovate pour le tag CICD de ce workflow (MAIR-295, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223)). Le check doit être rendu obligatoire dans la protection de `main`.
- Performance : la source map n'est générée que dans le build CI isolé, et la baseline reçoit une provenance de lock archivée (sans clé Jira, [#299](https://github.com/mairie360/Calendars_Web_Service/pull/299)).

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-11-02 18:21 UTC | dev | — | `c82f8ab` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/41470499855) |
| 2026-10-23 13:29 UTC | dev | — | `bbd2aa8` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39960628876) |
| 2026-10-21 18:00 UTC | dev | — | `55a2624` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39647828387) |
| 2026-10-21 11:08 UTC | prod | v0.5.0 | `c4beb3a` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39589435988) |
| 2026-10-21 11:05 UTC | staging | — | `c4beb3a` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39588904477) |
| 2026-10-21 11:00 UTC | dev | — | `c4beb3a` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39587571414) |
| 2026-10-21 10:58 UTC | dev | — | `726df74` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39585029915) |
| 2026-10-21 10:57 UTC | dev | — | `9c5453b` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39585115106) |
| 2026-10-21 10:56 UTC | dev | — | `b4f0ae5` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39584997281) |
| 2026-10-21 10:52 UTC | dev | — | `0f95062` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39584859301) |
| 2026-10-21 03:27 UTC | dev | — | `062845e` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39538125565) |
| 2026-10-20 19:01 UTC | staging | — | `e4129bd` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39478616869) |
| 2026-10-20 18:57 UTC | dev | — | `e4129bd` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39478616869) |
| 2026-10-20 13:40 UTC | dev | — | `dcbfb02` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39431647621) |
| 2026-10-20 12:23 UTC | dev | — | `4d59302` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39421275988) |
| 2026-10-19 22:13 UTC | dev | — | `fe1296b` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39332782417) |
| 2026-10-19 21:58 UTC | dev | — | `5c3debe` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39330879464) |
| 2026-10-19 20:07 UTC | dev | — | `0eecbe1` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39315904414) |
<!-- release-journal-history:end -->
