# T-06.2 — Page React d'historique `/history`

> **User Story** : US-06 — *En tant que Léa, je veux voir l'historique de mes quiz passés afin de suivre ma progression.*
> **Sprint** : Sprint 1
> **Estimation** : 2h
> **Assigné** : Thi Van Anh NGUYEN
> **Statut** : Done

---

## 1. Objectif de la tâche

Créer le composant de page React `HistoryPage` qui affiche la liste chronologique de tous les quiz passés ou créés par l'utilisateur connecté. Chaque quiz doit être représenté sous forme de carte interactive récapitulant les informations essentielles. En cliquant sur une carte, l'utilisateur est redirigé vers l'écran de jeu ou de révision du quiz correspondant.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/HistoryPage.tsx](../../../../frontend/src/pages/HistoryPage.tsx) | Page d'affichage de l'historique utilisateur | **OUI** |
| `frontend/src/api/quizzes.ts` | Services d'API pour lister les quiz | Non (déjà existant) |

---

## 3. Spécifications techniques

### 3.1 Chargement des données
À l'affichage de la page, interroger l'API `/api/quizzes/` via la fonction client `listQuizzes()`.
- Gérer l'état de chargement `loading` et afficher un texte ou squelette d'attente.
- Stocker les résultats dans une liste `quizzes`.
- En cas d'erreur de requête, afficher un message d'erreur.

### 3.2 Affichage des cartes de quiz
- **Cas 1 : Aucun quiz enregistré** : Afficher un écran vide esthétique invitant l'étudiant à créer son premier quiz, avec un lien vers la page de création `/upload`.
- **Cas 2 : Liste de quiz présents** : Afficher une grille de cartes (utilisant Tailwind CSS `grid sm:grid-cols-2 gap-4`).
- Chaque carte affiche :
  - L'identifiant (ex: `#12`).
  - La date de création formatée en local français (ex: `15/06/2026`).
  - Le titre du cours.
  - Le nombre de questions (ex: `10 questions`).
  - Le score avec un code couleur :
    - **Score ≥ 7 / 10** : badge vert (`bg-emerald-100 text-emerald-700`).
    - **4 ≤ Score < 7 / 10** : badge orange (`bg-amber-100 text-amber-700`).
    - **Score < 4 / 10** : badge rouge (`bg-rose-100 text-rose-700`).
    - **Score non défini (None/null)** : badge gris `"pas encore passé"` (`bg-slate-100 text-slate-600`).

---

## 4. Étapes détaillées

### Étape 1 — Créer le squelette de la page
Dans [frontend/src/pages/HistoryPage.tsx](../../../../frontend/src/pages/HistoryPage.tsx), importer React, `Link` de `react-router-dom` et les fonctions d'API.

### Étape 2 — Implémenter l'effet de chargement
Utiliser `useEffect` pour lancer l'appel `listQuizzes()`. Veiller à extraire `.results` de la réponse de l'API si l'endpoint backend renvoie une réponse paginée (contenant `count`, `next`, `previous`, `results`).

### Étape 3 — Rendu et mise en page
- Mettre en forme le titre `"Mon historique"` et l'indicateur de nombre total de quiz.
- Intégrer la logique de rendu conditionnel (grille de cartes vs écran vide).
- Configurer les badges de score colorés.

---

## 5. Definition of Done

- [ ] La page `/history` est accessible.
- [ ] L'appel d'API récupère l'ensemble des quiz de l'utilisateur.
- [ ] La liste s'affiche sous forme de grille adaptative.
- [ ] Chaque carte indique le titre, la date formatée, et son badge de score coloré correspondant.
- [ ] Un clic sur une carte redirige vers la route du quiz associé `/quiz/:id`.

---

## 6. Pièges à éviter

1. **Formatage de la date** : Ne pas afficher le timestamp brut (ex: `2026-06-30T18:30:00Z`). Toujours le convertir en objet `Date` et appliquer `.toLocaleDateString('fr-FR')` pour un affichage lisible.
2. **Ignorer la pagination** : Si le backend de DRF applique une pagination par défaut (ex: `PageNumberPagination`), le tableau des résultats sera imbriqué sous la clé `.results` de l'objet de réponse. S'assurer de bien faire `setQuizzes(res.results)` et non `setQuizzes(res)`.
