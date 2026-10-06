# Calendars_Web_Service — Présentation du module

## Navigation des modules actifs

Les menus ordinateur et mobile ne proposent plus les modules archivés E-mails
et Fichiers, comme dans la version locale. L'ordre des autres modules et la
visibilité réservée aux administrateurs restent inchangés ; Paramètres reste
accessible. Le calendrier utilise désormais l'AppShell partagé avec la session
utilisateur fournie par le BFF. Son contenu défile sans déplacer l'en-tête ni
le pied de page. Les pièces jointes et documents métier des modules actifs ne
sont pas supprimés.

Les styles limités à Calendars conservent les cibles de navigation de 44px et
l'ombre de séparation de la référence. La sidebar mobile reste sous le bouton
Fermer publié ; la fermeture clavier et la gestion du focus restent assurées
par le composant partagé. Aucune identité, notification ou préférence du
prototype n'est recopiée.

## Un seul espace compte

Le profil est désormais ouvert dans **Paramètres (Settings)**. Les anciens liens
`/profile` et leurs sous-chemins redirigent vers le front Settings configuré.
La sidebar conserve Paramètres sans doublon Profil. Si Settings n'est pas configuré
correctement, une réponse 503 explicite et sans cache remplace la redirection ; aucune donnée
personnelle de démonstration ni fausse sauvegarde n'est affichée.

## Présentation du prototype (MAIR-383)

Les styles propres à Calendars retrouvent la typographie système de 17px,
les marges bureau de 28px, les marges mobile de 20px/14px, l'espacement intérieur
de la liste à venir et les ombres du
prototype conservé. Sous 1700px, une longue liste à venir est plafonnée par
`clamp(320px, 100dvh - 440px, 560px)` ; les listes courtes et vides restent
compactes. À partir de 1700px, la colonne de 310px suit la hauteur de la grille,
avec défilement dans la liste à venir uniquement. Région nommée, focus,
touches Home/End et actions des événements restent inchangés.
Les attributs de présentation sombre/compacité sont respectés s'ils sont fournis ;
cela n'ajoute pas de préférences persistées indisponibles et ne modifie ni données
métier, contrats, API/BFF, bibliothèque partagée ni autre front.

## Date d’ouverture et minuit (MAIR-407, volet date uniquement)

Chaque page montée initialise le calendrier avec la date locale actuelle du
navigateur, pas une date capturée au démarrage du module/serveur. Le rendu serveur
et le début d’hydratation affichent un chargement sans date jusqu’à résolution
du jour courant ou d’un lien valide. Après minuit, une nouvelle création actualise
le jour implicite ; une sélection volontaire, un lien daté ou un créneau garde
sa date/heure. La période consultée n’est jamais réinitialisée de force à minuit.
Le marqueur du jour et les appels conformes au contrat existant sont préservés.
Les flèches gardent cohérents titre, jour sélectionné, grille, statistiques,
période chargée et date de création. Changer de vue mois/semaine/jour ne rétablit
pas une ancienne sélection ; les flèches successives conservent leurs mises à
jour fonctionnelles. Une période consultée volontairement n’est pas remplacée
par le jour courant lors d’une création après minuit.
Cela ne résout pas les autres constats de MAIR-407 concernant fuseau, proxy,
logout ou infrastructure et ne modifie aucun API/BFF ni environnement.

## Enregistrement refusé des événements (MAIR-387)

Les brouillons de création/modification restent ouverts jusqu’à confirmation
du BFF existant. Les contrôles sont désactivés pendant l’enregistrement et une
garde synchrone interdit les mutations doubles. État et erreurs sont annoncés
dans le formulaire ; les champs refusés restent disponibles pour correction
et nouvelle tentative. Une annulation explicite abandonne le brouillon ; la
réouverture reprend les données officielles. Validation chronologique,
récurrences et permissions publiées restent inchangées. Ce correctif résout
un défaut hérité du prototype sans changer bibliothèque, API/BFF ni données.

Les erreurs de lecture et les refus d’écriture gardent des retours distincts.
Un bootstrap tardif ou relancé ne masque ni le refus d’enregistrement ni son
message dans le formulaire ; ouvrir un formulaire n’efface pas une lecture
échouée. **Réessayer** recharge uniquement les données, sans rejouer d’écriture.
Les deux erreurs restent affichées si elles coexistent ; seule la lecture
réussie correspondante, une nouvelle tentative d’écriture ou un nouveau
formulaire explicite remet à zéro son propre retour. Les gardes de brouillon
et de dernière lecture restent préservées.

Les états de suppression et de validation/refus sont également annoncés **dans
la fenêtre de détail**, via le titre public du composant partagé. Les contrôles
restent verrouillés pendant l’écriture ; un refus conserve l’événement officiel
et les actions autorisées pour une nouvelle tentative explicite. Une lecture
réussie n’efface pas ce refus. Seule la réponse de mutation existante confirme
la suppression ou le nouveau statut. Composant partagé, droits et détails sont
inchangés.

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

Chaque dialogue conserve son brouillon jusqu'à confirmation
de l'opération existante ou annulation. Une lecture concurrente des catégories
ne réinitialise pas les champs ni le message de refus. Les commandes restent
désactivées pendant l'écriture ; après refus, seule une nouvelle tentative
explicite soumet à nouveau. La correction dédiée au focus des dialogues
(MAIR-318/#208) est reportée avec le RGAA et n'est pas incluse dans cette
composition fonctionnelle seule ; l'ancienne recette clavier ne la certifie pas.
Ces comportements frontend ne certifient
ni les droits/persistances déployés ni l'accessibilité globale, à vérifier séparément.

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
