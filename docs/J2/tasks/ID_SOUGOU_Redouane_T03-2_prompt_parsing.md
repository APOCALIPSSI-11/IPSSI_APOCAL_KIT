# T-03.2 — Prompt structuré et parsing JSON robuste pour 10 QCM

> **User Story** : US-03 — *En tant que Léa, je veux générer 10 questions à choix multiples à partir de mon cours afin de tester mes connaissances.*
> **Sprint** : Sprint 1
> **Estimation** : 2h
> **Assigné** : Redouane ID SOUGOU
> **Statut** : Done

---

## 1. Objectif de la tâche

Cette tâche consiste à mettre en place le prompt système cadrant le LLM et à implémenter un parseur/validateur de sortie JSON robuste. Les modèles de langage peuvent parfois échouer à produire du JSON strict ou encapsuler leur réponse dans du texte explicatif (markdown, blabla). Le système doit être capable d'extraire le bloc JSON, de le valider et de renvoyer une structure de données propre au backend pour persistance.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| `backend/llm/services/quiz_prompt.py` | Prompt et validation partagés | **OUI** |
| `backend/llm/services/base.py` | Utilisation des exceptions `LLMError` | Non |

---

## 3. Spécifications techniques

### 3.1 Conception du Prompt
Le prompt système (`SYSTEM_PROMPT`) doit instruire le modèle de manière directive :
- Générer exactement 10 questions.
- Chaque question doit proposer exactement 4 options.
- Fournir un index `correct_index` (0 à 3) désignant la bonne réponse.
- Retourner uniquement le JSON, sans explications ni fioritures de markdown (ex: pas de triple backticks ` ```json `).

Le prompt utilisateur (`build_user_prompt`) transmet le titre du cours et le texte brut du cours, tronqué au préalable à 8000 caractères (`MAX_SOURCE_CHARS`) pour éviter de saturer la fenêtre de contexte des petits modèles locaux.

### 3.2 Parsing et extraction robustes
Pour gérer les variations de formatage du LLM, la fonction `parse_and_validate_quiz` doit :
1. Tenter un `json.loads` direct du texte de réponse.
2. Si cela échoue, appliquer une expression régulière pour rechercher le premier bloc délimité par des accolades `{ ... }` et tenter de parser ce sous-ensemble.
3. Lever une exception `LLMError` explicite si aucun JSON n'est trouvé.

### 3.3 Validation stricte de la structure
Le JSON parsé doit respecter scrupuleusement la structure attendue. Le validateur effectue les vérifications suivantes :
- L'objet racine contient la clé `"questions"` contenant une liste.
- La liste contient exactement 10 questions (si plus de 10 sont retournées, le système tronque à 10 ; si moins de 10, le système rejette avec une erreur).
- Pour chaque question, vérifier la présence et le type de :
  - `prompt` (string non vide)
  - `options` (liste de 4 strings non vides)
  - `correct_index` (integer compris entre 0 et 3).

---

## 4. Étapes détaillées

### Étape 1 — Rédiger les invites de commandes (Prompts)
Définir `SYSTEM_PROMPT` et `build_user_prompt` dans `backend/llm/services/quiz_prompt.py`.

### Étape 2 — Coder la fonction de parsing et validation
Implémenter la fonction `parse_and_validate_quiz(raw: str) -> list[dict]` dans le même fichier.

Exemple d'implémentation de la regex d'extraction :
```python
import json
import re

def extract_json(raw: str) -> dict:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Recherche du premier bloc accolade
        match = re.search(r"\{[\s\S]*\}", raw)
        if not match:
            raise ValueError("Aucun bloc JSON n'a été détecté dans la réponse LLM.")
        return json.loads(match.group(0))
```

### Étape 3 — Coder la boucle de validation question par question
Parcourir la liste des questions et lever une `LLMError` si un champ est manquant, a un type incorrect, ou si les contraintes de valeurs ne sont pas respectées (ex: correct_index invalide).

---

## 5. Definition of Done

- [ ] Les prompts sont définis de manière à contraindre le format JSON.
- [ ] La fonction `parse_and_validate_quiz` gère le nettoyage des réponses textuelles polluées par des commentaires hors-JSON.
- [ ] La structure de données résultante est validée (10 questions, 4 options, index correct valide).
- [ ] Les exceptions `LLMError` sont correctement levées avec des messages d'erreurs utiles.
- [ ] Des tests unitaires spécifiques sont écrits pour valider le comportement du parseur face à des JSON valides, corrompus ou hors-spécifications.

---

## 6. Pièges à éviter

1. **Faire confiance au format du LLM** : Même avec les instructions de prompt les plus strictes, un LLM peut occasionnellement renvoyer du texte explicatif ou des indices invalides (ex: correct_index valant 4 ou un index sous forme de chaîne comme `"A"`). La validation post-génération est obligatoire pour éviter de corrompre la base de données.
2. **Saturer le contexte** : Toujours tronquer la taille du cours fourni au LLM (ex: max 8000 caractères) pour éviter que les petits modèles de 3B ou 8B ne dépassent leur fenêtre de contexte de calcul, ce qui produit des générations tronquées et impossibles à parser.
