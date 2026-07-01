# T-04.1 — Backend `AnswerQuizView` : comparaison réponses + score + détail

> **User Story** : US-04 — *En tant que Léa, je veux répondre au quiz en sélectionnant mes réponses et le soumettre afin de voir mon résultat.*
> **Sprint** : Sprint 1
> **Estimation** : 2h
> **Assigné** : Frederick TOUFIK
> **Statut** : Done

---

## 1. Objectif de la tâche

Créer l'endpoint backend `POST /api/quizzes/<id>/answer/` permettant à l'utilisateur de soumettre ses 10 réponses à un quiz. L'API doit valider que la requête contient exactement 10 réponses (couvrant les questions d'index 1 à 10), calculer le score de bonnes réponses (/10), enregistrer les réponses choisies par l'utilisateur pour le suivi des erreurs (Lot 6), mettre à jour la note finale du quiz en base de données, et renvoyer le résultat détaillé.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/quizzes/serializers.py](../../../backend/quizzes/serializers.py) | Définition des sérialiseurs de validation des réponses | **OUI** |
| [backend/quizzes/views.py](../../../backend/quizzes/views.py) | Vue pour évaluer et persister le score | **OUI** |
| [backend/quizzes/urls.py](../../../backend/quizzes/urls.py) | Routage HTTP | **OUI** |

---

## 3. Spécifications techniques

### 3.1 Sérialiseurs de soumission
- **`AnswerItemSerializer`** : Valide une réponse individuelle.
  - `index` : Integer compris entre 1 et 10.
  - `selected_index` : Integer compris entre 0 et 3.
- **`SubmitAnswersSerializer`** : Valide l'ensemble des réponses soumises.
  - `answers` : Liste d'éléments validés par `AnswerItemSerializer`.
  - **Validation globale** : La liste doit contenir exactement 10 réponses, et les indices (`index`) des réponses doivent être uniques et couvrir l'intervalle `[1..10]` sans manque ni doublon.

### 3.2 Logique de la vue (`AnswerQuizView`)
1. Récupérer l'objet `Quiz` par son identifiant unique (`pk`), en s'assurant qu'il appartient bien à l'utilisateur connecté (`user = request.user`). Sinon, lever une erreur 404.
2. Valider le corps de la requête avec `SubmitAnswersSerializer`.
3. Charger les questions existantes du quiz depuis la base pour vérification. Si le quiz n'a pas exactement 10 questions, retourner un code `500 INTERNAL SERVER ERROR` (état corrompu).
4. Pour chaque réponse fournie :
   - Identifier la question correspondante via son index.
   - Vérifier si `correct_index == selected_index`. Si oui, incrémenter le score de 1.
   - Enregistrer l'index choisi dans `selected_index` de l'objet `Question` pour la révision des erreurs.
5. Assigner la note globale finale au quiz : `quiz.score = score`.
6. Enregistrer le quiz et les questions en base de données de manière transactionnelle.
7. Renvoyer un objet JSON de réponse :
   - `score` : Nombre de bonnes réponses (0 à 10).
   - `total` : 10.
   - `details` : Liste d'objets récapitulatifs `{ index, selected_index, correct_index, correct }`.

---

## 4. Étapes détaillées

### Étape 1 — Déclarer les sérialiseurs de soumission
Dans `backend/quizzes/serializers.py`, implémenter `AnswerItemSerializer` et `SubmitAnswersSerializer`.

### Étape 2 — Implémenter la vue d'évaluation
Dans `backend/quizzes/views.py`, écrire la classe `AnswerQuizView` dérivant de `APIView` :
- `permission_classes = [IsAuthenticated]`.
- Implémenter la méthode `post(self, request, pk: int)`.

### Étape 3 — Déclarer l'URL
Dans `backend/quizzes/urls.py` :
```python
from .views import AnswerQuizView

urlpatterns = [
    # ... autres urls
    path("<int:pk>/answer/", AnswerQuizView.as_view(), name="quiz-answer"),
]
```

---

## 5. Definition of Done

- [ ] L'endpoint `POST /api/quizzes/<id>/answer/` est fonctionnel.
- [ ] Les requêtes ne contenant pas exactement 10 réponses uniques et ordonnées de 1 à 10 sont rejetées avec une erreur 400.
- [ ] Le score final (/10) est correctement calculé et enregistré sur le modèle `Quiz` en base de données.
- [ ] Le champ `selected_index` de chaque `Question` est mis à jour en base de données.
- [ ] La réponse HTTP retourne le score global et le détail correcteur pour chaque question.

---

## 6. Pièges à éviter

1. **Failles d'exposition (Triche)** : L'API d'affichage de quiz (`QuizDetailView`) ne doit pas renvoyer `correct_index` aux étudiants qui n'ont pas encore passé le quiz. Pour cela, utiliser un sélecteur de sérialiseur ou un sérialiseur public masquant `correct_index` tant que `quiz.score` est nul (si le tricheur examine l'inspecteur réseau).
2. **Droits d'accès** : S'assurer que le filtre `user=request.user` est appliqué lors de la récupération du quiz. Un utilisateur ne doit pas pouvoir soumettre des réponses ou tricher sur le quiz d'un autre utilisateur.
