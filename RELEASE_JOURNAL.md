# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "d6cadfaa5df7b42efb8638895cb25ac540035edb", "prod": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "prod_tag": "v0.5.0", "staging": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "updated": {"dev": "2026-11-04 18:27 UTC", "prod": "2026-10-21 11:08 UTC", "staging": "2026-10-21 11:05 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.5.0 | `c4beb3a` | 2026-10-21 11:08 UTC |
| staging | — | `c4beb3a` | 2026-10-21 11:05 UTC |
| dev | — | `d6cadfa` | 2026-11-04 18:27 UTC |

## Ajouté sur main depuis la dernière release prod (v0.5.0)

#### Changements de comportement
- Les fenêtres d'événement (création et détails) utilisent désormais le composant `Modal` de la lib `@mairie360/lib-components` (version 1.0.3 dans `package.json`). Depuis l'éditeur de détails, Échap, le fond ou la croix ferment toute la fenêtre, et « Annuler » revient aux détails. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- La page et la coque d'application (barre latérale, en-tête) sont composées à partir de `src/components/CalendarPage/` et de `AccessibleShell` de la lib ; les anciens `desktop-navigation`, `accessible-shell` et `sidebar-preference` sont supprimés. (MAIR-607, MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Corrections
- `npm ci` ne dépend plus du réseau. Avant, le `postinstall` interrogeait le service d'avis npm : une panne ou un avis modifié faisait échouer l'installation, le build et les tests. Maintenant, `postinstall`, `prebuild` et `pretest` ne lancent que le contrôle local ; la vérification upstream passe par `npm run audit:upstream` et le workflow quotidien `upstream-advisories.yml`. (MAIR-744, [#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))

#### Technique
- Dépendances et CI : mairie360/CICD suivi de v4.5.0 à v5.3.1 dans `cicd.yml`, `promote-*.yml`, `dev-dependency-exception.yml` et `gdpr-pr.yml` ; Node 24.22.1 dans le Dockerfile, `contracts.yml` et la documentation ; `follow-redirects` 1.16.2 ; `jsdom`, `playwright-core` et `eslint-config-next` mis à jour ; zod vendorisé avec verrous réparés. (MAIR-771, MAIR-744, MAIR-770, GHSA-mrwp-f3q8-3g9p, [#311](https://github.com/mairie360/Calendars_Web_Service/pull/311), [#307](https://github.com/mairie360/Calendars_Web_Service/pull/307), [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298), [#299](https://github.com/mairie360/Calendars_Web_Service/pull/299), [#301](https://github.com/mairie360/Calendars_Web_Service/pull/301), [#296](https://github.com/mairie360/Calendars_Web_Service/pull/296), [#297](https://github.com/mairie360/Calendars_Web_Service/pull/297))
- Outillage de test et sécurité, sans effet pour les utilisateurs : checklist RGPD des PR (`gdpr-pr.yml`), stacks RGAA (`accessibility_test.sh`, `docker-compose-accessibility.yml`, `init-accessibility.sql`), simulation RGPD (`gdpr_simulation_test.sh`, `docker-compose-gdpr-simulation.yml`), politique Gitleaks (`.gitleaks.toml`, suppression de `.gitleaksignore`). (MAIR-295, MAIR-316, MAIR-768, MAIR-497, MAIR-743, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223), [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218), [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305), [#313](https://github.com/mairie360/Calendars_Web_Service/pull/313), [#314](https://github.com/mairie360/Calendars_Web_Service/pull/314), [#316](https://github.com/mairie360/Calendars_Web_Service/pull/316))

## Différence dev → staging (en dev, pas encore en staging)

#### Changements de comportement
- Les fenêtres d'événement (création et détails) utilisent désormais le composant `Modal` de la lib `@mairie360/lib-components` (version 1.0.3 dans `package.json`). Depuis l'éditeur de détails, Échap, le fond ou la croix ferment toute la fenêtre, et « Annuler » revient aux détails. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- La page et la coque d'application (barre latérale, en-tête) sont composées à partir de `src/components/CalendarPage/` et de `AccessibleShell` de la lib ; les anciens `desktop-navigation`, `accessible-shell` et `sidebar-preference` sont supprimés. (MAIR-607, MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Corrections
- `npm ci` ne dépend plus du réseau. Avant, le `postinstall` interrogeait le service d'avis npm : une panne ou un avis modifié faisait échouer l'installation, le build et les tests. Maintenant, `postinstall`, `prebuild` et `pretest` ne lancent que le contrôle local ; la vérification upstream passe par `npm run audit:upstream` et le workflow quotidien `upstream-advisories.yml`. (MAIR-744, [#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))

#### Technique
- Dépendances et CI : mairie360/CICD suivi de v4.5.0 à v5.3.1 dans `cicd.yml`, `promote-*.yml`, `dev-dependency-exception.yml` et `gdpr-pr.yml` ; Node 24.22.1 dans le Dockerfile, `contracts.yml` et la documentation ; `follow-redirects` 1.16.2 ; `jsdom`, `playwright-core` et `eslint-config-next` mis à jour ; zod vendorisé avec verrous réparés. (MAIR-771, MAIR-744, MAIR-770, GHSA-mrwp-f3q8-3g9p, [#311](https://github.com/mairie360/Calendars_Web_Service/pull/311), [#307](https://github.com/mairie360/Calendars_Web_Service/pull/307), [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298), [#299](https://github.com/mairie360/Calendars_Web_Service/pull/299), [#301](https://github.com/mairie360/Calendars_Web_Service/pull/301), [#296](https://github.com/mairie360/Calendars_Web_Service/pull/296), [#297](https://github.com/mairie360/Calendars_Web_Service/pull/297))
- Outillage de test et sécurité, sans effet pour les utilisateurs : checklist RGPD des PR (`gdpr-pr.yml`), stacks RGAA (`accessibility_test.sh`, `docker-compose-accessibility.yml`, `init-accessibility.sql`), simulation RGPD (`gdpr_simulation_test.sh`, `docker-compose-gdpr-simulation.yml`), politique Gitleaks (`.gitleaks.toml`, suppression de `.gitleaksignore`). (MAIR-295, MAIR-316, MAIR-768, MAIR-497, MAIR-743, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223), [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218), [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305), [#313](https://github.com/mairie360/Calendars_Web_Service/pull/313), [#314](https://github.com/mairie360/Calendars_Web_Service/pull/314), [#316](https://github.com/mairie360/Calendars_Web_Service/pull/316))

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-11-04 18:27 UTC | dev | — | `d6cadfa` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/41884178574) |
| 2026-11-04 18:21 UTC | dev | — | `94812cf` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/41883110375) |
| 2026-11-03 14:57 UTC | dev | — | `63d8030` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/41656732248) |
| 2026-11-02 23:02 UTC | dev | — | `41ee6aa` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/41540123493) |
| 2026-11-02 19:55 UTC | dev | — | `e928c4f` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/41513000368) |
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
