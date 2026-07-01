# T-05.1 — Bandeau de score interactif et récapitulatif détaillé

> **User Story** : US-05 — *En tant que Léa, je veux voir mon score global et le détail de mes réponses afin de savoir quelles parties de mon cours je dois réviser.*
> **Sprint** : Sprint 1
> **Estimation** : 1h
> **Assigné** : Hugo HAVET
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'implémenter le bandeau de résultat affiché en haut de la page du quiz après soumission. Ce composant doit adapter sa couleur et son message d'encouragement pédagogique en fonction du score obtenu (sur 10), et offrir un bouton pour naviguer vers l'historique global de l'utilisateur.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/QuizPage.tsx](../../../../frontend/src/pages/QuizPage.tsx) | Page de rendu du quiz et du score | **OUI** (intégré dans le même fichier) |

---

## 3. Spécifications techniques

### 3.1 Niveaux de score et couleurs associées
Le bandeau doit utiliser des couleurs thématiques pour refléter le niveau d'assimilation du cours par l'étudiant :
- **Score ≥ 7 / 10** (Excellent/Bon) :
  - Style : Bordure gauche verte, fond vert très clair (`border-emerald-500 bg-emerald-50`).
  - Message : *« 🎉 Sans-faute ! Tu maîtrises ce chapitre. »* (si 10/10) ou *« 👍 Bon résultat. Revois les questions ratées en bas de page. »*
- **4 ≤ Score < 7 / 10** (Moyen) :
  - Style : Bordure gauche orange/jaune, fond orange très clair (`border-amber-500 bg-amber-50`).
  - Message : *« 📚 Tu as les bases, mais des révisions s'imposent. »*
- **Score < 4 / 10** (Insuffisant) :
  - Style : Bordure gauche rouge, fond rouge très clair (`border-rose-500 bg-rose-50`).
  - Message : *« ⚠️ Il faut reprendre le cours en profondeur. »*

### 3.2 Actions de navigation
Un bouton cliquable `"Retour à l'historique"` lié à la route `/history` (composant `Link` de `react-router-dom`) doit être inclus dans le bandeau pour permettre à l'utilisateur de quitter le quiz et voir sa progression générale.

---

## 4. Étapes détaillées

### Étape 1 — Coder le rendu conditionnel du bandeau de résultat
Dans le composant `QuizPage`, ajouter le bloc de rendu sous l'en-tête du quiz, affiché uniquement si l'état `result` n'est pas vide :
```tsx
{result && (
  <div className={`card border-l-4 ${
    result.score >= 7 
      ? 'border-emerald-500 bg-emerald-50' 
      : result.score >= 4 
        ? 'border-amber-500 bg-amber-50' 
        : 'border-rose-500 bg-rose-50'
  }`}>
    <h2 className="text-3xl font-bold text-slate-900 mb-2">
      Score : {result.score} / {result.total}
    </h2>
    <p className="text-slate-700">
      {result.score === 10
        ? '🎉 Sans-faute ! Tu maitrises ce chapitre.'
        : result.score >= 7
          ? '👍 Bon résultat. Revois les questions ratées en bas de page.'
          : result.score >= 4
            ? "📚 Tu as les bases, mais des révisions s'imposent."
            : '⚠️ Il faut reprendre le cours en profondeur.'}
    </p>
    <Link to="/history" className="btn-secondary mt-4 inline-flex">
      Retour à l'historique
    </Link>
  </div>
)}
```

### Étape 2 — Intégrer les styles CSS
S'assurer que les couleurs (`bg-emerald-50`, `bg-amber-50`, `bg-rose-50`) et bordures sont bien configurées dans Tailwind/CSS globale pour un rendu soigné.

---

## 5. Definition of Done

- [ ] Le bandeau s'affiche uniquement après soumission (lorsque l'objet `result` est présent).
- [ ] La couleur du bandeau s'ajuste dynamiquement selon le score (/10).
- [ ] Le message pédagogique correspond au niveau de score atteint.
- [ ] Le lien de navigation vers `/history` redirige correctement l'utilisateur.

---

## 6. Pièges à éviter

1. **Calculs en dur** : Ne pas coder en dur la taille maximale (10) dans les comparaisons, utiliser les propriétés de `result.total` renvoyées par le backend au cas où le nombre de questions venait à évoluer dans de futurs sprints.
2. **Couleurs agressives** : Éviter d'utiliser des couleurs de fonds unies très sombres (ex: rouge vif), qui nuisent à la lisibilité et à l'esthétique générale de l'application. Utiliser des teintes pastel légères (`bg-rose-50`, `bg-emerald-50`).
