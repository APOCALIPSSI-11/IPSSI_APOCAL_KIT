# T-07.2 — Formulaires React de mot de passe oublié et de réinitialisation

> **User Story** : US-07 — *En tant que Léa, je veux réinitialiser mon mot de passe si je l'ai oublié afin de pouvoir me reconnecter à mon compte.*
> **Sprint** : Sprint 1
> **Estimation** : 2h
> **Assigné** : Hugo HAVET
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de créer les deux composants frontend de gestion de perte de mot de passe :
1. **`ForgotPasswordPage`** (route `/forgot-password`) : Permet de saisir son adresse email pour demander un lien de réinitialisation.
2. **`ResetPasswordPage`** (route `/reset-password`) : Reçoit dans l'URL les paramètres `uid` et `token`, permet de saisir un nouveau mot de passe sécurisé (avec confirmation) et l'enregistre en base de données.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/ForgotPasswordPage.tsx](../../../frontend/src/pages/ForgotPasswordPage.tsx) | Page de demande d'email de reset | **OUI** |
| [frontend/src/pages/ResetPasswordPage.tsx](../../../frontend/src/pages/ResetPasswordPage.tsx) | Page de définition du mot de passe | **OUI** |
| [frontend/src/App.tsx](../../../frontend/src/App.tsx) | Routage de l'application | **OUI** (déclarer les routes) |

---

## 3. Spécifications techniques

### 3.1 ForgotPasswordPage
- **Champ** : Saisie d'email requis.
- **Soumission** : Appelle `requestPasswordReset(email)` depuis `@/api/auth`.
- **Retour visuel** : Afficher un message de confirmation générique (celui renvoyé par l'API pour éviter l'énumération de comptes) de couleur verte (`bg-emerald-50 border-emerald-500`). Cacher le formulaire après envoi.

### 3.2 ResetPasswordPage
- **Extraction des paramètres d'URL** : Utiliser `useSearchParams()` de React Router pour extraire `uid` et `token` depuis la query string : `/reset-password?uid=...&token=...`.
- **Validation** :
  - Si `uid` ou `token` est absent, afficher un bandeau rouge d'erreur indiquant que le lien est invalide.
  - Saisie de deux champs : `password` (Nouveau mot de passe) et `confirm` (Confirmation).
  - Validation client : Les deux entrées doivent être identiques et faire au moins 8 caractères (`minLength={8}`).
- **Soumission** : Appelle `confirmPasswordReset(uid, token, password)` depuis `@/api/auth`.
- **Succès** : Affiche un message de confirmation de réinitialisation et redirige automatiquement vers `/login` après 2 secondes (`setTimeout`).

---

## 4. Étapes détaillées

### Étape 1 — Créer ForgotPasswordPage
Ajouter le formulaire d'email dans [frontend/src/pages/ForgotPasswordPage.tsx](../../../frontend/src/pages/ForgotPasswordPage.tsx). Gérer les états `email`, `loading`, `message` et `error`.

### Étape 2 — Créer ResetPasswordPage
Ajouter le formulaire de changement dans [frontend/src/pages/ResetPasswordPage.tsx](../../../frontend/src/pages/ResetPasswordPage.tsx). Lire les requêtes HTTP via `useSearchParams()`. Valider l'égalité des champs `password === confirm` avant d'initier la requête.

### Étape 3 — Déclarer les routes
Dans `frontend/src/App.tsx` :
```tsx
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// dans le routeur...
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
```

---

## 5. Definition of Done

- [ ] L'écran `/forgot-password` s'affiche et soumet l'e-mail avec un indicateur de chargement.
- [ ] Le message de succès anti-énumération est affiché à la fin de la demande et le formulaire est masqué.
- [ ] L'écran `/reset-password` refuse de s'afficher et indique une erreur si l'e-mail n'a pas d'`uid` ni de `token` valide dans les paramètres.
- [ ] La validation client vérifie la correspondance et la longueur minimale (8 caractères) du mot de passe.
- [ ] Une fois validé par l'API, un message de confirmation s'affiche et la redirection vers `/login` se fait après 2 secondes.

---

## 6. Pièges à éviter

1. **Révéler la non-existence d'un compte** : Ne pas chercher à surcharger l'erreur de demande d'email côté client si l'API renvoie 200. S'en tenir à l'affichage du message de succès par défaut.
2. **Accès au mot de passe en clair** : S'assurer que les deux inputs de mot de passe sur la page de réinitialisation possèdent l'attribut `type="password"`.
3. **Redirection précoce** : Laisser le temps à l'utilisateur de lire le message de succès (ex: 2000 ms) avant de rediriger vers `/login`.
