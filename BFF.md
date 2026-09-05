# BFF — Calendrier

Référentiel de besoins harmonisé le 5 septembre 2026. Documentation uniquement : aucune route ni migration n'est créée par ces fichiers. Les chemins BFF sont relatifs au service indiqué, pas au préfixe des proxies Next.js ; les chemins backend conservent leurs préfixes réels.

Le calendrier appelle déjà BFF Calendar. Le bootstrap enrichit les événements via API et SQL direct ; catégories/services sont encore des constantes. Les routes cibles reprennent les chemins du client Calendar installé, sans les renommer en `/api/v1/calendar`.

Tables et routes propriétaires : [BACKEND.md](BACKEND.md).

`Existant` : déclaré dans les sources locales ; `Partiel` : route présente mais données manquantes, SQL direct ou mémoire ; `Client généré` : chemin observé dans le client installé, déploiement non vérifié ; `Proposé` : contrat cible à implémenter/valider. Pour les tables, `SQL observé` ne prouve pas qu'une migration est déployée.

## Routes communes

Les identifiants renvoyés par un domaine restent ceux de son backend, même lorsqu'un BFF les sérialise en chaîne. `phone` côté Core/DTO correspond à `users.phone_number` en SQL ; `name`/`fullName` est composé à partir du prénom et du nom, sans découpage automatique inverse. Les rôles d'affichage sont adaptés par chaque front à partir de `roles`, sans nouvelle table de rôles par module. Le profil s'édite dans **Paramètres > Profil** ; les anciennes pages `/profile` ne définissent pas un stockage distinct.

| Méthode | Service et route BFF | Route backend / source | Données nécessaires au front | État |
| --- | --- | --- | --- | --- |
| GET | BFF User `/me` (alias `/session/me`) | Core `GET /api/v1/user/me/` + `GET /api/v1/groups/` | Identité, rôles et groupes communs ; réponse actuelle `{user, groups, roles}` ; enrichir avec identifiant, avatar, service, poste et dernière connexion | Partiel |
| POST | BFF User `/auth/logout` | Actuel : suppression du cookie ; cible : Core `POST /api/v1/sessions/revoke` avec le refresh token de la session courante | Déconnexion ; révocation serveur à brancher, pas une suppression de toutes les sessions | Partiel |
| GET | BFF User `/notifications` | Core `GET /api/v1/user/me/notifications/` | Notifications du bandeau et compteur non lu ; ne pas utiliser la constante de démonstration 3 | Proposé |
| PATCH | BFF User `/notifications/{notificationId}/read` | Core `PATCH /api/v1/user/me/notifications/{notificationId}/read` | Marquage lu et compteur actualisé pour l'utilisateur connecté | Proposé |

## Routes du module

| Méthode | Service et route BFF | Route backend / source | Données nécessaires au front | État |
| --- | --- | --- | --- | --- |
| GET | BFF Calendar `/calendar/bootstrap` | Calendar `GET /v1/calendar` + `GET /v1/events/{eventId}/` ; Core annuaire/services ; metadata et droits actuellement en SQL | Période from/to, événements complets, assignees, categories, services, currentUser, assigneeScope | Partiel |
| GET | BFF Calendar `/calendar/events` | Calendar `GET /v1/calendar` | Période from/to, titre, dates/heures, catégorie, description, lieu, service, assignés, récurrence, validation et droits | Partiel : route de repli moins complète que bootstrap |
| GET | BFF Calendar `/calendar/assignees` | Actuel : SQL utilisateurs/rôles/group_members ; cible : Core `GET /api/v1/users/directory/` | Personnes assignables id, nom, e-mail, avatar, rôles/groupes ; scope all/groups/self | Partiel |
| GET | BFF Calendar `/calendar/categories` | Actuel : constante ; cible : Calendar `GET /v1/categories/` | Code/label meeting, activity, ceremony, other | Partiel |
| GET | BFF Calendar `/calendar/services` | Actuel : constante ; cible : Core `GET /api/v1/services/` | Même serviceId/code/nom que Profil et Administration | Partiel ; ne pas créer un annuaire Calendar divergent |
| POST | BFF Calendar `/calendar/events` | Calendar `POST /v1/events/` + `POST /v1/events/{eventId}/members/` ; metadata SQL | Titre, description, début/fin, catégorie, service, lieu, assignés, récurrence ; auteur issu de la session | Partiel |
| PATCH | BFF Calendar `/calendar/events/{eventId}` | Calendar `PATCH /v1/events/{eventId}/` + membres/metadata actuellement SQL | Modification complète ; conserver les mêmes champs à la relecture | Partiel ; visibleToRoles non pris en charge actuellement |
| DELETE | BFF Calendar `/calendar/events/{eventId}` | Calendar `DELETE /v1/events/{eventId}/` | Supprimer un événement autorisé et ses associations | Existant côté BFF ; API via client généré |
| PATCH | BFF Calendar `/calendar/events/{eventId}/approval` | Actuel : SQL event_members ; cible : Calendar `PATCH /v1/events/{eventId}/approval` | approvalStatus pending/approved/rejected, droits de validation | Partiel |

## Points d'alignement

| Sujet | Contrat / écart |
| --- | --- |
| Calendrier et tableau de bord | Les événements affichés sur le tableau de bord viennent de `GET /v1/calendar` et des mêmes events/metadata ; aucune table dashboard_events. |
| Référentiels | `GET /v1/services/` et `GET /v1/assignees/` autrefois suggérés sont remplacés dans la cible par Core `/api/v1/services/` et `/api/v1/users/directory/`. Le contrat BFF `/calendar/services` reste stable. |

## Sources

| Périmètre | Référence |
| --- | --- |
| Front inspecté | [src/app/calendar/api.ts](src/app/calendar/api.ts) |
| Identité / sessions / groupes | [Core_API 9904624](https://github.com/mairie360/Core_API/tree/99046240dd9742217d2a2c3d282721b785cacca0/src) ; [BFF_user b7c3477](https://github.com/mairie360/BFF_user/tree/b7c3477f858073aa846ba0129cbb29152528e6d2/src) |
| BFF métier inspecté | [BFF_Calendar d0fcce4](https://github.com/mairie360/BFF_Calendar/tree/d0fcce44f9153c95623198aa335484459f8f0387/src) |
| Client API installé | `@mairie360/calendar-api-openapi@0.0.0-dev-d6d05a0` ; chemin et DTO vérifiés localement, pas appel réseau de validation |
