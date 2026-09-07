# Contrat web service / BFF

Ce web service consomme **BFF_Calendar**. La copie [OpenAPI](contracts/openapi.json) définit les routes et les données échangées ; les [types TypeScript](src/contracts/bff.d.ts) sont générés depuis cette copie.

## Routes implémentées

Les chemins sont relatifs au BFF. Les proxies web conservent méthode, paramètres, contenu binaire, statuts et cookies. Les chemins `/api/auth/*` restent des adaptateurs de session vers BFF User ; les pages Next.js sont distinctes des routes de données.

| Méthode | Route | Réponse / schéma |
| --- | --- | --- |
| GET | `/health` | 200 OK |
| GET | `/check_apis` | 200 CheckApiResponse |
| GET | `/calendar/bootstrap` | 200 CalendarBootstrapResponse |
| GET | `/calendar/events` | 200 Liste des événements |
| POST | `/calendar/events` | 201 UpdateCalendarEventBody |
| PATCH | `/calendar/events/{id}` | 200 CalendarEvent |
| DELETE | `/calendar/events/{id}` | 204 Événement supprimé avec succès |
| PATCH | `/calendar/events/{id}/approval` | 200 CalendarEvent |
| GET | `/calendar/assignees` | 200 Liste des personnes assignables |
| GET | `/calendar/categories` | 200 Liste des catégories |
| GET | `/calendar/services` | 200 Liste des services calendrier |

## Mise à jour et validation

Dans le BFF associé, exécuter `npm run contracts:generate`. Dans ce web service, exécuter `npm run contracts:sync`, puis `npm run contracts:check` et `npm run test:contracts`. Les dépôts peuvent être voisins ; sinon `BFF_CONTRACT_DIR` indique le répertoire `contracts` du BFF. La CI vérifie que les types correspondent au document livré, même sans checkout du dépôt voisin.

Le générateur de types est fixé à `openapi-typescript@7.10.1`. Il est exécuté via npm ; aucun jeton privé ne figure dans les contrats.
