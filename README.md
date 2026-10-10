# Calendars_Web_Service

## Current shared UI artifact — 10 October 2026

This frontend consumes the published `@mairie360/lib-components@0.6.12` artifact from source commit `6c022cb53da535fd16d4fa80a5cdb943d3791f31`. The selected manifest version, root lock entry, installed package, registry integrity and recorded distribution hashes are checked together by the release tests. Application pins and published BFF contracts are unchanged by this documentation update. Historical 0.6.11 notes below describe the earlier delivery.

## Published shared library — 9 October 2026

The earlier delivery pinned the real `@mairie360/lib-components@0.6.11` artifact published from library main `f2433185c5f52125698428b2610701a834efccf4`. Registry integrity and downloaded distribution files were verified. Only the exact UI pin and its root/package lock entries change; other dependencies, published BFF contracts, layouts, security and RGAA controls remain unchanged. Cross-consumer tests and browser evidence are recorded separately from main/dev delivery.

Dependency selection uses verified immutable registry metadata because npm 11.15 rejects the fresh release under the existing seven-day chooser and warns that its existing internal UI exclusion key is unsupported. Configuration remains unchanged; a normal locked installation must verify this candidate.

Ce front utilise le paquet réellement publié 0.6.11. Le verrou reprend les métadonnées et l’intégrité vérifiées du registre, sans changer les autres dépendances, la politique sept jours ou les contrats publiés. Installation, contrôles du consommateur, intégration main, snapshot et recette dev restent des étapes distinctes.


## Runtime maintenance / Maintenance des dépendances — 8 October 2026

Next and eslint-config-next are pinned to `16.3.8`; the existing scoped
image runtime resolves sharp `0.35.5` and source-map-js `1.2.2`. The public
seven-day release policy, published BFF contract and shared UI pins are
retained. The full blocking audit remains required; braces is independently
unresolved. Candidate changes require their own checks and protected main
integration before delivery is declared complete.

Next et eslint-config-next sont épinglés à `16.3.8` ; le moteur d’images
ciblé utilise sharp `0.35.5`, et source-map-js est verrouillé à `1.2.2`.
Le délai public de sept jours, les contrats BFF publiés et les versions de
l’UI sont conservés. L’audit bloquant reste requis ; braces demeure un
blocage indépendant. Les vérifications du candidat et son intégration
protégée sur main restent nécessaires avant de déclarer la livraison.

Display and operate the municipal calendar in the browser using events, assignments and approvals supplied by BFF Calendar.

Afficher et piloter le calendrier municipal dans le navigateur, avec événements, affectations et validations fournis par BFF Calendar.

## Documentation

| Language / Langue | Module | Technical / Technique |
| --- | --- | --- |
| English | [Module overview](docs/en/module.md) | [Technical documentation](docs/en/technical.md) |
| Français | [Présentation du module](docs/fr/module.md) | [Documentation technique](docs/fr/technical.md) |

The guides describe the implemented module, its current limitations, local setup, routes, data, verification and CI/CD.

Les guides décrivent le module implémenté, ses limites actuelles, le démarrage local, les routes, les données, les vérifications et la CI/CD.

