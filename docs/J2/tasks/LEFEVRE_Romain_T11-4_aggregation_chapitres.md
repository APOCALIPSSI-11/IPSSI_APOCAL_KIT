# T-11.4 — Agrégation statistique par chapitres de cours

> **User Story** : US-11 — *En tant que Léa, je veux voir mon tableau de bord de progression afin de visualiser mes points forts et mes lacunes par matière.*
> **Sprint** : Sprint 1
> **Estimation** : 3h
> **Assigné** : Romain LEFEVRE
> **Statut** : Done

---

## 1. Objectif de la tâche

Permettre d'identifier les lacunes et forces de l'étudiant par thématique de cours (chapitres). Pour cela, chaque question générée par le LLM doit être catégorisée sous un chapitre spécifique. Le backend effectue ensuite un regroupement des scores par chapitre pour envoyer au frontend une répartition de la précision par matière.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/quizzes/models.py](../../../backend/quizzes/models.py) | Modèle de données `Question` | **OUI** (ajouter le champ `chapter`) |
| `backend/llm/services/quiz_prompt.py` | Prompt de génération LLM et validateur | **OUI** (exiger et valider la clé `chapter`) |
| [backend/quizzes/views.py](../../../backend/quizzes/views.py) | Calcul des statistiques dans `StatsView` | **OUI** (ajouter le regroupement) |
| [frontend/src/pages/DashboardPage.tsx](../../../frontend/src/pages/DashboardPage.tsx) | Page de tableau de bord | **OUI** (afficher le détail par chapitre) |

---

## 3. Spécifications techniques

### 3.1 Évolution du modèle `Question`
Ajouter un champ `chapter` de type chaîne de caractères pour stocker le nom ou le libellé du chapitre déduit par le LLM.
```python
class Question(models.Model):
    # ... autres champs
    chapter = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Nom du chapitre associé à cette question (généré par le LLM)."
    )
```

### 3.2 Évolution du Prompt et de la validation LLM
Modifier le prompt système dans `quiz_prompt.py` pour exiger la clé `"chapter"` dans chaque élément de la liste `"questions"`.
Exemple de format attendu dans le prompt :
```json
{
  "questions": [
    {
      "prompt": "Énoncé...",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0,
      "chapter": "Nom du chapitre"
    }
  ]
}
```
Dans `parse_and_validate_quiz`, s'assurer de valider la présence de `chapter` sous forme de chaîne de caractères non vide.

### 3.3 Agrégation SQL des statistiques
Dans `StatsView`, effectuer un regroupement SQL par chapitre en comptant les réponses correctes par rapport aux questions répondues pour l'utilisateur courant :
```python
from django.db.models import Case, When, IntegerField, Count, Sum

def get_chapter_stats(user):
    answered_questions = Question.objects.filter(
        quiz__user=user, 
        selected_index__isnull=False
    )
    
    # Agrégation par chapitre : calcule le total de questions et le total de correctes
    chapter_stats = answered_questions.values("chapter").annotate(
        total=Count("id"),
        correct=Sum(
            Case(
                When(selected_index=F("correct_index"), then=1),
                default=0,
                output_field=IntegerField()
            )
        )
    )
    
    results = []
    for stat in chapter_stats:
        total = stat["total"]
        correct = stat["correct"] or 0
        accuracy = round(100 * correct / total) if total else 0
        results.append({
            "chapter": stat["chapter"] or "Général",
            "total": total,
            "correct": correct,
            "accuracy": accuracy
        })
    return results
```

---

## 4. Étapes détaillées

### Étape 1 — Mettre à jour le modèle et générer la migration
Ajouter `chapter` dans `Question`. Lancer `makemigrations` et `migrate`.

### Étape 2 — Adapter le prompt et le parseur LLM
Modifier `quiz_prompt.py` pour inclure la règle de génération de chapitre. Mettre à jour le validateur pour stocker ce champ.

### Étape 3 — Coder la logique d'agrégation backend
Dans `StatsView`, appeler la logique d'agrégation et ajouter la clé `chapter_stats` dans le dictionnaire JSON de retour de l'API `/api/quizzes/stats/`.

### Étape 4 — Afficher les matières sur le Dashboard
Sur `DashboardPage.tsx`, afficher une liste ou un tableau des chapitres avec le pourcentage de précision associé pour mettre en évidence les forces et faiblesses.

---

## 5. Definition of Done

- [x] Le champ `chapter` est persisté en base de données.
- [x] Le LLM génère et associe un chapitre pour chaque question.
- [x] L'API de statistiques renvoie un récapitulatif de réussite regroupé par nom de chapitre.
- [x] L'interface utilisateur affiche la précision par chapitre sous forme de liste de progression.

---

## 6. Pièges à éviter

1. **Chapitres vides ou incohérents** : Les LLM peuvent parfois renvoyer des variantes orthographiques (ex: `"Algorithmique"` vs `"algorithmes"`). Mettre en place un nettoyage basique côté backend (ex: `.strip().capitalize()`) avant d'enregistrer le chapitre en base.
2. **Noms de chapitres trop longs** : Limiter la taille de la chaîne de caractères à 100 caractères pour éviter de saturer l'affichage ou de violer la contrainte de base de données.
3. **Calcul de pourcentage** : Gérer correctement les divisions par zéro si un chapitre n'a pas de question répondue.
