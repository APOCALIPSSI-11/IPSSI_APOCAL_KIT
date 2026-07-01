# T-06.1 — Backend `QuizListView` : historique des quiz

> **User Story** : US-06 — *En tant que Léa, je veux voir l'historique de mes quiz passés afin de suivre ma progression.*
> **Sprint** : Sprint 1
> **Estimation** : 1h
> **Assigné** : Romain LEFEVRE
> **Statut** : Done

---

## 1. Objectif de la tâche

Créer l'endpoint API backend `GET /api/quizzes/` renvoyant la liste paginée de tous les quiz créés par l'utilisateur connecté. Les données doivent être triées par date de création décroissante (le quiz le plus récent apparaissant en premier) et inclure un résumé du nombre de questions par quiz et du score obtenu si le quiz a été passé.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/quizzes/serializers.py](../../../../backend/quizzes/serializers.py) | Définition du sérialiseur de résumé des quiz | **OUI** (créer `QuizSummarySerializer`) |
| [backend/quizzes/views.py](../../../../backend/quizzes/views.py) | Définition de la vue d'historique | **OUI** |
| [backend/quizzes/urls.py](../../../../backend/quizzes/urls.py) | Routage HTTP | **OUI** |

---

## 3. Spécifications techniques

### 3.1 Sérialiseur compact (`QuizSummarySerializer`)
Pour la liste d'historique, il n'est pas nécessaire de charger en mémoire ou d'envoyer l'ensemble des questions et réponses du quiz. Un sérialiseur compact doit être défini :
- **Champs** : `id`, `title`, `score`, `nb_questions`, `created_at`.
- **Calcul du nombre de questions** : Utiliser un champ calculé (`SerializerMethodField`) pour retourner le compte des questions associées à l'objet `Quiz`.

```python
class QuizSummarySerializer(serializers.ModelSerializer):
    nb_questions = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ["id", "title", "score", "nb_questions", "created_at"]

    def get_nb_questions(self, obj: Quiz) -> int:
        return obj.questions.count()
```

### 3.2 Vue API d'historique (`QuizListView`)
La vue doit dériver de `generics.ListAPIView` pour tirer parti des comportements de base de DRF (pagination, sérialisation) :
- Restreindre l'accès aux utilisateurs connectés : `permission_classes = [IsAuthenticated]`.
- Restreindre la requête SQL aux quiz de l'utilisateur courant : `Quiz.objects.filter(user=self.request.user)`.
- Trier les résultats par date décroissante : `.order_by("-created_at")`.

---

## 4. Étapes détaillées

### Étape 1 — Déclarer le sérialiseur
Dans `backend/quizzes/serializers.py`, ajouter la classe `QuizSummarySerializer`.

### Étape 2 — Implémenter la vue
Dans `backend/quizzes/views.py` :
```python
from rest_framework import generics
from .serializers import QuizSummarySerializer

class QuizListView(generics.ListAPIView):
    serializer_class = QuizSummarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.filter(user=self.request.user).order_by("-created_at")
```

### Étape 3 — Configurer l'URL
Dans `backend/quizzes/urls.py` :
```python
from .views import QuizListView

urlpatterns = [
    path("", QuizListView.as_view(), name="quiz-list"),
    # ... autres urls
]
```

---

## 5. Definition of Done

- [ ] L'endpoint `GET /api/quizzes/` renvoie la liste des quiz de l'utilisateur connecté.
- [ ] La liste est triée par date décroissante.
- [ ] Le nombre de questions et le score (/10 ou null) sont inclus dans les attributs de chaque quiz de la liste.
- [ ] Les quiz appartenant à d'autres utilisateurs ne sont pas retournés (étanchéité des requêtes SQL).

---

## 6. Pièges à éviter

1. **Pas de requêtes N+1** : L'utilisation de `obj.questions.count()` dans le serializer peut provoquer une requête SQL supplémentaire par ligne (problématique N+1). Si la base de données grossit, privilégier l'optimisation par un appel de type `prefetch_related("questions")` ou l'utilisation d'une annotation SQL `Count` dans le queryset de la vue :
   ```python
   def get_queryset(self):
       return Quiz.objects.filter(user=self.request.user).annotate(
           annotated_nb_questions=Count("questions")
       ).order_by("-created_at")
   ```
2. **Filtrage manquant** : Oublier de filtrer par `user=self.request.user` exposerait les quiz de toute la base à n'importe quel utilisateur authentifié.
