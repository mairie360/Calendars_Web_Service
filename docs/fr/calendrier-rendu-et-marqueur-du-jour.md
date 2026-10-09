# Calendrier rendu et marqueur du jour

La suite de mise en page monte la vraie page avec `react-dom/client`, les vrais hooks React, les composants partagés publiés et la feuille du consommateur. Le harnais existant sert les vrais relais frontend avec les BFF simulés existants, contrôlés par leurs contrats. Les trois tests exécutables du marqueur et de son minuteur sont conservés ; le garde qui cherchait le texte du branchement est remplacé par l’observation des vrais contrôles de date après bootstrap, changement de sélection et passage en semaine.

Les propriétés calculées vérifient les commandes de sidebar, l’ouverture/fermeture du tiroir, les éléments d’événements mois/semaine, la préparation de la zone de défilement à venir, overflow/espacement du main, typographie et contextes de densité explicitement fournis. La présentation de sélection change sur les contrôles rendus, tandis que le marqueur du jour reste indépendant. Les déclarations du token d’ombre sont vérifiées dans des contextes clair/sombre fournis ; JSDOM garde la référence de variable sur les cartes, sans prouver l’ombre native résolue ni la persistance des préférences.

Les politiques CSSOM parsées conservent l’association média/sélecteur, pistes/hauteurs bornées, insets mobiles, fallback du footer, tokens de petits textes et contours de focus. Ce sont des politiques de configuration. JSDOM simplifie les expressions mathématiques CSS imbriquées et ne développe pas fiablement outline en propriétés calculées longues ; dimensions/couleur sont donc vérifiées dans le raccourci parsé. Il ne calcule pas les media queries, ne compile pas Tailwind, ne mesure pas disposition/défilement ni hit-test natif. La recette dans le navigateur reste distincte et doit porter sur le main intégré et le snapshot local actualisé.

JSDOM est ajouté uniquement en dépendance de développement, avec la version publiée exacte `30.1.1`. Utiliser un runtime pris en charge par ses engines, par exemple Node `24.19.0` ; la CI utilise `24.21.0`. Dépendances de production, contrats, styles applicatifs et contrôles d’accessibilité restent inchangés. Données et horloge synthétiques des tests sont isolées du runtime livré.

```sh
node --test --test-concurrency=1 tests/calendar-rendered-layout.test.cjs tests/calendar-responsive-layout.test.cjs tests/calendar-today-marker.test.cjs
```