Calendar-scoped sidebar styles restore the reference's 44px navigation targets
and shadow without replacing the published mobile Close control or session.
Les styles de sidebar limités à Calendars rétablissent les cibles de 44px et
l'ombre de la référence sans remplacer le bouton Fermer mobile ni la session.
Tracking / Suivi: MAIR-180, [issue #210](https://github.com/mairie360/Calendars_Web_Service/issues/210).

## Contracts and background / Contrats et compléments

- [BFF.md](BFF.md)
- [BACKEND.md](BACKEND.md)
- [contracts/openapi.json](contracts/openapi.json)

`BACKEND.md`, when present, includes proposed backend requirements; use the guides and versioned OpenAPI contract to identify current behavior.

`BACKEND.md`, lorsqu’il est présent, contient des besoins backend proposés; consulter les guides et le contrat OpenAPI versionné pour identifier le comportement actuel.

## Frontend image packaging / Packaging des images frontend (MAIR-436)

The MAIR-230 prerequisite in [PR #205](https://github.com/mairie360/Calendars_Web_Service/pull/205)
executes real blocking Semgrep and redacted Gitleaks under the exact required
legacy status `CICD / Code Security Audit (Semgrep)`. Reviewed scanner actions
are checked out at published CICD v4.0.1 commit
`539847726d4058a9565c4f682c2d1d8302874b06`, with immutable checkout actions,
full frontend history, no persisted credentials and read-only job permissions.
The six rule packs and pinned scanner images are unchanged; findings or scanner
errors fail the job. The shared v4.0.2 audit remains in place. No synthetic
success, branch-protection change, scan bypass or shared CICD modification.
`node --test tests/required-security-check.test.cjs` verifies this exact policy.

Le prérequis MAIR-230 dans la PR #205 lance vraiment Semgrep et Gitleaks
bloquants (secrets expurgés) sous le nom exact requis ci-dessus. Les actions
publiées et relues sont épinglées au commit CICD v4.0.1 indiqué, avec checkout
immuable, historique complet, credentials non persistés et lecture seule.
Les six packs de règles et images de scanners restent inchangés ; findings et
erreurs échouent. L'audit partagé v4.0.2 reste actif. Aucun succès artificiel,
contournement de scan, changement de protection ou modification de CICD partagé.
Les tests ci-dessus vérifient la politique exacte. L'ancienne issue #167 reste
clôturée pour ses findings initiaux ; l'issue #204 suit ce nouveau prérequis.

Production, development and both consumer workflows use exact Node `24.21.0`;
the official Bookworm slim image is pinned by digest. Export the existing
`NODE_AUTH_TOKEN` credential through your normal secure environment, never a
build argument or a committed value. Both Dockerfiles use `npm ci` with the
required `node_auth_token` BuildKit secret and a readonly mount of tracked
`.npmrc`; its seven-day dependency policy stays unchanged. For a direct build,
use `docker buildx build --secret id=node_auth_token,env=NODE_AUTH_TOKEN .`
(add `-f development.Dockerfile` for development). The three Compose files
provide that same secret to the frontend build only. The development runtime
no longer receives the credential; its account, dev command and business
environment remain unchanged. The non-root production runtime keeps Node and
curl without unused global package managers. Existing security/performance
controls are not weakened; API/BFF services and product sources are unchanged.

Production, développement et les deux workflows consommateurs utilisent Node
`24.21.0` exact, avec image officielle Bookworm slim épinglée par digest.
Exporter le credential existant `NODE_AUTH_TOKEN` via l’environnement sécurisé
habituel, jamais un argument de build ou une valeur commitée. Les deux
Dockerfiles utilisent `npm ci`, le secret BuildKit requis `node_auth_token` et
la politique `.npmrc` suivie en montage readonly, sans changer son délai de
sept jours. La commande ci-dessus construit directement l’image ; ajouter
`-f development.Dockerfile` pour le développement. Les trois Compose transmettent
ce secret au seul build frontend ; le runtime de développement ne le reçoit
plus, sans changer son compte, sa commande ni ses variables métier. Le runner
production non-root conserve Node/curl sans gestionnaires globaux inutiles.
API/BFF, code produit et contrôles sécurité/performance restent inchangés.

`node --test tests/ci-policy.test.cjs` covers both image policies and the three
Compose builds. A passing runtime-base check alone is not proof of the complete
application image: [issue #204](https://github.com/mairie360/Calendars_Web_Service/issues/204)
stays open until integrated-main build/push, blocking image scan, signature,
ZAP/k6 and preserved local snapshot verification succeed. No Staging/Prod gate
or cluster pin is changed by this correction.

Les régressions vérifient les deux images et les trois builds Compose. Un contrôle
du runtime-base seul ne suffit pas : l’issue #204 reste ouverte jusqu’aux preuves
de l’image complète sur main intégré, scan bloquant/signature/ZAP/k6 et copie
locale préservée. Aucun gate Staging/Prod ni pin de cluster n’est changé.

Calendar draft recovery (MAIR-387 / issue #196) also protects fields when real
category options first arrive or are reordered. The frontend keeps initialization
owned by each form opening; cancel/reopen gets fresh values and the already-loaded
default. A presentation-only empty choice keeps incoming options from resetting
the shared form; it is not business data. The shared library and BFF are unchanged.

La reprise des brouillons Calendars conserve aussi les saisies lorsqu’une lecture
apporte ou réordonne les catégories réelles. Chaque ouverture initialise son
propre brouillon ; annuler puis rouvrir reprend les nouveaux defaults. Le choix
vide de présentation ne remplace aucune donnée métier ni ne modifie le contrat.

## Functional-only composition / Composition fonctionnelle seule

The branch `fix/calendars-functional-stabilization` starts from protected main
fd2897c and composes existing MAIR-387/#196 read/write isolation, visible detail
feedback and category-draft ownership, the cross-flow regression, published UI
alignment and reference sidebar presentation (#210/MAIR-180). Source comparison
with mixed candidate79f71e0 finds only the dedicated modal-focus helper and its
wiring absent; all other functional sources, clients, contracts and workflows
are identical. Commit5d13a90 and merge1928d75 are not imported. Neither helper
nor its dedicated tests existed on main: no existing RGAA check is disabled.
MAIR-318/#208 remains open/postponed; original mixed PR209 and the old local
are preserved. Real applicable CI and protected-main/local-current acceptance
remain necessary before closing each existing ticket.

La branche fonctionnelle repart de mainfd2897c sans la tranche dédiée au focus.
Les corrections métier existantes de MAIR-387 et la présentation MAIR-180 sont
conservées ; pas de changement API/BFF, contrat, contrôle RGAA/sécurité ou
protection de main. La PR209 mixte et l'ancienne version restent intactes.

### Functional-only verification — 6 October 2026

The composed functional source passes211 Node tests with no failures, skips or
cancellations and unchanged60% coverage gates (91.08/92.56/96.52%). TypeScript,
committed Calendar OpenAPI/generated-type consistency, lint (zero errors/four
inherited warnings) and a fresh Next16.3.6 webpack production build pass.
Dependencies matching the mixed manifest/lock are reused; local Node24.6 is not
CI24.21 or fresh-install/image certification. Temporary CPU1/768MiB build settings
are restored exactly. No raw SDK-spec export comparison is claimed.

An additional full probe against Login's published User0.5.0 snapshot yields
208passes/3failures: two synthetic401 and one502 session replies are not declared
by that success-only export. The normal harness uses its existing minimal User
operation/status fallback; its passing suite is not strict negative-User-schema
certification. The three diagnostic failures are recorded, not suppressed or
counted as passing; neither the harness, snapshot nor SDK is edited. Native QA
validates its User200 reply against that published frontend snapshot read-only.

Fresh native1280×720 and independently measured390×844/document390 verify refused
desktop edit/draft retention and identical explicit retry, then mobile create
pending/refusal before an eight-second read completes and reorders categories.
Title, description, location, selected category and in-dialog refusal survive
that completed read. Only an explicit identical retry confirms and closes;
cancel/reopen gives an empty fresh title without another write. The ledger has
8GET/4PATCH/2POST, three identical refusal/retry body pairs, zero contract violations
and two timed8002/8001ms reads. The desktop reads completed before its second
refusal, so only the mobile recipe proves native refusal-before-read completion.
The first attempted desktop view change did not initiate a read; it is not proof
of the concurrent-read case. The browser's short observation timeout on the mobile
read was followed by the same live recipe, not a restarted server.

Identity, content, no framework overlay, console warn/error empty and screenshots
are checked; no document overflow at the measured widths. No dedicated focus/RGAA,
native delete/approval/recurrence/zoom, deployed permissions/auth/persistence,
complete image or new exhaustive paired-reference certification is inferred.
Own helper/front/tabs are stopped. Exact-head CI and protected-main/local-current
integration remain outstanding; each ticket retains its separate open criteria.

La composition fonctionnelle passe211tests, types/contrat local/lint/build avec
seuils inchangés. Le contrôle supplémentaire User0.5.0 a trois échecs de fixtures
négatives401/502 non exportées : ne pas les déclarer verts ni modifier le contrat
ou le harnais. Recette fraîche desktopédition et mobilecréation390×844 : refus
avant lecture retardée/recatégorisation, brouillon/message conservés, retry unique
confirmé et annulation/réouverture vierge.8GET/4PATCH/2POST, trois paires identiques,
zéro violation sur ces réponses déclarées. Pas certification RGAA, droits ou
persistance déployés ; processus arrêtés, CI/main/local-current encore requis.

## Historical mixed dialog acceptance / Validation historique des dialogues mixtes

The following 4 October record belongs to the historical mixed candidate,
including its focus correction. It is retained for provenance, not claimed as
fresh verification of the functional-only branch. Revision-specific checks and
their limitations must be reported separately; no RGAA acceptance is claimed.

The candidate combines MAIR-387 / PR #206 with MAIR-318 / PR #209 without
changing clients, contracts, dependencies or the published shared library.
The cross-feature real-page/HTTP regression preserves the edited title and
category through a pending PATCH, reordered category reads, refusal and a second
read; only the explicit confirmed retry updates the event and closes the dialog.
On 4 October 2026, 217 Node tests passed (34 targeted page/form/focus cases),
with unchanged 60% coverage gates. TypeScript, contracts and isolated one-worker
production build passed; lint retained four existing warnings and no errors.
Native desktop 1280×720 and measured mobile 390×844 verified PATCH/POST refusal
before an eight-second GET, retained fields and in-dialog feedback after that
read, both Tab boundaries, pending controls, confirmed retry and focus return.
Mobile cancel/reopen used a fresh draft. Disposable ledger: nine GET, two PATCH
and two POST, zero contract violations and relevant console warnings/errors.
No new native deletion/approval, recurrence, zoom, deployed-role/persistence or
complete accessibility certification is implied. Remote CI, integration and
exact-main/current-local checks remain separate gates; never waive a red audit.

La composition conserve les brouillons et les erreurs de MAIR-387 avec la
session de focus de MAIR-318. La recette croisée vérifie les refus avant la
lecture tardive, les champs et le retour clavier après confirmation, sur desktop
et mobile mesuré. Les données jetables et outils de recette restent hors produit.
Les API/BFF, contrats, dépendances et bibliothèque partagée sont inchangés.
Les contrôles CI réels, l'intégration puis la copie locale exacte restent requis ;
ce candidat ne signifie ni livraison main ni validation globale de l'accessibilité.
## Shared UI alignment / Alignement UI partagé — MAIR-180

This consumer pins the published `@mairie360/lib-components@0.6.10`, including
its exact download URL and SHA512 integrity. Only the shared UI entry changes
in the lockfile; all other dependencies and security policies are preserved.
Tracking: [MAIR-180](https://mairie-360.atlassian.net/browse/MAIR-180) and
[cross-frontend issue](https://github.com/mairie360/Login_Web_Service/issues/142).
Login stays standalone without header/sidebar/footer; authenticated module
shells and the existing Elearning confirmation/rating features are preserved.
No API/BFF, contract, runtime configuration, demo data or deployment approval change.

Le pin exact et l'intégrité du package publié sont alignés sur Elearning sans
le rétrograder. Les tests de release vérifient le manifeste, le lockfile et le
vrai package installé. Une validation isolée ne remplace pas la CI verte,
l'intégration des sept consommateurs et la recette de la copie locale livrée.
