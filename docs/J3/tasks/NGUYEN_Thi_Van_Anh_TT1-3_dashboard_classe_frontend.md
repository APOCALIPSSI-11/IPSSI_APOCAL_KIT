# T-T1.3 — Frontend : route `/dashboard-classe` + composants KPI

> **User Story** : US-T1 — *Espace Enseignant / Suivi de Classe*
> **Sprint** : Sprint 3
> **Estimation** : 2h
> **Assigné** : Van Anh NGUYEN
> **Statut** : Todo

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de créer l'interface du tableau de bord de l'enseignant (`/dashboard-classe`). Cette interface doit afficher les indicateurs clés de performance (KPI) de la classe (taux de réussite moyen, nombre d'élèves, nombre de quiz complétés) et la liste des élèves avec leur progression individuelle en consommant les données renvoyées par l'endpoint `GET /api/dashboard-classe/`.

**Dépendance bloquante** : [T-T1.2](MENSAH_ASSIAKOLEY_Seer_TT1-2_dashboard_classe_backend.md) (Seer MENSAH ASSIAKOLEY) doit être terminée côté backend.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/TeacherDashboardPage.tsx](../../../frontend/src/pages/TeacherDashboardPage.tsx) | Page de dashboard enseignant | **OUI** [NEW] |
| [frontend/src/App.tsx](../../../frontend/src/App.tsx) | Routage de l'application | **OUI** |
| [frontend/src/components/RequireAuth.tsx](../../../frontend/src/components/RequireAuth.tsx) | Sécurité des routes par rôle | **OUI** (si besoin de restreindre aux enseignants) |

---

## 3. Spécifications techniques

### 3.1 Appel d'API
Créer une fonction dans le dossier API (par exemple `frontend/src/api/admin.ts` ou un nouveau fichier `frontend/src/api/classes.ts`) :
```typescript
export async function getTeacherDashboardData() {
  const response = await client.get('/dashboard-classe/');
  return response.data;
}
```

### 3.2 Composants KPI et Rendu
- **Indicateurs généraux (Cartes KPI)** :
  - Nombre total d'étudiants dans la classe.
  - Score moyen global aux quiz.
  - Nombre de quiz générés / répondus.
- **Tableau de progression individuelle des étudiants** :
  - Nom / Email de l'étudiant.
  - Nombre de quiz complétés.
  - Score moyen de l'étudiant.
  - Date de dernière activité.

---

## 4. Étapes détaillées

### Étape 1 — Définir le client API
Ajouter la fonction `getTeacherDashboardData` dans l'API frontend.

### Étape 2 — Créer la page de dashboard
Créer le fichier [frontend/src/pages/TeacherDashboardPage.tsx](../../../frontend/src/pages/TeacherDashboardPage.tsx). Implémenter le chargement des données au montage du composant (`useEffect`) et gérer le loader ainsi que les cas d'erreur.
Assurer un design premium avec des cartes KPI en dégradé, des ombres douces et une typographie soignée.

### Étape 3 — Configurer la route et la sécurité
Dans [frontend/src/App.tsx](../../../frontend/src/App.tsx), ajouter la route `/dashboard-classe`. S'assurer que seuls les utilisateurs connectés ayant le rôle `teacher` peuvent y accéder en adaptant ou en encapsulant la route dans un composant de garde comme `RequireAuth`.

---

## 5. Definition of Done

- [ ] La route `/dashboard-classe` est fonctionnelle.
- [ ] La page affiche correctement les KPI globaux et la liste des étudiants avec leurs scores moyens.
- [ ] L'accès est interdit (redirection ou page d'erreur 403) aux utilisateurs ordinaires (étudiants).
- [ ] L'intégration avec l'endpoint backend `GET /api/dashboard-classe/` est fonctionnelle.

---

## 6. Pièges à éviter

1. **Absence de contrôle de rôle côté client** : Ne pas laisser un étudiant accéder à l'interface en omettant de vérifier le rôle dans le Guard de route.
2. **Gestion d'erreur absente** : Si l'enseignant n'a pas encore de classe ou d'élèves, l'endpoint peut retourner des structures vides. Gérer ces cas proprement au niveau du rendu (ex: afficher "Aucun étudiant enregistré pour le moment").
