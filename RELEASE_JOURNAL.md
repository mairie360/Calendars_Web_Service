# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "63d8030e6ba020ec8767beaaa984de92e4461b48", "prod": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "prod_tag": "v0.5.0", "staging": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "updated": {"dev": "2026-11-03 14:57 UTC", "prod": "2026-10-21 11:08 UTC", "staging": "2026-10-21 11:05 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.5.0 | `c4beb3a` | 2026-10-21 11:08 UTC |
| staging | — | `c4beb3a` | 2026-10-21 11:05 UTC |
| dev | — | `63d8030` | 2026-11-03 14:57 UTC |

## Ajouté sur main depuis la dernière release prod (v0.5.0)

#### Nouveautés
- Les en-têtes de page, les alertes, le bouton de nouvelle tentative et les squelettes de chargement viennent désormais de la lib partagée `@mairie360/lib-components` 1.0.3. Les fenêtres de création et de détail d'événement utilisent la `Modal` de la lib (piège de focus, Échap, titre et description). (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Changements de comportement
- La lib `@mairie360/lib-components` passe de 0.10.2 à 1.0.3, un changement majeur (commit `feat!`). La barre latérale et la navigation de l'application viennent de `AccessibleShell` de la lib : `desktop-navigation`, `accessible-shell` et `sidebar-preference` locaux sont supprimés. (MAIR-608 / MAIR-578, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- La validation Zod des collections est bornée : un backport de sécurité embarqué dans `vendor/zod` remplace la version publiée, et les limites exactes sont dans son patch. (sans clé Jira, [#299](https://github.com/mairie360/Calendars_Web_Service/pull/299))

#### Technique
- Simulation d'usage RGPD avant la prod (`docker-compose-gdpr-simulation.yml`, `gdpr-simulation.yaml`, `gdpr-journey.yaml`, `gdpr_simulation_test.sh`), épinglée sur CICD v5.3.0. (MAIR-497, [#313](https://github.com/mairie360/Calendars_Web_Service/pull/313))
- `npm ci`, `prebuild` et `pretest` ne interrogent plus le service d'avis npm : le contrôle distant passe dans `npm run audit:upstream`, lancé chaque jour par `upstream-advisories.yml`. (MAIR-744, [#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))
- Checklist RGPD obligatoire sur les PR (`gdpr-pr.yml`), épinglée sur CICD v5.3.0. (MAIR-295 et MAIR-771, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223), [#311](https://github.com/mairie360/Calendars_Web_Service/pull/311))
- Pins CICD : passage à v5.2.2 (MAIR-771, [#311](https://github.com/mairie360/Calendars_Web_Service/pull/311)) puis v5.3.0 dans les workflows (MAIR-497, [#313](https://github.com/mairie360/Calendars_Web_Service/pull/313)) ; mises à jour Renovate de CICD v4.5.0 et v4.12.0 ([#296](https://github.com/mairie360/Calendars_Web_Service/pull/296), [#301](https://github.com/mairie360/Calendars_Web_Service/pull/301)).
- Node.js 24.22.1 et Next.js 16.4.2 pour les Dockerfiles, les workflows et la doc, plus les mises à jour TypeScript et tests (jsdom 30.1.3, playwright-core 1.64.1). ([#298](https://github.com/mairie360/Calendars_Web_Service/pull/298), [#297](https://github.com/mairie360/Calendars_Web_Service/pull/297))
- `follow-redirects` passe à 1.16.2 pour corriger GHSA-mrwp-f3q8-3g9p. ([#307](https://github.com/mairie360/Calendars_Web_Service/pull/307))
- Stack d'accessibilité RGAA : `accessibility_test.sh`, `docker-compose-accessibility.yml`, `rgaa.yaml` et `init-accessibility.sql`, avec verrou de run, rapport vidé à chaque run et readiness bornée. (MAIR-316, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218) ; MAIR-768, [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305))
- Tests Vitest ajoutés à `npm test` (`test:components`) et tests de composants co-localisés. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- Le front n'est pas modifié au-delà de ces points ; la sortie de test couvre seulement la politique de CI.

## Différence dev → staging (en dev, pas encore en staging)

#### Nouveautés
- Les en-têtes de page, les alertes, le bouton de nouvelle tentative et les squelettes de chargement viennent désormais de la lib partagée `@mairie360/lib-components` 1.0.3. Les fenêtres de création et de détail d'événement utilisent la `Modal` de la lib (piège de focus, Échap, titre et description). (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Changements de comportement
- La lib `@mairie360/lib-components` passe de 0.10.2 à 1.0.3, un changement majeur (commit `feat!`). La barre latérale et la navigation de l'application viennent de `AccessibleShell` de la lib : `desktop-navigation`, `accessible-shell` et `sidebar-preference` locaux sont supprimés. (MAIR-608 / MAIR-578, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- La validation Zod des collections est bornée : un backport de sécurité embarqué dans `vendor/zod` remplace la version publiée, et les limites exactes sont dans son patch. (sans clé Jira, [#299](https://github.com/mairie360/Calendars_Web_Service/pull/299))

#### Technique
- Simulation d'usage RGPD avant la prod (`docker-compose-gdpr-simulation.yml`, `gdpr-simulation.yaml`, `gdpr-journey.yaml`, `gdpr_simulation_test.sh`), épinglée sur CICD v5.3.0. (MAIR-497, [#313](https://github.com/mairie360/Calendars_Web_Service/pull/313))
- `npm ci`, `prebuild` et `pretest` ne interrogent plus le service d'avis npm : le contrôle distant passe dans `npm run audit:upstream`, lancé chaque jour par `upstream-advisories.yml`. (MAIR-744, [#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))
- Checklist RGPD obligatoire sur les PR (`gdpr-pr.yml`), épinglée sur CICD v5.3.0. (MAIR-295 et MAIR-771, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223), [#311](https://github.com/mairie360/Calendars_Web_Service/pull/311))
- Pins CICD : passage à v5.2.2 (MAIR-771, [#311](https://github.com/mairie360/Calendars_Web_Service/pull/311)) puis v5.3.0 dans les workflows (MAIR-497, [#313](https://github.com/mairie360/Calendars_Web_Service/pull/313)) ; mises à jour Renovate de CICD v4.5.0 et v4.12.0 ([#296](https://github.com/mairie360/Calendars_Web_Service/pull/296), [#301](https://github.com/mairie360/Calendars_Web_Service/pull/301)).
- Node.js 24.22.1 et Next.js 16.4.2 pour les Dockerfiles, les workflows et la doc, plus les mises à jour TypeScript et tests (jsdom 30.1.3, playwright-core 1.64.1). ([#298](https://github.com/mairie360/Calendars_Web_Service/pull/298), [#297](https://github.com/mairie360/Calendars_Web_Service/pull/297))
- `follow-redirects` passe à 1.16.2 pour corriger GHSA-mrwp-f3q8-3g9p. ([#307](https://github.com/mairie360/Calendars_Web_Service/pull/307))
- Stack d'accessibilité RGAA : `accessibility_test.sh`, `docker-compose-accessibility.yml`, `rgaa.yaml` et `init-accessibility.sql`, avec verrou de run, rapport vidé à chaque run et readiness bornée. (MAIR-316, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218) ; MAIR-768, [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305))
- Tests Vitest ajoutés à `npm test` (`test:components`) et tests de composants co-localisés. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- Le front n'est pas modifié au-delà de ces points ; la sortie de test couvre seulement la politique de CI.

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
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
