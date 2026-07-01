# T-11.1 — Backend `StatsView` : calcul des KPIs et historique

> **User Story** : US-11 — *En tant que Léa, je veux voir mon tableau de bord de progression afin de visualiser mes points forts et mes lacunes par matière.*
> **Sprint** : Sprint 1
> **Estimation** : 2h
> **Assigné** : Seer MENSAH ASSIAKOLEY
> **Statut** : Done

---

## 1. Objectif de la tâche

Créer l'endpoint API backend `GET /api/quizzes/stats/` (ou `/api/stats/`) renvoyant les indicateurs clés de progression (KPI) de l'utilisateur connecté :
- Nombre total de quiz générés.
- Nombre de quiz effectivement passés (score non nul).
- Score moyen global.
- Meilleur score obtenu.
- Nombre de questions répondues et nombre de réponses correctes.
- Taux de précision globale (%).
- Historique chronologique complet des tentatives (pour alimenter le graphique).

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/quizzes/views.py](../../../backend/quizzes/views.py) | Vue pour calculer et sérialiser les statistiques | **OUI** |
| [backend/quizzes/urls.py](../../../backend/quizzes/urls.py) | Routage HTTP | **OUI** |

---

## 3. Spécifications techniques

### 3.1 Agrégations ORM Django
Pour optimiser les performances, les calculs de statistiques de score moyen, meilleur score et compte total de tentatives doivent s'exécuter directement au niveau du moteur SQL via des fonctions d'agrégations de l'ORM Django (`Avg`, `Count`, `Max`).
- **Quiz passés** : Filtrer les quiz dont la colonne `score` n'est pas nulle (`score__isnull=False`).
- **Précision globale** :
  - Filtrer les questions répondues : `Question.objects.filter(quiz__user=request.user, selected_index__isnull=False)`.
  - Compter les réponses correctes en utilisant `F` (permettant la comparaison directe de colonnes SQL) : `.filter(selected_index=F("correct_index"))`.

### 3.2 Structure du JSON de réponse
L'endpoint doit retourner la payload JSON suivante :
```json
{
  "total_quizzes": 12,
  "quizzes_taken": 8,
  "average_score": 7.3,
  "best_score": 10,
  "last_score": 8,
  "questions_answered": 80,
  "questions_correct": 58,
  "accuracy": 73,
  "history": [
    {
      "id": 1,
      "title": "Algorithmique",
      "score": 6,
      "created_at": "2026-06-30T10:00:00Z"
    },
    ...
  ]
}
```

---

## 4. Étapes détaillées

### Étape 1 — Implémenter la vue de statistiques
Dans `backend/quizzes/views.py`, ajouter la classe `StatsView(APIView)` avec l'authentification requise.
Utiliser `taken = Quiz.objects.filter(user=request.user, score__isnull=False)` et effectuer l'agrégation :
```python
agg = taken.aggregate(avg=Avg("score"), best=Max("score"), nb=Count("id"))
```

### Étape 2 — Configurer l'URL
Dans `backend/quizzes/urls.py` :
```python
from .views import StatsView

urlpatterns = [
    path("stats/", StatsView.as_view(), name="stats"),
    # ... autres urls
]
```

---

## 5. Definition of Done

- [ ] L'endpoint `/api/quizzes/stats/` est accessible via `GET` pour les utilisateurs authentifiés.
- [ ] Le score moyen et le meilleur score sont correctement calculés à l'aide de l'agrégateur SQL de l'ORM.
- [ ] La précision globale (%) est calculée en fonction du ratio bonnes réponses / questions répondues.
- [ ] L'historique chronologique des scores est ordonné par date croissante.

---

## 6. Pièges à éviter

1. **Division par zéro** : Si un utilisateur vient de s'inscrire et n'a répondu à aucune question, s'assurer que le calcul de précision (`accuracy`) renvoie `None` ou `0` au lieu de lever une exception `ZeroDivisionError`.
2. **Chargement complet des objets en Python** : Ne pas charger la liste des objets `Question` en mémoire python pour faire les sommes et moyennes avec des boucles `for`. Toujours déléguer la sélection et le calcul à la base PostgreSQL avec `.aggregate()` et `.count()`.
3. **Sécurité inter-utilisateurs** : Vérifier que les filtres SQL contiennent systématiquement `user=request.user` ou `quiz__user=request.user`.
