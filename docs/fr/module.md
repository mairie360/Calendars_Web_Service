# Calendars_Web_Service — Présentation du module

## Un seul espace compte

Le profil est désormais ouvert dans **Paramètres (Settings)**. Les anciens liens
`/profile` et leurs sous-chemins redirigent vers le front Settings configuré.
La sidebar conserve Paramètres sans doublon Profil. Si Settings n'est pas configuré
correctement, une indisponibilité explicite remplace la redirection ; aucune donnée
personnelle de démonstration ni fausse sauvegarde n'est affichée.

[Documentation technique](technical.md) · [English](../en/module.md) · [README](../../README.md)

Afficher et piloter le calendrier municipal dans le navigateur, avec événements, affectations et validations fournis par BFF Calendar.

## Public et utilité

Les agents organisant leur calendrier et les responsables validant les événements.

Domaine fonctionnel: Calendrier.

## Fonctions disponibles

- Consultation du calendrier et chargement d’une période.
- Ouverture de la date et des détails d’un événement depuis le Tableau de bord.
- Création, modification et suppression des événements selon les permissions.
- Sélection des personnes, catégories et services; affichage de la validation et de la récurrence.

## Parcours type

1. Charger le calendrier sur une période avec `/calendar/bootstrap`, dont le mois indiqué par un lien valide.
2. Créer ou modifier un événement et choisir les personnes autorisées.
3. Consulter l’état de validation et recharger la période après une mutation.

## Place dans Mairie360

Dépôts associés: [BFF_Calendar](https://github.com/mairie360/BFF_Calendar).

Ce dépôt contient l’interface navigateur et ses adaptateurs Next.js. Le BFF associé fournit les données métier et coordonne leurs sources.

## Données et état actuel

Calendar API fournit les opérations sur les événements. `calendarAccessRepository.ts` accède directement à PostgreSQL pour l’annuaire, les affectations, certaines modifications et les métadonnées. La table `calendar_event_metadata`, créée par le BFF si nécessaire, référence `events.id` et stocke catégorie, service, lieu et récurrence. Les catégories et services comprennent des référentiels définis dans les helpers.

## Périmètre et limites

Le fonctionnement dépend d’identifiants utilisateurs cohérents entre Core et Calendar et du schéma SQL attendu. Le stack Docker utilise la base partagée du stack BFF User; démarrer celui-ci en premier. Les métadonnées et accès SQL restent une responsabilité actuelle du BFF.

## Pour développer ou exploiter ce module

Le [guide technique](technical.md) détaille architecture, configuration, routes, session, persistance, tests et CI/CD. Il décrit les sources de vérité et les étapes de synchronisation des contrats avec les dépôts associés.
