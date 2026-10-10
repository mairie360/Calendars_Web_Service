# Gardes sémantiques frontend — MAIR-437

Les politiques de frontières réseau s’appuient sur des nœuds syntaxiques ; les cinq opérations réelles du client Calendar passent aussi par le harnais HTTP existant validé par contrat. Les refus de routes/méthodes/CSRF et les contrôles de mocks sont conservés. Seuls tests/helpers/documentation changent ; aucune source produit, dépendance, API/BFF, configuration RGAA ou exigence de couverture ne change. Les mocks ne certifient pas les parcours authentifiés, droits, persistance ou rollout en dev.
