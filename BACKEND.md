# Backend — Calendrier

Correspondance front/BFF : [BFF.md](BFF.md). Référentiel de besoins harmonisé le 5 septembre 2026. Documentation uniquement : aucune route ni migration n'est créée par ces fichiers. Les chemins BFF sont relatifs au service indiqué, pas au préfixe des proxies Next.js ; les chemins backend conservent leurs préfixes réels.

`Existant` : déclaré dans les sources locales ; `Partiel` : route présente mais données manquantes, SQL direct ou mémoire ; `Client généré` : chemin observé dans le client installé, déploiement non vérifié ; `Proposé` : contrat cible à implémenter/valider. Pour les tables, `SQL observé` ne prouve pas qu'une migration est déployée.

Les tables sont des sources ou des besoins cibles, pas un script SQL. Les références interservices (`user_id`, `file_id`, etc.) sont logiques : elles n'imposent pas de clé étrangère entre bases distinctes. Les BFF doivent à terme passer par les API propriétaires ; les accès SQL directs et replis mémoire actuels sont signalés. Les permissions restent contrôlées par le serveur.

## Tables communes

| Table / source propriétaire | Clés et données nécessaires | État |
| --- | --- | --- |
| Core `users` | `id` ; `first_name`, `last_name`, `email`, `phone_number`, `status`, `is_archived`, `first_connect`. `password` reste exclusivement côté serveur | SQL observé |
| Core `roles`, `user_roles` | `roles.id`, `roles.name` ; association `user_roles(user_id, role_id)` vers `users.id` et `roles.id` | SQL observé |
| Core `groups`, `group_users` | `groups.id`, `owner_id`, `name`, `description` ; association `group_users(group_id, user_id)` ; nomenclature cible commune basée sur Core | SQL observé dans Core ; divergence `group_members` dans les BFF User/Calendar/Project à résoudre, pas une seconde table cible |
| Core `sessions` | `id`, `user_id`, `created_at`, `expires_at`, `device_info`, `ip_address`, `revoked_at` ; `token_hash` interne, jamais exposé. Dernière connexion dérivée des sessions, pas de la date courante | SQL observé ; vue `v_sessions` utilisée par Core |
| Core `user_profiles` | `user_id` unique vers `users.id` ; `avatar_file_id` vers Files `files.id`, `service_id` vers `services.id`, `position`, `biography` ; `address`, `city` seulement pour compatibilité des anciens profils | Proposé ; ne pas dupliquer identité, mot de passe ou rôles |
| Core `services` | `id`, `code` unique, `name`, `active` ; même annuaire pour Paramètres, Administration, Calendrier, contacts et membres de projets | Proposé ; distinct des groupes d'habilitation |
| Core `notifications` | `id`, `user_id`, `type`, `title`, `body`, `resource_type`, `resource_id`, `created_at`, `read_at` ; source du compteur commun | Proposé ; distinct des préférences `user_notification_settings` |

## Tables du module

| Table / source propriétaire | Clés et données nécessaires | État |
| --- | --- | --- |
| Calendar `events` | `id`, `name`, `description`, `start_date`, `end_date`, `created_by`, `visibility` ; titre/dates du DTO issus de ces champs | SQL observé dans BFF |
| Calendar `event_members` | `event_id`, `user_id`, `validation_status` ; références à events et Core users | SQL observé ; états pending/validated/refused mappés vers pending/approved/rejected |
| Calendar `calendar_event_metadata` | `event_id` unique, `category`, `service`, `location`, `recurrence`, `created_at`, `updated_at` ; cible : `service_id` vers Core services | CREATE TABLE observé dans BFF ; propriété à transférer au backend, service actuellement texte |
| Calendar `calendar_categories` | `id`, `code` unique, `name`, `active` ; codes meeting/activity/ceremony/other | Proposé ; remplace les constantes, sans ajouter des catégories inventées |
| Calendar `event_role_visibility` | Association `(event_id, role_id)` vers événements et rôles Core, seulement pour le besoin visibleToRoles | Proposé ; champ non implémenté dans le contrat actuel |

## Routes backend communes

| Méthode | Service et route backend | Tables / source | État |
| --- | --- | --- | --- |
| GET | Core `/api/v1/user/me/` | `users`, `roles`, `user_roles` ; cible : `user_profiles`, `services`, `sessions` | Existant ; enrichissement proposé (notamment `id`, absent de GetMeResponseView local) |
| PATCH | Core `/api/v1/user/me/` | `users` ; cible : `user_profiles` | Existant pour prénom, nom, e-mail, téléphone ; extension proposée pour le profil |
| GET | Core `/api/v1/groups/` | `groups`, `group_users` | Existant ; groupes de l'appelant |
| GET | Core `/api/v1/sessions/` | `sessions`, vue `v_sessions` | Existant ; sessions de l'appelant |
| GET | Core `/api/v1/sessions/history` | `sessions`, vue `v_sessions` | Existant ; historique de l'appelant |
| POST | Core `/api/v1/sessions/refresh` | `sessions` ; entrée `refresh_token` | Existant |
| POST | Core `/api/v1/sessions/revoke` | `sessions` ; entrée `refresh_token` | Existant ; ce n'est pas une révocation par `sessionId` |
| DELETE | Core `/api/v1/sessions/{sessionId}` | `sessions` ; session appartenant à l'appelant | Proposé pour la déconnexion d'un autre appareil, sans exposer son refresh token |
| GET | Core `/api/v1/services/` | `services` | Proposé ; annuaire unique |
| GET | Core `/api/v1/users/directory/` | `users`, `user_profiles`, `services`, `roles`, `user_roles`, `groups`, `group_users` | Proposé ; annuaire limité au périmètre autorisé |
| GET | Core `/api/v1/user/me/notifications/` | `notifications` ; filtre utilisateur connecté | Proposé |
| PATCH | Core `/api/v1/user/me/notifications/{notificationId}/read` | `notifications.read_at` ; filtre utilisateur connecté | Proposé |

## Routes backend du module

| Méthode | Service et route backend | Tables / source | État |
| --- | --- | --- | --- |
| GET | Calendar `/v1/calendar` | `events`, `event_members`, `calendar_event_metadata` ; from/to, visibilité selon appelant | Client généré ; enrichissement proposé |
| POST | Calendar `/v1/events/` | `events`, `calendar_event_metadata`, `event_members` ; cible event_role_visibility | Client généré ; metadata/droits à intégrer au backend |
| GET, PATCH, DELETE | Calendar `/v1/events/{eventId}/` | `events`, `event_members`, `calendar_event_metadata` ; cible event_role_visibility | Client généré ; PATCH/détail incomplets actuellement |
| GET, POST | Calendar `/v1/events/{eventId}/members/` | `event_members`, identités Core | Client généré |
| DELETE | Calendar `/v1/events/{eventId}/members/{memberId}/` | `event_members` | Client généré |
| GET | Calendar `/v1/categories/` | `calendar_categories` | Proposé |
| PATCH | Calendar `/v1/events/{eventId}/approval` | `event_members.validation_status`, auteur/rôles/groupes pour autorisation | Proposé ; remplace SQL direct |
| GET | Calendar `/v1/events/{eventId}/permissions` | `events`, `event_members`, droits Core ; cible event_role_visibility | Proposé ; canValidate/canEdit/canDelete |

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
