# T-ProfilePage-clean — Nettoyage docblock `ProfilePage.tsx`

> **User Story** : Reliquat J3 — *Qualité de code & Maintenance*
> **Sprint** : Sprint 3
> **Estimation** : 0.25h (15 min)
> **Assigné** : Van Anh NGUYEN
> **Statut** : Done

> **Note (01/07)** : le docblock contenait en réalité deux TODO. Seul celui sur l'export RGPD (« Ajouter ici un bouton Exporter mes données ») était obsolète — la fonctionnalité est livrée. Celui sur le signalement de contenu (J4) a été **conservé** : la fonctionnalité n'existe toujours pas dans le code, ce n'est pas un TODO périmé.

---

## 1. Objectif de la tâche

L'objectif est de nettoyer la base de code frontend en supprimant un docblock TODO obsolète situé dans [frontend/src/pages/ProfilePage.tsx](../../../frontend/src/pages/ProfilePage.tsx) aux lignes 13-15. Ce commentaire fait référence à un placeholder d'implémentation pour la suppression de compte, alors que la fonctionnalité de suppression de compte (droit à l'oubli) a déjà été livrée et est pleinement opérationnelle.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/ProfilePage.tsx](../../../frontend/src/pages/ProfilePage.tsx) | Page de profil utilisateur | **OUI** |

---

## 3. Spécifications techniques

### 3.1 Suppression du commentaire obsolète

Repérer et supprimer le bloc de commentaire suivant dans le fichier :
```typescript
// TODO: [TODO J4] Implémenter le placeholder pour la suppression de compte
// ou similaire...
```

Vérifier que cette suppression n'altère en rien l'exécution logique du composant React `ProfilePage`.

---

## 4. Étapes détaillées

### Étape 1 — Localiser le commentaire
Ouvrir [frontend/src/pages/ProfilePage.tsx](../../../frontend/src/pages/ProfilePage.tsx) autour des lignes 10 à 20.

### Étape 2 — Supprimer les lignes
Retirer le commentaire obsolète.

### Étape 3 — Lancer les tests frontend
S'assurer que l'application frontend compile toujours sans avertissements ou erreurs.

---

## 5. Definition of Done

- [x] Le commentaire TODO obsolète est supprimé du fichier `ProfilePage.tsx`.
- [x] Le projet compile correctement (`tsc --noEmit` ok).
- [x] La page de profil fonctionne à l'identique (pas de régression).
- [x] Le code est propre et respecte les standards du projet.
