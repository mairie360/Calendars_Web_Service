# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "41ee6aa4ed75b9fb34ff7156ecf3138d0e3335c7", "prod": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "prod_tag": "v0.5.0", "staging": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "updated": {"dev": "2026-11-02 23:02 UTC", "prod": "2026-10-21 11:08 UTC", "staging": "2026-10-21 11:05 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.5.0 | `c4beb3a` | 2026-10-21 11:08 UTC |
| staging | — | `c4beb3a` | 2026-10-21 11:05 UTC |
| dev | — | `41ee6aa` | 2026-11-02 23:02 UTC |

## Ajouté sur main depuis la dernière release prod (v0.5.0)

#### Changements de comportement
- Les fenêtres de création et de détail d'événement utilisent désormais la `Modal` de `@mairie360/lib-components` 1.0.3 (piégeage du focus, Échap, titre et description). Depuis l'éditeur de détail, Échap, le fond et la fermeture ferment toute la fenêtre, et « Annuler » revient aux détails. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- La barre d'application et la barre latérale viennent de `AccessibleShell` de la lib, et le calendrier est découpé en composants (`CalendarHeader`, `CalendarViews`, `CalendarModals`). La PR indique un rendu HTML inchangé, mais le diff est tronqué et ne permet pas de le vérifier entièrement. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Technique
- Sécurité des dépendances : `follow-redirects` passe en 1.16.2 dans le lock (GHSA-mrwp-f3q8-3g9p), ce qui corrige `npm audit --omit=dev`. ([#307](https://github.com/mairie360/Calendars_Web_Service/pull/307))
- `postinstall`, `prebuild` et `pretest` ne vérifient plus que l'intégrité locale du zod vendorisé ; la vérification des avis npm passe dans `npm run audit:upstream`, lancé chaque jour par `upstream-advisories.yml`. `npm ci` ne dépend donc plus du réseau. (MAIR-744, [#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))
- Node.js passe en 24.22.1 dans la CI, le `Dockerfile` et `development.Dockerfile` (images épinglées par digest). La description annonce aussi Next.js et eslint-config-next 16.4.2, que le diff tronqué ne permet pas de confirmer. ([#298](https://github.com/mairie360/Calendars_Web_Service/pull/298))
- Dépendances de dev : `jsdom` 30.1.3 et `playwright-core` 1.64.1. ([#297](https://github.com/mairie360/Calendars_Web_Service/pull/297))
- Ajout de `vitest` et de la bibliothèque de tests des composants : `npm test` lance désormais `test:node` puis `test:components`. ([#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- Zod 3 backporté et vendorisé dans `vendor/zod` (correctif de bornes de collections, `overrides`), avec des scripts de provenance des bundles et des baselines de performance. Le source map de production n'est activé que pour la mesure CI. Le diff est tronqué. ([#299](https://github.com/mairie360/Calendars_Web_Service/pull/299))
- Pins de la CI mairie360/CICD : v4.5.0, puis v4.12.0, puis v5.1.0 (stack RGAA, `semgrep-pypi` et `gitleaks-binary`), puis v5.2.2 (contrôles RGPD). Renovate suit désormais le tag du workflow RGPD. ([#296](https://github.com/mairie360/Calendars_Web_Service/pull/296), [#301](https://github.com/mairie360/Calendars_Web_Service/pull/301), [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218), [#311](https://github.com/mairie360/Calendars_Web_Service/pull/311))
- Nouveau workflow `gdpr-pr.yml` : le check « GDPR checklist » vérifie la section « Données personnelles » de chaque PR. Il devient bloquant une fois marqué requis dans la protection de `main`. (MAIR-295, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223))
- Stack d'accessibilité RGAA : `accessibility_test.sh`, `docker-compose-accessibility.yml`, `init-accessibility.sql` et `rgaa.yaml`, avec boucles de readiness bornées, projet Compose dédié et verrou `flock`. Le `promote-prod.yml` transmet `ANTHROPIC_WORKSPACE_ID`. (MAIR-316, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218) ; MAIR-768, [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305))
- Documentation mise à jour : `README.md`, `CLAUDE.md` (maquette Figma, convention d'arborescence des composants), `docs/`. ([#287](https://github.com/mairie360/Calendars_Web_Service/pull/287), [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298))

## Différence dev → staging (en dev, pas encore en staging)

#### Changements de comportement
- Les fenêtres de création et de détail d'événement utilisent désormais la `Modal` de `@mairie360/lib-components` 1.0.3 (piégeage du focus, Échap, titre et description). Depuis l'éditeur de détail, Échap, le fond et la fermeture ferment toute la fenêtre, et « Annuler » revient aux détails. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- La barre d'application et la barre latérale viennent de `AccessibleShell` de la lib, et le calendrier est découpé en composants (`CalendarHeader`, `CalendarViews`, `CalendarModals`). La PR indique un rendu HTML inchangé, mais le diff est tronqué et ne permet pas de le vérifier entièrement. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Technique
- Sécurité des dépendances : `follow-redirects` passe en 1.16.2 dans le lock (GHSA-mrwp-f3q8-3g9p), ce qui corrige `npm audit --omit=dev`. ([#307](https://github.com/mairie360/Calendars_Web_Service/pull/307))
- `postinstall`, `prebuild` et `pretest` ne vérifient plus que l'intégrité locale du zod vendorisé ; la vérification des avis npm passe dans `npm run audit:upstream`, lancé chaque jour par `upstream-advisories.yml`. `npm ci` ne dépend donc plus du réseau. (MAIR-744, [#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))
- Node.js passe en 24.22.1 dans la CI, le `Dockerfile` et `development.Dockerfile` (images épinglées par digest). La description annonce aussi Next.js et eslint-config-next 16.4.2, que le diff tronqué ne permet pas de confirmer. ([#298](https://github.com/mairie360/Calendars_Web_Service/pull/298))
- Dépendances de dev : `jsdom` 30.1.3 et `playwright-core` 1.64.1. ([#297](https://github.com/mairie360/Calendars_Web_Service/pull/297))
- Ajout de `vitest` et de la bibliothèque de tests des composants : `npm test` lance désormais `test:node` puis `test:components`. ([#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- Zod 3 backporté et vendorisé dans `vendor/zod` (correctif de bornes de collections, `overrides`), avec des scripts de provenance des bundles et des baselines de performance. Le source map de production n'est activé que pour la mesure CI. Le diff est tronqué. ([#299](https://github.com/mairie360/Calendars_Web_Service/pull/299))
- Pins de la CI mairie360/CICD : v4.5.0, puis v4.12.0, puis v5.1.0 (stack RGAA, `semgrep-pypi` et `gitleaks-binary`), puis v5.2.2 (contrôles RGPD). Renovate suit désormais le tag du workflow RGPD. ([#296](https://github.com/mairie360/Calendars_Web_Service/pull/296), [#301](https://github.com/mairie360/Calendars_Web_Service/pull/301), [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218), [#311](https://github.com/mairie360/Calendars_Web_Service/pull/311))
- Nouveau workflow `gdpr-pr.yml` : le check « GDPR checklist » vérifie la section « Données personnelles » de chaque PR. Il devient bloquant une fois marqué requis dans la protection de `main`. (MAIR-295, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223))
- Stack d'accessibilité RGAA : `accessibility_test.sh`, `docker-compose-accessibility.yml`, `init-accessibility.sql` et `rgaa.yaml`, avec boucles de readiness bornées, projet Compose dédié et verrou `flock`. Le `promote-prod.yml` transmet `ANTHROPIC_WORKSPACE_ID`. (MAIR-316, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218) ; MAIR-768, [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305))
- Documentation mise à jour : `README.md`, `CLAUDE.md` (maquette Figma, convention d'arborescence des composants), `docs/`. ([#287](https://github.com/mairie360/Calendars_Web_Service/pull/287), [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298))

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
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
