# Calendars BFF - Donnees necessaires

Ce document decrit les donnees dont le module calendrier aura besoin lorsqu'il sera connecte a un futur BFF.

## Etat actuel du module

Le module est aujourd'hui alimente cote front uniquement :

- les evenements sont gardes en memoire dans `src/app/calendar/use-calendar-page.ts` ;
- les personnes assignables et les categories sont mockees dans `src/app/calendar/constants.ts` ;
- les statistiques sont calculees dans `src/app/calendar/stats.ts` a partir de la liste des evenements ;
- le package `@mairie360/bff-calendar-openapi` est installe, mais sa version actuelle ne decrit que `/health` et `/check_apis`.

Le futur BFF devra donc fournir les donnees metier ci-dessous et exposer les operations de lecture/ecriture des evenements.

## Evenement calendrier

Un evenement est l'objet principal consomme par `MonthGrid`, `WeekGrid`, `DaySchedule`, `CalendarSidebar`, `CreateEventModal` et `EventDetailsModal`.

```ts
type CalendarEvent = {
  id: string | number;
  title: string;
  date: string;
  endDate?: string;
  category?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  assigneeIds?: Array<string | number>;
  assignees?: CalendarAssignee[];
  recurrence?: CalendarRecurrence;
};
```

| Champ | Obligatoire | Description |
| --- | --- | --- |
| `id` | oui en lecture | Identifiant stable de l'evenement, utilise pour la modification. |
| `title` | oui | Titre affiche dans les grilles et les modales. Le front accepte techniquement un `ReactNode`, mais le BFF doit envoyer une chaine. |
| `date` | oui | Date de debut de l'evenement. |
| `endDate` | non | Date de fin pour les evenements sur plusieurs jours. Vide ou absent pour un evenement d'une seule journee. |
| `category` | non | Valeur de categorie : `meeting`, `activity`, `ceremony` ou `other` aujourd'hui. |
| `startTime` | non | Heure de debut au format `HH:mm`. Necessaire pour les vues semaine/jour. |
| `endTime` | non | Heure de fin au format `HH:mm`. |
| `location` | non | Lieu affiche dans les details. |
| `description` | non | Description affichee dans les details. |
| `assigneeIds` | non | Liste des identifiants des personnes assignees. |
| `assignees` | non | Version enrichie des personnes assignees. Peut etre renvoyee par le BFF ou reconstruite cote front depuis le referentiel des personnes. |
| `recurrence` | non | Regle de recurrence. |

Le champ `colorClassName` existe cote front pour styliser les badges, mais il ne doit pas etre gere par le BFF. Il est derive de `category`.

## Personne assignable

Les personnes alimentent les selects d'assignation dans les modales.

```ts
type CalendarAssignee = {
  id: string | number;
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
};
```

| Champ | Obligatoire | Description |
| --- | --- | --- |
| `id` | oui | Identifiant utilise dans `assigneeIds`. |
| `name` | oui | Nom affiche dans les listes. |
| `email` | non | Email affiche en complement. |
| `role` | non | Fonction ou role metier affiche en complement. |
| `avatarUrl` | non | Image de profil si disponible. |

## Categorie

Les categories alimentent le select de type d'evenement.

```ts
type CalendarCategory = {
  label: string;
  value: string;
};
```

Categories actuellement attendues :

| `value` | `label` |
| --- | --- |
| `meeting` | Reunion |
| `activity` | Animation |
| `ceremony` | Ceremonie |
| `other` | Autre |

Le BFF peut exposer ce referentiel pour eviter de le garder en dur dans le front.

## Recurrence

```ts
type CalendarRecurrence = {
  frequency: "none" | "daily" | "weekly" | "monthly";
  interval?: number;
  daysOfWeek?: number[];
  endsOn?: string;
};
```

Regles attendues :

- `frequency` vaut `none`, `daily`, `weekly` ou `monthly` ;
- `interval` vaut `1` par defaut et doit etre superieur ou egal a `1` ;
- `daysOfWeek` est utilise pour les repetitions hebdomadaires ;
- les jours suivent l'index JavaScript : `0` dimanche, `1` lundi, `2` mardi, `3` mercredi, `4` jeudi, `5` vendredi, `6` samedi ;
- `endsOn` est une date de fin inclusive ;
- si `endDate` est present sur l'evenement, la recurrence conserve la duree entre `date` et `endDate`.

