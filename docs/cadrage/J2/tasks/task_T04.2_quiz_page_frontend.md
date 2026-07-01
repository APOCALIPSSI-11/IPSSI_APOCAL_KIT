# T-04.2 — Page React `/quiz/:id`

> **User Story** : US-04 — *En tant que Léa, je veux répondre au quiz en sélectionnant mes réponses et le soumettre afin de voir mon résultat.*
> **Sprint** : Sprint 1
> **Estimation** : 2h
> **Assigné** : Hugo HAVET
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'implémenter l'interface utilisateur interactive du quiz (`QuizPage`). L'étudiant doit pouvoir :
- Consulter les 10 questions générées ainsi que leurs 4 options de réponse (A, B, C, D).
- Sélectionner une option de réponse pour chaque question de manière visuelle et réversible tant que le quiz n'a pas été soumis.
- Soumettre ses réponses au backend pour correction uniquement une fois que les 10 questions ont reçu une réponse.
- Consulter le score et la correction détaillée (les choix corrects et erronés mis en évidence) directement sur la page après soumission.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/QuizPage.tsx](../../../../frontend/src/pages/QuizPage.tsx) | Page de jeu et de soumission du quiz | **OUI** |
| `frontend/src/api/quizzes.ts` | Services d'API pour récupérer et soumettre | Non (déjà existant) |

---

## 3. Spécifications techniques

### 3.1 États du composant React
- `quiz` : `Quiz | null` (chargé à l'affichage via `getQuiz(quizId)`).
- `answers` : `Record<number, number>` (dictionnaire associant `questionIndex` -> `optionIndex`).
- `result` : `AnswerResult | null` (contenant le score, total, et la liste détaillée des corrections renvoyée par le backend après soumission).
- `submitting` : boolean (vrai pendant l'appel API de soumission).
- `loading` : boolean (chargement initial du quiz).
- `error` : string | null.

### 3.2 Gestion des choix
- Un clic sur un bouton d'option d'une question doit ajouter ou écraser l'index sélectionné dans le dictionnaire `answers`.
- Si le quiz a déjà été soumis (`result !== null`), bloquer tout changement de sélection.

### 3.3 Bouton de soumission
- Doit être désactivé si `submitting` est à `true` ou si l'utilisateur n'a pas répondu aux 10 questions.
- Affiche dynamiquement le nombre de réponses apportées (ex: `"Répondre à toutes les questions (6/10)"`) tant que ce n'est pas complet, puis affiche `"🎯 Soumettre mes réponses"`.
- Après soumission et calcul du score, remonter en haut de page en douceur (`window.scrollTo({ top: 0, behavior: 'smooth' })`) pour afficher le bandeau de résultat.

---

## 4. Étapes détaillées

### Étape 1 — Charger le quiz à l'initialisation
Utiliser `useEffect` pour interroger l'API avec le `id` extrait des paramètres d'URL (`useParams`).

### Étape 2 — Construire l'affichage des questions
- Mapper les questions de `quiz.questions`.
- Afficher chaque option sous forme de bouton large.
- Appliquer des classes de styles CSS conditionnelles selon l'état :
  - **Non soumis & sélectionné** : Style bleuté/indigo (`border-indigo-500 bg-indigo-50`).
  - **Soumis & correct** : Style verdâtre (`border-emerald-500 bg-emerald-50`).
  - **Soumis & erreur** : Style rougeâtre (`border-rose-500 bg-rose-50`).
  - **Soumis & non sélectionné** : Opacité réduite (`opacity-60`).

### Étape 3 — Coder la soumission
Construire la payload de réponses (liste d'objets `{ index, selected_index }`) à partir de l'état `answers` et invoquer la fonction d'API `submitAnswers`. Assigner la valeur de retour à `result` pour déclencher le rendu de correction.

---

## 5. Definition of Done

- [ ] Les 10 questions et leurs options respectives s'affichent proprement.
- [ ] L'utilisateur peut sélectionner et modifier ses réponses librement avant de soumettre.
- [ ] Le bouton de soumission est bloqué tant que les 10 questions n'ont pas reçu de réponse.
- [ ] Après soumission, les réponses correctes et incorrectes s'affichent avec des couleurs appropriées et des icônes de succès/échec (✓/✗).
- [ ] Les boutons d'options sont rendus inactifs (`disabled`) après la soumission.

---

## 6. Pièges à éviter

1. **Format d'indice** : Veiller à ce que l'indice de la question commence à 1 (index de base 1 côté backend) tandis que l'indice des options commence à 0.
2. **Soumission prématurée** : Ne pas autoriser le clic sur le bouton de soumission par raccourci clavier ou clic forcé si le formulaire n'est pas entièrement rempli.
3. **Double soumission** : Comme pour l'upload, s'assurer que le bouton submit passe en `disabled` dès que le processus asynchrone débute.
