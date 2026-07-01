# T-03.3 — Modèles `Quiz` + `Question` et persistance en transaction atomique

> **User Story** : US-03 — *En tant que Léa, je veux générer 10 questions à choix multiples à partir de mon cours afin de tester mes connaissances.*
> **Sprint** : Sprint 1
> **Estimation** : 2h
> **Assigné** : Seer MENSAH ASSIAKOLEY
> **Statut** : Done

---

## 1. Objectif de la tâche

Cette tâche consiste à modéliser la structure de données des quiz et questions dans Django, et à implémenter le mécanisme de sauvegarde de ces entités en base de données PostgreSQL. 

La persistance de la génération doit s'effectuer de manière atomique : soit les 10 questions et le quiz associé sont entièrement créés et sauvegardés, soit aucun changement n'est appliqué en base de données. Cela évite les états incohérents (par exemple, un quiz avec seulement 3 questions persistées).

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/quizzes/models.py](../../../backend/quizzes/models.py) | Définition des structures de base de données | **OUI** (déjà existant) |
| [backend/quizzes/views.py](../../../backend/quizzes/views.py) | Contrôleurs Django pour la persistance | **OUI** |

---

## 3. Spécifications techniques

### 3.1 Conception des modèles Django
- **Modèle `Quiz`** :
  - `user` : Clé étrangère (`ForeignKey`) vers le modèle utilisateur.
  - `title` : Titre du quiz / cours.
  - `source_text` : Texte du cours (saisi ou extrait du PDF).
  - `score` : Score de l'utilisateur sur 10 (nullable au départ).
- **Modèle `Question`** :
  - `quiz` : Clé étrangère (`ForeignKey`) vers le modèle `Quiz` en relation `CASCADE` (si le quiz est supprimé, toutes les questions associées le sont).
  - `index` : Position de la question (1 à 10).
  - `prompt` : Énoncé textuel.
  - `options` : Liste d'options textuelles stockées au format JSON (champ `JSONField` dans Django, natif PostgreSQL).
  - `correct_index` : Index (0 à 3) désignant la bonne option.
  - `selected_index` : Option choisie par l'utilisateur (nullable par défaut).

Une contrainte d'unicité composite (`unique_together`) doit être posée sur `("quiz", "index")` pour s'assurer qu'un quiz ne peut posséder deux questions ayant la même position d'index.

### 3.2 Persistance atomique
Pour éviter les corruptions de données en cas d'erreur lors de l'insertion d'une des questions, la création du quiz et de ses 10 questions associées doit s'effectuer au sein d'un bloc de transaction atomique Django (`django.db.transaction.atomic`) :
```python
from django.db import transaction
from .models import Quiz, Question

def save_generated_quiz(user, title, source_text, questions_data) -> Quiz:
    with transaction.atomic():
        quiz = Quiz.objects.create(
            user=user,
            title=title,
            source_text=source_text
        )
        for q_data in questions_data:
            Question.objects.create(
                quiz=quiz,
                index=q_data["index"],
                prompt=q_data["prompt"],
                options=q_data["options"],
                correct_index=q_data["correct_index"]
            )
        return quiz
```

---

## 4. Étapes détaillées

### Étape 1 — Créer les modèles Quiz et Question
Définir les modèles dans [backend/quizzes/models.py](../../../backend/quizzes/models.py) avec les contraintes d'unicité, les validations et les commentaires d'aide (`help_text`).

### Étape 2 — Appliquer les migrations de base de données
1. Générer la migration :
   ```bash
   docker compose exec backend python manage.py makemigrations quizzes
   ```
2. Exécuter la migration :
   ```bash
   docker compose exec backend python manage.py migrate quizzes
   ```

### Étape 3 — Intégrer la transaction atomique dans la vue de génération
Dans la vue Django qui pilote l'interaction avec le LLM, encapsuler la logique de création du quiz et des questions dans un bloc `with transaction.atomic():`. Si le parseur LLM échoue à valider l'une des questions, lever une exception pour déclencher automatiquement un rollback SQL complet.

---

## 5. Definition of Done

- [x] Les classes `Quiz` et `Question` sont définies dans `quizzes/models.py`.
- [x] La contrainte d'unicité composite `unique_together = [("quiz", "index")]` est en place.
- [x] La migration de base de données est générée et appliquée.
- [x] La persistance se fait dans un bloc de transaction Django `transaction.atomic()`.
- [x] Les tests d'intégration valident que si une erreur d'insertion SQL survient sur la question 5, aucun enregistrement `Quiz` ou `Question` n'est créé en base.

---

## 6. Pièges à éviter

1. **Transaction hors-contexte** : Veiller à ne pas placer l'appel HTTP vers l'API externe du LLM à l'intérieur du bloc `transaction.atomic()`. La transaction SQL ne doit être ouverte qu'au moment de la sauvegarde en base de données, après avoir récupéré et validé la réponse du LLM. Ouvrir une transaction pendant l'inférence LLM bloquerait inutilement les connexions en base pendant plusieurs minutes.
2. **Cascades manquantes** : S'assurer que le modèle `Question` est lié au `Quiz` avec `on_delete=models.CASCADE`. Sinon, la suppression d'un quiz provoquera des erreurs SQL d'intégrité de clé étrangère.
