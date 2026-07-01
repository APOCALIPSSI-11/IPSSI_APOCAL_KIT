# T-17.2 — Interface frontend de la zone de danger de profil

> **User Story** : US-17 — *En tant que Léa, je veux pouvoir supprimer définitivement mon compte et toutes mes données associées afin de faire valoir mon droit à l'oubli.*
> **Sprint** : Sprint 1
> **Estimation** : 1h
> **Assigné** : Thi Van Anh NGUYEN
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'implémenter l'interface utilisateur de suppression de compte au sein de la page de paramètres du profil (`ProfilePage`). 

Pour prévenir toute suppression accidentelle, le processus doit intégrer des mécanismes de sécurité visuelle et interactive : un avertissement explicite, une saisie obligatoire du mot de passe de confirmation, et une case à cocher déclarant avoir compris la nature irréversible de l'action.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/ProfilePage.tsx](../../../../frontend/src/pages/ProfilePage.tsx) | Page de profil utilisateur | **OUI** |
| `frontend/src/api/auth.ts` | Services d'API utilisateur | Non (déjà existant) |

---

## 3. Spécifications techniques

### 3.1 Conception visuelle (Zone de danger)
La zone de danger doit être placée en bas de la page des paramètres :
- Encadrée par une bordure rouge pour signaler visuellement le danger (`border-rose-200`).
- Titre clair : *« Zone de danger »* (`text-rose-700`).

### 3.2 Formulaire de suppression
Le formulaire contient les éléments interactifs suivants :
1. **Saisie du mot de passe actuel** : Un input `type="password"`, requis.
2. **Case à cocher de confirmation** : Une checkbox indiquant *« Je comprends que cette action est irréversible. »*
3. **Bouton d'action** : Un bouton rouge (`bg-rose-600 hover:bg-rose-700`) dont l'attribut `disabled` est piloté par :
   - L'état de chargement `delLoading`.
   - L'état de la checkbox (le bouton est inactif tant que la case n'est pas cochée).

### 3.3 Traitement de la soumission
À la soumission du formulaire :
1. Invoquer l'API backend de suppression.
2. En cas de succès (HTTP 204), réinitialiser les contextes de session locale de l'application et rediriger l'utilisateur vers la page de connexion (`/login`) ou d'accueil.
3. En cas d'échec (mot de passe incorrect), afficher le message d'erreur et réactiver les contrôles.

---

## 4. Étapes détaillées

### Étape 1 — Ajouter les variables d'états
Dans [frontend/src/pages/ProfilePage.tsx](../../../../frontend/src/pages/ProfilePage.tsx) :
```tsx
const [delPwd, setDelPwd] = useState('');
const [delConfirm, setDelConfirm] = useState(false);
const [delLoading, setDelLoading] = useState(false);
const [delErr, setDelErr] = useState<string | null>(null);
```

### Étape 2 — Implémenter le rendu de la section Danger
Ajouter le bloc JSX de la section Danger à la fin du conteneur de profil.
```tsx
<section className="card border-2 border-rose-200">
  <h2 className="text-lg font-semibold text-rose-700 mb-2">Zone de danger</h2>
  <p className="text-sm text-slate-600 mb-4">
    La suppression de votre compte est <strong>définitive</strong> et efface toutes vos données. Cette action est irréversible.
  </p>
  {delErr && <div className="error-alert">{delErr}</div>}
  <form onSubmit={handleDelete} className="space-y-4">
    <input
      type="password"
      required
      value={delPwd}
      onChange={(e) => setDelPwd(e.target.value)}
      className="input"
      placeholder="Entrez votre mot de passe"
    />
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={delConfirm}
        onChange={(e) => setDelConfirm(e.target.checked)}
      />
      Je comprends que cette action est irréversible.
    </label>
    <button type="submit" disabled={delLoading || !delConfirm} className="btn-danger">
      {delLoading ? 'Suppression…' : 'Supprimer définitivement mon compte'}
    </button>
  </form>
</section>
```

### Étape 3 — Coder la soumission
Déclarer `handleDelete` pour appeler le client API, vider le token du localStorage, et naviguer vers `/login`.

---

## 5. Definition of Done

- [ ] La section "Zone de danger" est visible en bas de la page.
- [ ] Le bouton de suppression est grisé et incassable tant que la checkbox de confirmation est décochée.
- [ ] Le mot de passe est saisi sous forme masquée (`type="password"`).
- [ ] La soumission avec succès détruit la session locale et renvoie sur `/login`.
- [ ] Les erreurs renvoyées par le serveur (ex: mot de passe faux) s'affichent correctement et réactivent la zone.

---

## 6. Pièges à éviter

1. **Permettre la soumission sans coche** : S'assurer que la validation côté client est active. Ne pas s'appuyer uniquement sur la désactivation visuelle du bouton, interdire la soumission dans le handler `handleDelete` si la checkbox est fausse :
   ```typescript
   if (!delConfirm) return;
   ```
2. **Oublier de nettoyer le localStorage** : Veiller à purger les données d'authentification locales (Token d'accès, infos d'utilisateur en cache) après l'appel API réussi, sinon l'application restera dans un état connecté incohérent vers un utilisateur inexistant.
