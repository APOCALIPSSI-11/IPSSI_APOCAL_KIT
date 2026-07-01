# T-11.2 — Tableau de bord React `/dashboard` avec indicateurs clés (KPI) et graphique

> **User Story** : US-11 — *En tant que Léa, je veux voir mon tableau de bord de progression afin de visualiser mes points forts et mes lacunes par matière.*
> **Sprint** : Sprint 1
> **Estimation** : 3h
> **Assigné** : Redouane ID SOUGOU
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'implémenter l'interface utilisateur du tableau de bord de progression (`DashboardPage`). 

Ce composant React interroge l'endpoint de statistiques pour afficher 4 indicateurs clés (KPI) sous forme de cartes d'informations et représenter graphiquement la progression des notes au cours des différentes tentatives. 

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/DashboardPage.tsx](../../../../frontend/src/pages/DashboardPage.tsx) | Composant de la page de tableau de bord | **OUI** |
| [frontend/src/App.tsx](../../../../frontend/src/App.tsx) | Configuration des routes de l'application | Non (déjà existant) |

---

## 3. Spécifications techniques

### 3.1 Cartes d'indicateurs clés (KPI)
Le tableau de bord doit présenter 4 cartes avec une mise en page adaptative (CSS Grid : `grid grid-cols-2 lg:grid-cols-4 gap-4`) :
1. **Quiz passés** : Affiche le nombre de tentatives passées (avec en légende le nombre total de quiz créés).
2. **Score moyen** : Affiche le score moyen (/10).
3. **Meilleur score** : Affiche la note maximale obtenue (/10).
4. **Précision globale** : Affiche le pourcentage de réponses correctes par rapport au total de questions répondues.

### 3.2 Graphique de progression (Barres en CSS pur)
Afin de ne pas introduire de lourde bibliothèque de charting (comme Recharts ou Chart.js), le graphique est construit en HTML/CSS brut :
- Un conteneur flex aligné par le bas (`flex items-end gap-2 h-48 border-b border-l`).
- Chaque barre représente une tentative de quiz de l'historique :
  - Hauteur de la barre : proportionnelle au score `style={{ height: `${(p.score / 10) * 100}%` }}`.
  - Couleur de la barre : verte si `score >= 7`, orange si `score >= 4`, rouge si `score < 4`.
  - Info-bulle au survol (`title`) affichant le titre du cours, la note, et la date locale de passage.

---

## 4. Étapes détaillées

### Étape 1 — Créer le composant interne KpiCard
Définir un sous-composant réutilisable pour uniformiser les cartes :
```tsx
function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-3xl font-bold text-slate-900 mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}
```

### Étape 2 — Implémenter l'appel API de statistiques
Utiliser `useEffect` pour interroger l'API avec la fonction `getStats()`. Gérer les états `loading` et `error`. Si aucune tentative n'a été réalisée (`quizzes_taken === 0`), afficher un message alternatif convivial invitant à créer un premier quiz.

### Étape 3 — Rendu du graphique
Mapper sur la liste `stats.history` et dessiner les barres. Gérer la couleur en fonction du score.

---

## 5. Definition of Done

- [ ] L'écran `/dashboard` charge correctement les statistiques de l'utilisateur connecté.
- [ ] Les 4 cartes KPI (Quiz passés, Score moyen, Meilleur score, Précision) s'affichent proprement.
- [ ] Si l'utilisateur n'a aucun quiz dans son historique, un écran alternatif vide s'affiche avec un bouton de redirection vers `/upload`.
- [ ] Les barres de progression s'affichent chronologiquement et la couleur correspond aux seuils définis.
- [ ] Le survol d'une barre de graphique affiche une infobulle contenant les métadonnées.

---

## 6. Pièges à éviter

1. **Valeurs Nulles** : Gérer correctement les valeurs nulles renvoyées par le backend si l'utilisateur possède des quiz créés mais n'a pas encore répondu (score moyen = null, etc.) en affichant un tiret `—` ou `0` pour éviter les plantages ou les affichages `"null/10"`.
2. **Débordement du graphique** : S'assurer que les barres s'adaptent et ne débordent pas du conteneur parent si le nombre de tentatives est élevé. Limiter ou scroller l'axe horizontal si nécessaire.
3. **Format de date** : Convertir la date de l'historique du format ISO standard au format local avant affichage.
