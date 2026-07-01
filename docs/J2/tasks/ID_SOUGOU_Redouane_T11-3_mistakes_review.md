# T-11.3 — Révision des erreurs (MistakesView + ReviewMistakesPage)

> **User Story** : US-11 — *En tant que Léa, je veux voir mon tableau de bord de progression afin de visualiser mes points forts et mes lacunes par matière.*
> **Sprint** : Sprint 1
> **Estimation** : 2h (estimé globalement)
> **Assigné** : Redouane ID SOUGOU
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'implémenter la fonctionnalité de révision des erreurs (Lot 6). Cette fonctionnalité permet aux apprenants de lister et de réviser toutes les questions de quiz auxquelles ils ont répondu de manière incorrecte lors de leur dernière tentative. 

Elle comporte :
1. **Un endpoint backend** (`GET /api/quizzes/mistakes/` ou `/api/mistakes/`) extrayant les questions en échec.
2. **Une page frontend** (`ReviewMistakesPage`, route `/review`) affichant ces questions, avec une mise en évidence de la bonne réponse (en vert) et de la réponse erronée choisie par l'utilisateur (en rouge).

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/quizzes/views.py](../../../backend/quizzes/views.py) | Contrôleurs Django | **OUI** (créer `MistakesView`) |
| [frontend/src/pages/ReviewMistakesPage.tsx](../../../frontend/src/pages/ReviewMistakesPage.tsx) | Page de révision des erreurs | **OUI** |
| [frontend/src/App.tsx](../../../frontend/src/App.tsx) | Configuration des routes | **OUI** (déclarer la route `/review`) |

---

## 3. Spécifications techniques

### 3.1 Vue Backend (`MistakesView`)
L'API doit extraire les questions appartenant à l'utilisateur connecté dont la dernière réponse (`selected_index`) n'est pas nulle ET est différente de la bonne réponse (`correct_index`).
- **Requête SQL filtrée** :
  ```python
  Question.objects.filter(
      quiz__user=request.user,
      selected_index__isnull=False
  ).exclude(
      selected_index=F("correct_index")
  ).select_related("quiz").order_by("-quiz__created_at", "index")
  ```
- **Optimisation** : Utiliser `.select_related("quiz")` pour éviter les requêtes N+1 lors de la récupération du titre du quiz parent.

### 3.2 Composant React `OptionRow` (Frontend)
Pour chaque option de la question ratée, afficher une ligne stylisée de manière conditionnelle :
- **Si option correcte** (i === `correct_index`) : Fond vert, bordure verte, mention *« ✓ Bonne réponse »* (`bg-emerald-50 border-emerald-400 text-emerald-900`).
- **Si option sélectionnée à tort** (i === `selected_index`) : Fond rouge, bordure rouge, mention *« ✗ Votre réponse »* (`bg-rose-50 border-rose-400 text-rose-900`).
- **Sinon** : Bordure grise standard.

---

## 4. Étapes détaillées

### Étape 1 — Coder le endpoint de récupération des erreurs
Dans `backend/quizzes/views.py`, ajouter la classe `MistakesView` héritant de `APIView`. Déclarer la route `/api/quizzes/mistakes/` dans `urls.py`.

### Étape 2 — Coder la page frontend ReviewMistakesPage
Dans [frontend/src/pages/ReviewMistakesPage.tsx](../../../frontend/src/pages/ReviewMistakesPage.tsx), implémenter l'effet de chargement au montage (`getMistakes()`), stocker les erreurs dans une liste, et mapper les erreurs sous forme de cartes de révision.

### Étape 3 — Enregistrer la route
Dans `frontend/src/App.tsx`, déclarer le chemin `/review` pointant vers le composant `ReviewMistakesPage`.

---

## 5. Definition of Done

- [ ] L'endpoint `/api/quizzes/mistakes/` extrait uniquement les questions dont `selected_index != correct_index` pour l'utilisateur authentifié.
- [ ] La page `/review` affiche le nombre exact de questions erronées.
- [ ] Si aucune erreur n'est répertoriée, un écran alternatif s'affiche.
- [ ] Chaque carte de question ratée affiche clairement la bonne réponse et la réponse choisie.
- [ ] Un bouton "Refaire ce quiz" permet de naviguer vers le quiz parent.

---

## 6. Pièges à éviter

1. **Double décompte** : Veiller à ne lister que les questions du *dernier* passage du quiz (le champ `selected_index` sur `Question` stocke la valeur de la dernière tentative, ce qui est parfait).
2. **Étanchéité des données** : Comme pour l'historique, s'assurer qu'un utilisateur ne peut pas lister les erreurs d'un autre utilisateur en vérifiant les filtres SQL.
