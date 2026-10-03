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
