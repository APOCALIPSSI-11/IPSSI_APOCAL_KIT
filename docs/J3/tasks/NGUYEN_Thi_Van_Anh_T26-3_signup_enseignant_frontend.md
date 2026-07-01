# T-26.3 — Frontend : route `/signup-enseignant` + formulaire dédié

> **User Story** : US-26 — *En tant qu'enseignante, je veux créer mon compte immédiatement sans validation manuelle, afin de tester l'outil sans délai.*
> **Sprint** : Sprint 3
> **Estimation** : 2h
> **Assigné** : Van Anh NGUYEN (repris de Hugo HAVET)
> **Statut** : Todo

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de créer l'interface utilisateur pour l'inscription des enseignants. Il faut ajouter une route `/signup-enseignant` affichant un formulaire d'inscription spécifique qui appelle le nouvel endpoint d'inscription enseignant (`POST /api/accounts/signup-enseignant/`). Après une inscription réussie, l'enseignant doit être automatiquement connecté et redirigé vers son espace dédié (`/dashboard-classe`).

**Dépendance bloquante** : [T-26.2](TOUFIK_Frederick_T26-2_signup_enseignant.md) (Frederick TOUFIK) doit être complétée côté backend pour que l'intégration fonctionne.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/SignupPage.tsx](../../../frontend/src/pages/SignupPage.tsx) | Page d'inscription utilisateur standard (étudiant) | Non (sauf si réutilisation de composants) |
| [frontend/src/pages/TeacherSignupPage.tsx](../../../frontend/src/pages/TeacherSignupPage.tsx) | Page d'inscription pour les enseignants | **OUI** [NEW] (ou adapter `SignupPage.tsx`) |
| [frontend/src/App.tsx](../../../frontend/src/App.tsx) | Déclaration des routes de l'application | **OUI** |
| [frontend/src/api/auth.ts](../../../frontend/src/api/auth.ts) | Client d'authentification API | **OUI** (ajouter l'appel API enseignant) |

---

## 3. Spécifications techniques

### 3.1 Ajout de la méthode API `signupTeacher`
Dans `frontend/src/api/auth.ts`, ajouter une fonction pour cibler le nouvel endpoint :
```typescript
export async function signupTeacher(data: SignupData): Promise<User> {
  const response = await client.post('/accounts/signup-enseignant/', data);
  return response.data;
}
```

### 3.2 Composant de page `TeacherSignupPage`
- Formulaire contenant : `email` (requis), `password` (requis), `first_name` (optionnel), `last_name` (optionnel).
- Consentement explicite aux CGU et à la politique de confidentialité (obligation RGPD, réutiliser le mécanisme de checkbox obligatoire de `SignupPage.tsx`).
- Gestion des états de chargement et d'erreur.
- Après soumission avec succès, appeler `refresh()` du contexte d'authentification et rediriger vers `/dashboard-classe` (qui sera créé en `T-T1.3`).

---

## 4. Étapes détaillées

### Étape 1 — Ajouter la fonction d'appel API
Ajouter la fonction `signupTeacher` dans [frontend/src/api/auth.ts](../../../frontend/src/api/auth.ts).

### Étape 2 — Créer la page d'inscription enseignant
Créer le fichier [frontend/src/pages/TeacherSignupPage.tsx](../../../frontend/src/pages/TeacherSignupPage.tsx) (s'inspirer fortement de `SignupPage.tsx` pour l'esthétique et la validation de formulaire).

### Étape 3 — Configurer la route React Router
Dans [frontend/src/App.tsx](../../../frontend/src/App.tsx), importer `TeacherSignupPage` et déclarer la route `/signup-enseignant`.
```tsx
<Route path="/signup-enseignant" element={<TeacherSignupPage />} />
```

---

## 5. Definition of Done

- [ ] La page `/signup-enseignant` est accessible.
- [ ] Le formulaire valide correctement les champs requis et le consentement obligatoire.
- [ ] L'inscription d'un enseignant appelle bien l'endpoint `/api/accounts/signup-enseignant/`.
- [ ] Après inscription réussie, l'enseignant est connecté et redirigé vers `/dashboard-classe`.
- [ ] La page conserve la charte graphique et l'esthétique du projet (boutons, inputs, gestion d'erreurs).

---

## 6. Pièges à éviter

1. **Omettre le consentement RGPD** : Les enseignants doivent également consentir explicitement aux CGU/Politique de confidentialité. Ne pas omettre la checkbox obligatoire sous prétexte d'alléger le flux.
2. **Mauvaise redirection** : S'assurer de rediriger vers le dashboard de classe `/dashboard-classe` et non vers la page d'upload standard `/upload` qui est destinée aux étudiants.
