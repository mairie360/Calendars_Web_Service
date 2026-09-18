# Contrat web service / BFF

Ce web service consomme **BFF_Calendar**. La copie [OpenAPI](contracts/openapi.json) définit les routes et les données échangées ; les [types TypeScript](src/contracts/bff.d.ts) sont générés depuis cette copie.

## Routes implémentées

Les chemins sont relatifs au BFF. Le proxy du front ne relaie que ces opérations : il conserve méthode, paramètres, statuts et réponses du BFF, authentifie avec le seul cookie HttpOnly `accessToken`, refuse les mutations intersites (403), les corps de plus de 1 Mio (413) et les types de contenu non déclarés (415). Les chemins `/api/auth/*` restent des adaptateurs de session vers BFF User ; les pages Next.js sont distinctes des routes de données.

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

## Besoins BFF_Calendar à prévoir (non implémentés)

Le front fait confiance au BFF : droits (`canEdit`, `canDelete`, `canValidate`), périmètre des personnes assignables, validation des corps et des paramètres, et messages d'erreur. Il ne revalide plus les réponses. Les points suivants sont donc à traiter côté BFF (constatés sur la branche `mair-121-add-bffs-unit-tests-with-apis`).

### Sécurité

1. **Vérifier le JWT dans le BFF.** `currentUserIdFromAuthorization` (`src/services/calendarAccessPolicy.ts`) lit `sub` sans vérifier la signature ni `exp`. La confiance repose aujourd'hui sur l'appel préalable à Calendar API ; vérifier avec `JWT_SECRET` avant toute lecture en base.
2. **Supprimer le jeton de secours** `DEFAULT_JWT_TOKEN` (`src/config/token.ts`) : une valeur renseignée authentifierait toute requête sans session.
3. **Authentifier `/calendar/categories` et `/calendar/services`**, aujourd'hui publics et sans 401 documenté.
4. **Ne plus exposer `/docs`, `/openapi.json` et `/swagger.json` en production** (le front ne les relaie plus).
5. **Protéger `/check_apis`**, qui révèle l'état de Core API et Calendar API à tout appelant.
6. **Erreurs au format `ApiError` partout** : la 404 générique et le gestionnaire d'erreurs de `src/index.ts` renvoient `{ error: '…' }`, et un JSON invalide (express.json) produit un 400 non documenté.
7. **Limites explicites** : taille de corps (`express.json({ limit })`), `Content-Type: application/json` exigé, limitation de débit par utilisateur.
8. **`Cache-Control: no-store`** sur les réponses authentifiées (posé par le front, absent en accès direct au BFF), et BFF joignable uniquement depuis le réseau interne.

### Contrat OpenAPI

9. **`requestBody.required: true`** sur `POST /calendar/events`, `PATCH /calendar/events/{id}` et `PATCH /calendar/events/{id}/approval` (un corps absent n'est pas signalé par le contrat).
10. **Séparer schémas de lecture et d'écriture** : `CalendarEvent.id` requis en lecture (le front force le type) ; retirer des corps d'écriture les champs calculés par le BFF (`canEdit`, `canDelete`, `canValidate`, `approvalStatus`, `createdById`, `assignees`), ou documenter qu'ils sont ignorés.
11. **Formats stricts** : `date`, `endDate` et `recurrence.endsOn` acceptent `YYYY-MM-DD` ou `DD-MM-YYYY` sans `pattern` ; retenir `format: date`. Documenter le format des identifiants de personnes (`user-<n>`) par un `pattern`.
12. **`additionalProperties: false`** sur les corps et statuts manquants (401 sur les référentiels, 413, 415).
13. **Retirer les schémas inutilisés** `CalendarEventParams` et `CalendarEventsQuery` (paramètres `startDate`/`endDate` qui ne correspondent pas aux vrais `from`/`to`).
14. **Préciser `PATCH /calendar/events/{id}/approval`** : l'enum accepte `pending`, que le front n'envoie jamais ; indiquer si un retour à `pending` est permis.

### Livraison

15. **Publier `openapi.json` dans `@mairie360/bff-calendar-openapi`** (0.2.1 ne contient que `index.d.ts`), comme `@mairie360/bff-user-openapi`, pour synchroniser le front depuis une version publiée plutôt que depuis un checkout. Le contrat actuel du front vient d'une branche non fusionnée.
16. **Contrat BFF User dans la CI du front** : les tests de session valident les réponses de BFF User seulement si `../../BFFs/BFF_user` est présent ; utiliser `@mairie360/bff-user-openapi`.
