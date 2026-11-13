# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "de2f0c4c2b3a97257c53cb334b8535b261e0e334", "prod": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "prod_tag": "v0.5.0", "staging": "de2f0c4c2b3a97257c53cb334b8535b261e0e334", "updated": {"dev": "2026-11-13 02:08 UTC", "prod": "2026-10-21 11:08 UTC", "staging": "2026-11-13 02:13 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.5.0 | `c4beb3a` | 2026-10-21 11:08 UTC |
| staging | — | `de2f0c4` | 2026-11-13 02:13 UTC |
| dev | — | `de2f0c4` | 2026-11-13 02:08 UTC |

## Ajouté sur main depuis la dernière release prod (v0.5.0)

- fix: MAIR-1003 Release prod: align internal versions and deploy ([#323](https://github.com/mairie360/Calendars_Web_Service/pull/323))
- fix: MAIR-816 Release dev: align internal versions and deploy ([#320](https://github.com/mairie360/Calendars_Web_Service/pull/320))
- chore(deps): update dependency mairie360/cicd to v5.6.0 (#318) ([#318](https://github.com/mairie360/Calendars_Web_Service/pull/318))
- feat: MAIR-603 E2E - Parcours utilisateurs Playwright des fronts (#295) ([#295](https://github.com/mairie360/Calendars_Web_Service/pull/295))
- fix: MAIR-743 [Audit 30/10] Login, Calendars, Elearning, Projects: branch Gitleaks fingerprints invalid after squash, main likely red (N1) (#316) ([#316](https://github.com/mairie360/Calendars_Web_Service/pull/316))
- fix: MAIR-497 GDPR - Usage simulation and AI review of logs and database before prod ([#314](https://github.com/mairie360/Calendars_Web_Service/pull/314))
- feat: MAIR-497 RGPD - Simulation d'usage et revue IA des logs et de la base avant la prod ([#313](https://github.com/mairie360/Calendars_Web_Service/pull/313))
- ci: MAIR-771 APIs, BFFs, Database : monter CICD en v5.2.2 pour activer les contrôles RGPD (#311) ([#311](https://github.com/mairie360/Calendars_Web_Service/pull/311))
- fix: MAIR-744 [Audit 30/10] Login, Calendars, Elearning, Projects : le postinstall interroge le service d'avis npm, npm ci dépend du réseau (N2) (#310) ([#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))
- fix(deps): bump follow-redirects to 1.16.2 (GHSA-mrwp-f3q8-3g9p) ([#307](https://github.com/mairie360/Calendars_Web_Service/pull/307))
- fix: MAIR-768 RGAA - Aligner les stacks d'accessibilité des fronts mergés en premier ([#305](https://github.com/mairie360/Calendars_Web_Service/pull/305))
- feat: MAIR-316 RGAA - Périmètre et états des pages par front (#218) ([#218](https://github.com/mairie360/Calendars_Web_Service/pull/218))
- ci: MAIR-295 Ajouter une checklist RGPD aux PR et des rappels d'échéances automatiques (#223) ([#223](https://github.com/mairie360/Calendars_Web_Service/pull/223))
- chore(deps): update dependency mairie360/cicd to v4.12.0 (#301) ([#301](https://github.com/mairie360/Calendars_Web_Service/pull/301))
- fix(security): repair dependency locks and bound Zod validation (#299) ([#299](https://github.com/mairie360/Calendars_Web_Service/pull/299))
- chore(deps): update dependency mairie360/cicd to v4.5.0 (#296) ([#296](https://github.com/mairie360/Calendars_Web_Service/pull/296))
- chore(deps): update typescript dependencies (#297) ([#297](https://github.com/mairie360/Calendars_Web_Service/pull/297))
- fix(security): patch Node.js and Next.js (#298) ([#298](https://github.com/mairie360/Calendars_Web_Service/pull/298))
- feat!: MAIR-608 Lib UI - Normaliser la charte, les tailles et les composants partagés des fronts ([#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

## Différence dev → staging (en dev, pas encore en staging)

_Rien._

## Différence staging → prod (en staging, pas encore en prod)

- fix: MAIR-1003 Release prod: align internal versions and deploy ([#323](https://github.com/mairie360/Calendars_Web_Service/pull/323))
- fix: MAIR-816 Release dev: align internal versions and deploy ([#320](https://github.com/mairie360/Calendars_Web_Service/pull/320))
- chore(deps): update dependency mairie360/cicd to v5.6.0 (#318) ([#318](https://github.com/mairie360/Calendars_Web_Service/pull/318))
- feat: MAIR-603 E2E - Parcours utilisateurs Playwright des fronts (#295) ([#295](https://github.com/mairie360/Calendars_Web_Service/pull/295))
- fix: MAIR-743 [Audit 30/10] Login, Calendars, Elearning, Projects: branch Gitleaks fingerprints invalid after squash, main likely red (N1) (#316) ([#316](https://github.com/mairie360/Calendars_Web_Service/pull/316))
- fix: MAIR-497 GDPR - Usage simulation and AI review of logs and database before prod ([#314](https://github.com/mairie360/Calendars_Web_Service/pull/314))
- feat: MAIR-497 RGPD - Simulation d'usage et revue IA des logs et de la base avant la prod ([#313](https://github.com/mairie360/Calendars_Web_Service/pull/313))
- ci: MAIR-771 APIs, BFFs, Database : monter CICD en v5.2.2 pour activer les contrôles RGPD (#311) ([#311](https://github.com/mairie360/Calendars_Web_Service/pull/311))
- fix: MAIR-744 [Audit 30/10] Login, Calendars, Elearning, Projects : le postinstall interroge le service d'avis npm, npm ci dépend du réseau (N2) (#310) ([#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))
- fix(deps): bump follow-redirects to 1.16.2 (GHSA-mrwp-f3q8-3g9p) ([#307](https://github.com/mairie360/Calendars_Web_Service/pull/307))
- fix: MAIR-768 RGAA - Aligner les stacks d'accessibilité des fronts mergés en premier ([#305](https://github.com/mairie360/Calendars_Web_Service/pull/305))
- feat: MAIR-316 RGAA - Périmètre et états des pages par front (#218) ([#218](https://github.com/mairie360/Calendars_Web_Service/pull/218))
- ci: MAIR-295 Ajouter une checklist RGPD aux PR et des rappels d'échéances automatiques (#223) ([#223](https://github.com/mairie360/Calendars_Web_Service/pull/223))
- chore(deps): update dependency mairie360/cicd to v4.12.0 (#301) ([#301](https://github.com/mairie360/Calendars_Web_Service/pull/301))
- fix(security): repair dependency locks and bound Zod validation (#299) ([#299](https://github.com/mairie360/Calendars_Web_Service/pull/299))
- chore(deps): update dependency mairie360/cicd to v4.5.0 (#296) ([#296](https://github.com/mairie360/Calendars_Web_Service/pull/296))
- chore(deps): update typescript dependencies (#297) ([#297](https://github.com/mairie360/Calendars_Web_Service/pull/297))
- fix(security): patch Node.js and Next.js (#298) ([#298](https://github.com/mairie360/Calendars_Web_Service/pull/298))
- feat!: MAIR-608 Lib UI - Normaliser la charte, les tailles et les composants partagés des fronts ([#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

> Résumé Claude indisponible pour ce passage : listes brutes des commits.

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-11-13 02:13 UTC | staging | — | `de2f0c4` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/43350091915) |
| 2026-11-13 02:08 UTC | dev | — | `de2f0c4` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/43349190262) |
| 2026-11-12 20:50 UTC | staging | — | `91a5fa6` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/43285908015) |
| 2026-11-12 17:06 UTC | dev | — | `91a5fa6` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/43264169756) |
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
