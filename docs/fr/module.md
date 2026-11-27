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
- Les textes d’un événement (titre, description, lieu) refusent `<` et `>` avant la requête, avec un message en français par champ (MAIR-514) ; un refus du BFF détaillant les champs est listé champ par champ.

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


## Direction visuelle commune — MAIR-547

DA claire option 1 : tokens et police communs, navigation accessible et contenu métier conservé. Voir la [recette visuelle](../qa/design-qa.md) pour les preuves, vérifications et limites RGAA.

## Écran V2 (epic MAIR-820)

Le calendrier suit la maquette V2 validée ([Figma, parcours F1–F9](https://www.figma.com/design/TaP7bHBB2E4uyTEJ5wg6Df/Mairie360-%E2%80%93-Calendars_Web_Service?node-id=19-794)) sur `@mairie360/lib-components` 2.

- **Socle (MAIR-879).** Lib 2.1.0 : bandeau de navigation vert d'eau repliable, barre du haut et pied de page
  teintés fournis par le cadre de la lib (le calendrier ne le redessine plus), thème toujours clair. Les
  retours d'action s'affichent dans les toasts de la lib (`ToastProvider`, en bas à droite) : un succès
  disparaît après 5 s, une écriture refusée reste jusqu'à sa fermeture.
- **États chargement et indisponible (MAIR-911).** Le premier chargement et « Réessayer »
  affichent des squelettes dans les trois panneaux (calendrier, À venir, statistiques) ; un changement de
  période garde la grille. Si le calendrier ne peut pas être lu, la barre d'outils reste et les panneaux
  affichent « Calendrier indisponible. » (avec l'erreur et « Réessayer »), une alerte « Service
  indisponible » avec « Réessayer » et « Statistiques indisponibles. ». L'ancienne barre d'état disparaît :
  les erreurs d'écriture restent dans les fenêtres et les toasts.
- **En-tête de page (MAIR-884).** Sous-titre « Planifiez et organisez les activités de la mairie » ; actions
  « Actualiser » (relit la période affichée, désactivé tant qu'une lecture court) puis « Créer » (ouvre
  « Nouvel événement », visible dès que les données sont prêtes).
- **Panneau calendrier (MAIR-893).** Le calendrier est dans un `Panel` de la lib dont le titre est la
  période affichée (« Novembre 2026 », « 9 – 15 novembre 2026 », « Jeudi 12 novembre 2026 »). Barre
  d'outils : Précédent / Suivant de la lib (un mois, une semaine ou un jour), « Aujourd’hui » (retour à la
  période du jour) et le choix de vue en `SegmentedControl` de la lib (Mois / Semaine / Jour, flèches du
  clavier). L'URL suit toujours `view` et `date`.
- **Rendez-vous qui se chevauchent (MAIR-1123).** En vue Semaine, chaque groupe de rendez-vous qui se
  chevauchent n'en montre qu'un, lisible et sur toute la largeur du jour (titre sur deux lignes au plus, heure de
  début), avec un bouton « +N » (libellé « N autres rendez-vous le …, ouvrir la vue Jour ») qui ouvre la vue Jour
  à cette date ; un rendez-vous seul garde toute la largeur. La vue Jour place les rendez-vous qui se
  chevauchent côte à côte.
- **Grille du mois (MAIR-905).** Un clic sur un jour (ou Entrée / Espace) le garde sélectionné et ouvre
  « Nouvel événement » à cette date, 09:00 – 10:00 ; un clic sur une pastille ouvre toujours la fiche. Les
  cellules suivent la maquette : Normal, Sélectionné, Aujourd'hui (bordure accent, numéro sur pastille
  accent) et Hors mois (jours des mois voisins sur `surface-raised`, non interactifs). Les pastilles prennent
  le ton de leur catégorie. Un jour garde une hauteur fixe avec son numéro en haut : un seul événement
  affiche son titre puis son heure de début, deux ou trois événements une ligne chacun, et au-delà de trois
  les deux premiers et « + N » (« Plus d’événements »), qui ouvre la vue Jour.
- **Vue Semaine.** Lignes horaires continues, colonne du jour en évidence, trait rouge à l'heure actuelle
  (mis à jour chaque minute), et chaque événement affiche sa plage horaire (« 14:00 – 15:30 »). Les
  événements qui se chevauchent gardent un seul événement lisible et « +N » vers la vue Jour, où ils sont
  côte à côte.
- **Couleurs et légende (MAIR-1121).** Aucun événement gris ou neutre : réunion marine (`secondary` /
  `on-secondary`), animation succès, cérémonie avertissement, autre violet (`purple-surface` / `purple-text`),
  dans les trois vues et sur les `StatusPill` (tons `secondary-strong` et `purple` de la lib 2.3). La légende
  sous la grille suit la maquette : « Réunions : » et les trois aspects d'une réunion (ci-dessous) ; les
  catégories sont nommées par les statistiques et les badges de « À venir ».
- **Ma participation (MAIR-1122).** Une réunion suit ma réponse à l'invitation, dans les trois vues : je participe
  = marine plein ; en attente = fond surface et bordure marine en pointillés ; déclinée = fond surface, bordure
  marine fine et titre barré (l'état est aussi lu par les lecteurs d'écran). La fiche d'une réunion où je suis
  invité affiche le bloc « Ma participation » (état, « Je décline » / « Je participe ») ; la réponse donne le
  toast « Réponse envoyée » et la pastille change aussitôt, un refus donne un toast d'erreur et garde l'état
  précédent. La légende montre les trois aspects.
- **Colonne de droite (MAIR-918).** « À venir » d'abord : les trois prochaines occurrences à partir de
  maintenant (récurrences comprises, un événement du jour reste jusqu'à son heure de fin), chaque ligne avec
  titre, pastille de catégorie, jour (« Aujourd’hui », « Demain », « ven. 20 nov. ») et horaires, et
  participants ; une ligne ouvre la fiche. Puis « Statistiques » : « N événements en <mois> » pour le mois
  affiché et une carte par catégorie de l'API (Réunions, Animations, Cérémonies, Autres), recalculées au
  changement de mois.
- **Fiche de l'événement (MAIR-929).** La fenêtre a pour titre l'événement ; dessous, la pastille de
  catégorie (et « En attente » / « Refusé » le cas échéant, « Privé » pour un événement privé) et la
  description ; puis cinq lignes avec icône : Date avec la récurrence (« Jeudi 12 novembre 2026 · chaque
  mois »), Horaire, Lieu, Participants, Visibilité.
  Le lien vers la formation et les actions Valider / Refuser des événements en attente suivent. Pied :
  « Supprimer » à gauche, « Fermer » et « Modifier » à droite, chacun seulement si le droit est accordé.
  L'enregistrement et les refus ne s'affichent plus dans le titre : la fenêtre est occupée pendant
  l'enregistrement et le résultat part dans les toasts.
- **Suppression (MAIR-931).** « Supprimer » ouvre une confirmation danger (« Supprimer cet événement ? »,
  « « <titre> » sera retiré du calendrier[, avec toutes ses répétitions]. Cette action est définitive. »).
  « Annuler », ✕ ou Échap ramènent à la fiche, focus sur « Supprimer » ; « Confirmer la suppression » est en
  chargement pendant l'appel. Le succès ferme toutes les fenêtres avec le toast « Événement supprimé » ; un
  refus ramène à la fiche avec le toast « Suppression impossible — <raison> ».
- **Formulaire d'événement (MAIR-926).** « Nouvel événement » et « Modifier l’événement » n'ont plus de
  sous-titre et s'enregistrent avec « Enregistrer », en chargement pendant l'appel (pas de double envoi). Champs :
  Titre*, Description, Date de début* + Date de fin, Heure de début + Heure de fin, Catégorie + Récurrence
  (détails de récurrence en dessous), Lieu, Participants (« Les participants reçoivent l’événement dans leur
  calendrier. »), Visibilité. Les erreurs s'affichent sous leur champ (« Donnez un titre à l’événement. », « La date de fin
  doit suivre la date de début. », « L’heure de fin doit suivre l’heure de début. ») et la première prend le
  focus. Un refus affiche « Impossible d’enregistrer » en haut de la fenêtre, garde la saisie et l'erreur part en
  toast ; le succès ferme la fenêtre, amène le calendrier à la date de l'événement et affiche « Événement créé » /
  « Événement modifié ».
- **Visibilité.** Le formulaire se termine par « Visibilité », deux cartes radio (`RadioGroup` de la lib, variante
  `card`) : « Public » (« Visible par tous les agents », valeur par défaut d'un nouvel événement) et « Privé »
  (« Visible seulement par vous et les invités »). La modification part de la valeur de l'événement et chaque
  enregistrement envoie `visibility` ; un événement lu sans ce champ s'affiche public et sa mise à jour l'omet,
  BFF_Calendar garde alors la valeur enregistrée. La fiche affiche « Public · visible par tous les agents » ou
  « Privé · visible seulement par vous et les invités » (icône globe ou cadenas), et un événement privé porte un
  petit cadenas devant son titre dans les vues Mois, Semaine et Jour et dans « À venir », lu « (privé) » par les
  lecteurs d'écran. Qui peut lire un événement privé (son créateur et ses participants) est une décision du BFF :
  les autres reçoivent un 403.
- **Recherche (MAIR-935).** « Rechercher » dans le bandeau haut filtre à chaque frappe, sans tenir
  compte de la casse ni des accents, sur le titre et le lieu : dans les vues Mois, Semaine et Jour, les
  événements qui ne correspondent pas passent à 30 % d'opacité et restent cliquables (aucun résultat : tout est
  estompé, sans message dédié) ; l'effacement (✕, ou Échap une fois la liste de résultats fermée) réaffiche
  tout. La recherche est conservée au changement de période et de vue.
- **Recherche globale (MAIR-1230).** Le même champ cherche aussi dans tous les modules (agents, projets et
  tâches, événements, conversations et messages, formations) via `GET /search` sur la même origine, relayé à
  BFF_Calendar : dès 2 caractères et après 250 ms de pause, une liste sous le champ affiche les résultats groupés
  par module, les modules qui n'ont pas répondu, et en premier « Rechercher « … » dans Calendrier », qui garde le
  filtre du calendrier ci-dessus. Un résultat ouvre son module ; un événement ouvre cette page sur
  `?date=<YYYY-MM-DD>&event=<id>` : la période de ce jour, le jour sélectionné et la fiche de l'événement ouverte
  (le même lien que celui du tableau de bord). Un événement inconnu ou non visible n'affiche que le jour, une date
  invalide le mois courant.
- **Filtres.** Sous la barre d'outils, « Du » / « Au » (chacun facultatif), « Type » (plusieurs catégories, avec
  leur pastille de couleur) et « Service » (« Tous les services » en tête) masquent les événements qui ne
  correspondent pas, dans toutes les vues ; la recherche continue d'estomper parmi ceux qui restent. Un événement
  sans service n'apparaît que si aucun service n'est choisi. Un événement récurrent ne garde que ses occurrences
  qui chevauchent la plage de dates ; une plage hors de la période affichée y amène le calendrier (la période est
  lue au BFF comme pour toute navigation). Les filtres actifs s'affichent en étiquettes supprimables avec
  « Effacer les filtres » et « N événements sur M dans la période » ; quand il n'en reste aucun, la grille laisse
  place à « Aucun événement ne correspond aux filtres ». « À venir » suit les filtres, pas les statistiques. Les
  filtres sont dans l'URL (`from`, `to`, `type`, `service`) : un rechargement ou un lien partagé les conserve.
  Sur petit écran, ils passent dans un tiroir « Filtres ». Le filtrage est fait par le front seul.
