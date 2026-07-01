# T-01.3 — Page React `/signup`

> **User Story** : US-01 — *En tant que Léa, je veux m'inscrire sur la plateforme afin de pouvoir sauvegarder mes cours et mes quiz.*
> **Sprint** : Sprint 1
> **Estimation** : 3h
> **Assigné** : Hugo HAVET
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de créer le composant de page React `SignupPage` permettant à un nouvel utilisateur de saisir son adresse email, son prénom, son nom, et son mot de passe pour s'enregistrer. Une fois inscrit, le système connecte automatiquement l'utilisateur et le redirige vers l'écran d'import de document (`/upload`).

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/SignupPage.tsx](../../../frontend/src/pages/SignupPage.tsx) | Page d'inscription utilisateur | **OUI** |
| [frontend/src/api/auth.ts](../../../frontend/src/api/auth.ts) | Fonctions d'API d'authentification | Non (déjà existant) |
| [frontend/src/App.tsx](../../../frontend/src/App.tsx) | Routeur et définition des routes de l'application | **OUI** (si route `/signup` absente) |

---

## 3. Spécifications techniques

### 3.1 Fonction de soumission et flux
- **Champs requis** : `email` (type email, html-validation), `password` (type password, minLength={8}).
- **Champs facultatifs** : `first_name`, `last_name`.
- **Gestion des états** :
  - `loading` : Désactive le bouton d'inscription pour éviter les soumissions multiples.
  - `error` : Affiche le message d'erreur retourné par l'API (ex: doublon d'email) ou un message d'erreur générique.
- **Auto-login** : Après l'appel de l'API de création de compte via la fonction `signup` de `@/api/auth`, le token est configuré et la fonction `refresh()` du contexte d'authentification (`useAuth`) doit être appelée pour charger le profil utilisateur en session.
- **Redirection** : Rediriger l'utilisateur vers `/upload` avec `navigate('/upload', { replace: true })`.

### 3.2 Structure de l'interface utilisateur
L'interface doit être sobre, moderne et s'intégrer dans le thème d'EduTutor IA :
- Utilisation de classes utilitaires CSS (comme `.card`, `.input`, `.btn-primary`).
- Lien vers `/login` pour les utilisateurs ayant déjà un compte.
- Contrôle de la variable globale d'administration `allow_signups` (Lot 8) : si l'admin a bloqué les inscriptions, afficher un écran "Inscriptions fermées" avec un cadenas.

---

## 4. Étapes détaillées

### Étape 1 — Créer le composant de page SignupPage
Créer ou mettre à jour le fichier [frontend/src/pages/SignupPage.tsx](../../../frontend/src/pages/SignupPage.tsx) avec les hooks d'état et le formulaire.

Squelette de base :
```tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { getApiErrorMessage } from '@/api/errors';

export default function SignupPage() {
  const { refresh } = useAuth();
  const { config } = useSiteConfig();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup({
        email,
        password,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      });
      await refresh();
      navigate('/upload', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Inscription impossible."));
    } finally {
      setLoading(false);
    }
  };

  // Rendu de l'UI...
}
```

### Étape 2 — Configurer la route React Router
Dans [frontend/src/App.tsx](../../../frontend/src/App.tsx), ajouter la route pour le composant `/signup`. S'assurer que les utilisateurs authentifiés accédant à `/signup` soient redirigés vers `/upload` (route publique restreinte).

---

## 5. Definition of Done (DoD)

- [ ] La page `/signup` est accessible et affiche le formulaire d'inscription.
- [ ] Le bouton soumettre affiche un indicateur de chargement et est désactivé pendant l'appel API.
- [ ] Les messages d'erreur de validation renvoyés par l'API (ex: format e-mail, longueur mot de passe, e-mail existant) sont affichés proprement à l'utilisateur.
- [ ] Après une inscription réussie, l'utilisateur est connecté et redirigé vers `/upload`.
- [ ] L'écran d'inscriptions fermées fonctionne si `allow_signups` est à `false` dans la configuration globale du site.

---

## 6. Pièges à éviter

1. **Double soumission** : S'assurer de désactiver le bouton submit lors du chargement.
2. **Validation côté client incomplète** : Toujours utiliser le champ HTML standard `<input type="email">` et l'attribut `minLength={8}` pour éviter de faire des appels d'API inutiles.
3. **Mots de passe visibles dans le DOM** : Utiliser impérativement `type="password"` sur l'input du mot de passe.
