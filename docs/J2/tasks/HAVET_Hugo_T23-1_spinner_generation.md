# T-23.1 — Spinner de chargement sur le bouton de génération

> **User Story** : US-23 — *En tant que Léa, je veux voir une progression visuelle de la génération du quiz afin de savoir que le système travaille et d'estimer le temps d'attente.*
> **Sprint** : Sprint 1
> **Estimation** : 1h
> **Assigné** : Hugo HAVET
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'ajouter un spinner de chargement animé sur le bouton de génération de quiz de la page d'import (`UploadPage`). Cela donne un retour d'information visuel immédiat après le clic pour indiquer que l'appel d'API est en cours, tout en verrouillant l'interaction pour éviter les clics multiples et les doubles générations sur le serveur.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [frontend/src/pages/UploadPage.tsx](../../../frontend/src/pages/UploadPage.tsx) | Page d'importation de cours | **OUI** |

---

## 3. Spécifications techniques

### 3.1 Animation CSS du Spinner
- Utiliser la classe utilitaire native de Tailwind CSS `animate-spin` pour faire tourner une icône ou un SVG.
- Utiliser un caractère emoji d'attente (comme `⏳` ou `🔄`) ou un élément SVG circulaire de chargement.

### 3.2 Gestion de l'état du bouton
- Le bouton doit écouter la variable d'état `loading`.
- Si `loading === true` :
  - Ajouter l'attribut HTML `disabled={true}` au bouton.
  - Modifier le style visuel du bouton pour réduire son opacité et désactiver les effets de survol (`opacity-50 cursor-not-allowed`).
  - Modifier le texte du bouton de `"🚀 Générer le quiz"` vers `"Génération en cours… (patientez)"`.

---

## 4. Étapes détaillées

### Étape 1 — Modifier le bouton submit dans l'UI
Dans [frontend/src/pages/UploadPage.tsx](../../../frontend/src/pages/UploadPage.tsx), remplacer le rendu du bouton submit par une structure conditionnelle :
```tsx
<button 
  type="submit" 
  disabled={loading} 
  className="btn-primary w-full flex items-center justify-center gap-2"
>
  {loading ? (
    <>
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Génération en cours… (1 à 5 min sur CPU)
    </>
  ) : (
    <>🚀 Générer le quiz</>
  )}
</button>
```

---

## 5. Definition of Done

- [ ] Un clic sur le bouton submit passe l'état `loading` à `true`.
- [ ] Le bouton de soumission est désactivé visuellement et techniquement lors du chargement.
- [ ] L'animation du spinner de chargement tourne de manière fluide et s'affiche à côté du texte de chargement.
- [ ] L'état initial du bouton est restauré si l'appel d'API échoue.

---

## 6. Pièges à éviter

1. **Oublier l'état disabled** : Se contenter d'ajouter l'icône de chargement sans mettre `disabled={loading}` permettrait à l'utilisateur de cliquer plusieurs fois sur le bouton pendant que la génération est lancée. Cela déclencherait des requêtes d'inférence en parallèle sur le serveur Ollama.
2. **SVG mal dimensionné** : S'assurer que le SVG ou l'icône de chargement a des dimensions fixes (ex: `h-5 w-5`) pour éviter que le bouton ne change brusquement de hauteur ou de largeur lors de la transition.