## Formats de date et d'heure

Le front sait parser les dates `DD-MM-YYYY`, `DD/MM/YYYY` et `YYYY-MM-DD`.

Pour l'integration BFF :

- accepter `DD-MM-YYYY` en creation/modification, car le formulaire actuel l'envoie via `formatDateForServer` ;
- privilegier `YYYY-MM-DD` en lecture si un mapping front est ajoute ;
- ne pas utiliser de timezone pour les champs `date` et `endDate` : ce sont des dates calendaires ;
- utiliser `HH:mm` pour `startTime` et `endTime`, dans l'heure locale de la mairie.

## Payload de creation attendu par le front

Quand l'utilisateur cree un evenement, `CreateEventModal` renvoie actuellement ce format au hook :

```json
{
  "title": "Conseil municipal",
  "description": "Salle du conseil",
  "date": "15-06-2026",
  "endDate": "",
  "category": "meeting",
  "startTime": "09:00",
  "endTime": "10:00",
  "location": "Hotel de ville",
  "assigneeIds": ["as", "ma"],
  "recurrence": {
    "frequency": "none"
  }
}
```

Le BFF devrait repondre avec l'evenement cree, enrichi au minimum avec son `id` serveur.

## Exemple d'evenement renvoye par le BFF

```json
{
  "id": "evt_123",
  "title": "Conseil municipal",
  "description": "Salle du conseil",
  "date": "2026-06-15",
  "endDate": "2026-06-15",
  "category": "meeting",
  "startTime": "09:00",
  "endTime": "10:00",
  "location": "Hotel de ville",
  "assigneeIds": ["as", "ma"],
  "assignees": [
    {
      "id": "as",
      "name": "Admin Systeme",
      "email": "admin@mairie360.fr",
      "role": "Administrateur"
    },
    {
      "id": "ma",
      "name": "Marie Armand",
      "email": "marie.armand@mairie360.fr",
      "role": "Coordination"
    }
  ],
  "recurrence": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1],
    "endsOn": "2026-09-30"
  }
}
```

## Endpoints a prevoir

Les endpoints metier ne sont pas encore declares dans `@mairie360/bff-calendar-openapi`. Proposition de contrat minimal :

| Methode | Endpoint | Besoin |
| --- | --- | --- |
| `GET` | `/calendar/bootstrap` | Charger en une fois les evenements de la periode, les personnes assignables, les categories et l'utilisateur courant si necessaire. |
| `GET` | `/calendar/events?from=YYYY-MM-DD&to=YYYY-MM-DD` | Charger les evenements utiles a la vue mois/semaine/jour. |
| `POST` | `/calendar/events` | Creer un evenement. |
| `PATCH` | `/calendar/events/{id}` | Modifier un evenement. |
| `DELETE` | `/calendar/events/{id}` | Supprimer un evenement si l'UI ajoute cette action. |
| `GET` | `/calendar/assignees` | Charger le referentiel des personnes assignables. |
| `GET` | `/calendar/categories` | Charger le referentiel des categories. |
| `GET` | `/health` | Deja prevu : verifier la sante du BFF. |
| `GET` | `/check_apis` | Deja prevu : verifier la connexion aux APIs Core et Calendar. |

Pour la lecture des evenements, le BFF peut renvoyer les evenements maitres avec leur `recurrence`. Le front sait deja calculer les occurrences pour les statistiques et les vues calendrier via les composants partages.

## Statistiques

La sidebar affiche aujourd'hui trois statistiques :

- `Ce mois`
- `Cette semaine`
- `Aujourd'hui`

Elles sont calculees cote front depuis la liste des evenements. Le BFF n'a donc pas besoin de les fournir dans un premier temps.

Si le calcul doit passer cote serveur plus tard, preferer un format numerique :

```json
{
  "monthCount": 12,
  "weekCount": 4,
  "todayCount": 1
}
```

Le front gardera la responsabilite du libelle affiche : `1 evenement`, `2 evenements`, etc.

## Donnees utilisateur

L'en-tete utilise actuellement un utilisateur en dur :

```json
{
  "name": "Admin Systeme",
  "email": "admin@mairie360.fr",
  "role": "admin"
}
```

Pour une integration complete, ces informations devront venir de l'authentification ou de l'API Core, pas du module calendrier. Le module a seulement besoin de savoir si l'utilisateur peut administrer le calendrier afin d'afficher les actions de creation/modification.
