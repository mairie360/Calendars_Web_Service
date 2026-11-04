# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "0258cdd04ecdab485f8caaf405c38dbb90ea0057", "prod": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "prod_tag": "v0.5.0", "staging": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "updated": {"dev": "2026-11-04 21:29 UTC", "prod": "2026-10-21 11:08 UTC", "staging": "2026-10-21 11:05 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.5.0 | `c4beb3a` | 2026-10-21 11:08 UTC |
| staging | — | `c4beb3a` | 2026-10-21 11:05 UTC |
| dev | — | `0258cdd` | 2026-11-04 21:29 UTC |

## Ajouté sur main depuis la dernière release prod (v0.5.0)

#### Changements de comportement
- Les dialogues d'événement (création et détail) utilisent désormais le `Modal` de la lib : focus piégé, fermeture par Escape, titre et description. Depuis l'éditeur de détail, Escape, le fond ou la fermeture ferment toute la fenêtre ; « Annuler » revient au détail. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Corrections
- Avant : le `postinstall` interrogeait le service d'avis npm, donc `npm ci` (local, CI, build Docker) échouait hors ligne ou pendant une panne. Maintenant : `postinstall`, `prebuild` et `pretest` ne vérifient que l'intégrité locale ; la vérification amont passe par `npm run audit:upstream`, lancée chaque jour par `upstream-advisories.yml`. (MAIR-744, [#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))

#### Technique
- Composants calendrier déplacés de la lib vers `src/components/CalendarPage/`, shell pris dans la lib, `@mairie360/lib-components` passé de 0.10.2 à 1.0.3 (MAIR-607, MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287)).
- Validation Zod : backport des collections bornées dans `vendor/zod`, locks réparés, gardes d'intégrité (MAIR-? , [#299](https://github.com/mairie360/Calendars_Web_Service/pull/299)).
- Node.js 24.22.1 dans les Dockerfiles et la CI, Next.js et eslint-config-next en 16.4.2 (MAIR-? , [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298)).
- `follow-redirects` 1.16.2 dans le lock (GHSA-mrwp-f3q8-3g9p, [#307](https://github.com/mairie360/Calendars_Web_Service/pull/307)).
- Mises à jour Renovate : CICD v4.5.0, puis v4.12.0, typings et tests (jsdom 30.1.3, playwright-core 1.64.1, vitest) ([#296](https://github.com/mairie360/Calendars_Web_Service/pull/296), [#297](https://github.com/mairie360/Calendars_Web_Service/pull/297), [#301](https://github.com/mairie360/Calendars_Web_Service/pull/301)).
- Pins CICD v5.2.2 à v5.5.0 dans les workflows, garde RGPD de la PR (`gdpr-pr.yml`, checklist « Données personnelles ») (MAIR-295, MAIR-771, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223), [#311](https://github.com/mairie360/Calendars_Web_Service/pull/311)).
- Stack RGAA (`accessibility_test.sh`, états de `rgaa.yaml`, verrou, rapport vidé à chaque run) (MAIR-316, MAIR-768, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218), [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305)).
- Simulation RGPD d'usage avant prod (`gdpr_simulation_test.sh`, `docker-compose-gdpr-simulation.yml`) (MAIR-497, [#313](https://github.com/mairie360/Calendars_Web_Service/pull/313), [#314](https://github.com/mairie360/Calendars_Web_Service/pull/314)).
- Politique Gitleaks du front (`.gitleaks.toml`, retrait de `.gitleaksignore`) (MAIR-743, [#316](https://github.com/mairie360/Calendars_Web_Service/pull/316)).
- Tests E2E Playwright des parcours (`e2e/`, `e2e_test.sh`, `docker-compose-e2e.yml`) (MAIR-603, [#295](https://github.com/mairie360/Calendars_Web_Service/pull/295)).

## Différence dev → staging (en dev, pas encore en staging)

#### Changements de comportement
- Les dialogues d'événement (création et détail) utilisent désormais le `Modal` de la lib : focus piégé, fermeture par Escape, titre et description. Depuis l'éditeur de détail, Escape, le fond ou la fermeture ferment toute la fenêtre ; « Annuler » revient au détail. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Corrections
- Avant : le `postinstall` interrogeait le service d'avis npm, donc `npm ci` (local, CI, build Docker) échouait hors ligne ou pendant une panne. Maintenant : `postinstall`, `prebuild` et `pretest` ne vérifient que l'intégrité locale ; la vérification amont passe par `npm run audit:upstream`, lancée chaque jour par `upstream-advisories.yml`. (MAIR-744, [#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))

#### Technique
- Composants calendrier déplacés de la lib vers `src/components/CalendarPage/`, shell pris dans la lib, `@mairie360/lib-components` passé de 0.10.2 à 1.0.3 (MAIR-607, MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287)).
- Validation Zod : backport des collections bornées dans `vendor/zod`, locks réparés, gardes d'intégrité (MAIR-? , [#299](https://github.com/mairie360/Calendars_Web_Service/pull/299)).
- Node.js 24.22.1 dans les Dockerfiles et la CI, Next.js et eslint-config-next en 16.4.2 (MAIR-? , [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298)).
- `follow-redirects` 1.16.2 dans le lock (GHSA-mrwp-f3q8-3g9p, [#307](https://github.com/mairie360/Calendars_Web_Service/pull/307)).
- Mises à jour Renovate : CICD v4.5.0, puis v4.12.0, typings et tests (jsdom 30.1.3, playwright-core 1.64.1, vitest) ([#296](https://github.com/mairie360/Calendars_Web_Service/pull/296), [#297](https://github.com/mairie360/Calendars_Web_Service/pull/297), [#301](https://github.com/mairie360/Calendars_Web_Service/pull/301)).
- Pins CICD v5.2.2 à v5.5.0 dans les workflows, garde RGPD de la PR (`gdpr-pr.yml`, checklist « Données personnelles ») (MAIR-295, MAIR-771, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223), [#311](https://github.com/mairie360/Calendars_Web_Service/pull/311)).
- Stack RGAA (`accessibility_test.sh`, états de `rgaa.yaml`, verrou, rapport vidé à chaque run) (MAIR-316, MAIR-768, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218), [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305)).
- Simulation RGPD d'usage avant prod (`gdpr_simulation_test.sh`, `docker-compose-gdpr-simulation.yml`) (MAIR-497, [#313](https://github.com/mairie360/Calendars_Web_Service/pull/313), [#314](https://github.com/mairie360/Calendars_Web_Service/pull/314)).
- Politique Gitleaks du front (`.gitleaks.toml`, retrait de `.gitleaksignore`) (MAIR-743, [#316](https://github.com/mairie360/Calendars_Web_Service/pull/316)).
- Tests E2E Playwright des parcours (`e2e/`, `e2e_test.sh`, `docker-compose-e2e.yml`) (MAIR-603, [#295](https://github.com/mairie360/Calendars_Web_Service/pull/295)).

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-11-04 21:29 UTC | dev | — | `0258cdd` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/41915252162) |
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
