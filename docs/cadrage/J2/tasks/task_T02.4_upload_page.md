# T-02.4 — Page React `/upload`

> **User Story** : US-02 — *En tant que Léa, je veux uploader un PDF ≤ 5 Mo ou saisir un texte > 200 caractères afin de fournir ma matière de révision sans ressaisie manuelle.*
> **Sprint** : Sprint 1
> **Estimation** : 3h
> **Assigné** : Thi Van Anh NGUYEN
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'implémenter l'interface utilisateur de dépôt et de saisie de cours (`UploadPage`) dans React. La page doit permettre de basculer de manière intuitive entre deux modes d'importation :
1. **Texte collé** : Une zone de saisie `textarea` avec validation de longueur minimale de 200 caractères.
2. **Dépôt PDF** : Un sélecteur de fichier acceptant uniquement les documents PDF (limite de 5 Mo vérifiée côté client).

Une fois le cours soumis, le formulaire déclenche l'API et redirige vers la page du quiz généré.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/UploadPage.tsx](../../../../frontend/src/pages/UploadPage.tsx) | Composant de la page de chargement de cours | **OUI** |
| [frontend/src/App.tsx](../../../../frontend/src/App.tsx) | Configuration des routes | Non (déjà existant) |
| [frontend/src/api/llm.ts](../../../../frontend/src/api/llm.ts) | Client d'appel API de génération de quiz | Non (déjà existant) |

---

## 3. Spécifications techniques

### 3.1 États du composant
- `title` : string, titre saisi du cours.
- `mode` : `'pdf' | 'text'`, mode actif sélectionné.
- `pdf` : `File | null`, fichier PDF chargé.
- `sourceText` : string, texte saisi.
- `loading` : boolean, indicateur de chargement.
- `error` : string | null, message d'erreur.

### 3.2 Validations côté client
- **Saisie de texte** :
  - Champ `textarea` obligatoire si `mode === 'text'`.
  - Attribut `minLength={200}`.
  - Indicateur visuel dynamique affichant le nombre de caractères courants par rapport au seuil (ex: `142 / 200`).
- **Fichier PDF** :
  - Champ `input type="file"` obligatoire si `mode === 'pdf'`, avec `accept=".pdf,application/pdf"`.
  - Événement `onChange` : vérifier que `file.size <= 5 * 1024 * 1024`. Si dépassement, vider l'input et positionner une erreur.

### 3.3 Intégration API
- La soumission du formulaire appelle le service API `generateQuiz`.
- Pour le mode PDF, les données doivent être envoyées via `FormData` pour supporter l'upload de fichier binaire.

---

## 4. Étapes détaillées

### Étape 1 — Écrire le composant UploadPage
Créer ou modifier [frontend/src/pages/UploadPage.tsx](../../../../frontend/src/pages/UploadPage.tsx) :
- Mettre en place la structure du formulaire.
- Ajouter le switch de mode (boutons interactifs text vs PDF).
- Gérer l'affichage conditionnel de la zone de texte ou de l'input fichier.

### Étape 2 — Intégrer l'appel API
- Importer la fonction `generateQuiz`.
- Dans le gestionnaire de soumission, construire les arguments et invoquer l'API.
- En cas de succès, rediriger vers `/quiz/${quiz.id}`.

### Étape 3 — Rendu et Styling
- Appliquer un style moderne avec des effets de transition.
- Intégrer un spinner ou un message explicatif sur la durée de génération (surtout en cas d'inférence locale sur CPU, qui prend entre 1 et 5 minutes).

---

## 5. Definition of Done

- [ ] La page `/upload` s'affiche correctement.
- [ ] Le switch entre Saisie de texte et Dépôt PDF fonctionne de manière fluide.
- [ ] Les validations (taille du PDF ≤ 5 Mo, texte ≥ 200 caractères) bloquent la soumission côté client en affichant un message clair.
- [ ] La soumission initie la requête d'API et passe le bouton submit en état de chargement avec un spinner.
- [ ] La redirection s'effectue après génération du quiz.

---

## 6. Pièges à éviter

1. **Erreur d'envoi multipart** : S'assurer que les en-têtes HTTP ou le format de requête sont bien gérés (DRF requiert `MultiPartParser` côté backend pour l'upload PDF).
2. **Perte de focus ou d'état** : Lors de la bascule de mode (PDF <-> text), veiller à ne pas réinitialiser le titre du cours saisi.
3. **Absence d'avertissement de latence** : Étant donné le temps d'inférence locale sur CPU, il est indispensable de prévenir l'utilisateur que la génération peut prendre du temps afin de limiter la frustration ou le rechargement accidentel de la page.
