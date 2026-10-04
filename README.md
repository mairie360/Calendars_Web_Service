# Calendars_Web_Service

Display and operate the municipal calendar in the browser using events, assignments and approvals supplied by BFF Calendar.

Afficher et piloter le calendrier municipal dans le navigateur, avec événements, affectations et validations fournis par BFF Calendar.

## Documentation

| Language / Langue | Module | Technical / Technique |
| --- | --- | --- |
| English | [Module overview](docs/en/module.md) | [Technical documentation](docs/en/technical.md) |
| Français | [Présentation du module](docs/fr/module.md) | [Documentation technique](docs/fr/technical.md) |

The guides describe the implemented module, its current limitations, local setup, routes, data, verification and CI/CD.

Les guides décrivent le module implémenté, ses limites actuelles, le démarrage local, les routes, les données, les vérifications et la CI/CD.

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

## Event modal keyboard focus / Focus clavier des événements (MAIR-318)

[Issue #208](https://github.com/mairie360/Calendars_Web_Service/issues/208) follows
the Calendars-only portion of the broader MAIR-318 accessibility task. The
consumer keeps one focus session around the published detail/create/edit modal:
opening focuses an available control, Tab/Shift+Tab stay inside, and a changed
or fully disabled dialog receives focus while a write is pending. Existing
Escape callbacks and saving guards remain in charge of closing. Closing returns
to the opener, or the selected calendar view if a confirmed deletion removed it;
an intentional external navigation is not overridden. Observers/listeners and
temporary dialog attributes are cleaned up on close. No shared library,
dependency, API/BFF, contract, authentication or deployment change is required.

Le front conserve une seule session de focus pour les détails/création/édition :
focus à l’ouverture, Tab/Maj+Tab contenus, repli sur le dialogue pendant une
écriture, retour au déclencheur à la fermeture ou à la vue sélectionnée après
suppression confirmée. Les callbacks Échap et gardes d’enregistrement existants
sont conservés ; observateur, listeners et attributs temporaires sont nettoyés.
Aucune modification des API/BFF, contrats, bibliothèque ou environnements.

`node --test tests/calendar-modal-focus.test.cjs` covers the controller with DOM
doubles; `tests/calendar-form-html.test.cjs` covers the existing form guards.
Native browser verification remains necessary for React refs, real focus order,
desktop/mobile, validation, pending/refused/confirmed writes and removed openers.
This scoped correction is not a claim of complete RGAA/axe conformance for all
routes, roles, zoom settings or assistive technologies.
## Drafts during category reads / Brouillons pendant les lectures de catégories

Calendar draft recovery (MAIR-387 / issue #196) also protects fields when real
category options first arrive or are reordered. The frontend keeps initialization
owned by each form opening; cancel/reopen gets fresh values and the already-loaded
default. A presentation-only empty choice keeps incoming options from resetting
the shared form; it is not business data. The shared library and BFF are unchanged.

La reprise des brouillons Calendars conserve aussi les saisies lorsqu’une lecture
apporte ou réordonne les catégories réelles. Chaque ouverture initialise son
propre brouillon ; annuler puis rouvrir reprend les nouveaux defaults. Le choix
vide de présentation ne remplace aucune donnée métier ni ne modifie le contrat.
