# T-23.2 — Barre de progression de génération dédiée (UI)

> **User Story** : US-23 — *En tant que Léa, je veux voir une progression visuelle de la génération du quiz afin de savoir que le système travaille et d'estimer le temps d'attente.*
> **Sprint** : Sprint 1
> **Estimation** : 2h
> **Assigné** : Azeddine AMARI
> **Statut** : Todo

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de créer un composant visuel de barre de progression (`ProgressBar`) à afficher pendant la phase de génération du quiz. Étant donné que la génération locale (sur CPU standard) peut prendre de 1 à 3 minutes, une simple icône de chargement ne suffit pas à rassurer l'utilisateur. 

Le composant simulera une progression fluide (croissance progressive) combinée à des messages d'étapes indicatifs pour rendre l'attente plus interactive.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| `frontend/src/components/ProgressBar.tsx` | Nouveau composant réutilisable de barre de progression | **NEW** |
| [frontend/src/pages/UploadPage.tsx](../../../../frontend/src/pages/UploadPage.tsx) | Page d'importation de cours | **OUI** |

---

## 3. Spécifications techniques

### 3.1 Fonctionnement de la simulation de progression
Étant donné que le backend effectue un appel synchrone bloquant vers Ollama, le frontend ne connaît pas l'état d'avancement exact du serveur. La barre doit donc simuler une progression réaliste :
- La progression démarre à `0%`.
- Elle avance automatiquement toutes les 500 ms (via un intervalle React) :
  - De `0%` à `50%` : progression rapide (+2% par seconde).
  - De `50%` à `85%` : progression plus lente (+0.5% par seconde).
  - De `85%` à `95%` : progression très lente (+0.1% par seconde).
  - La progression se bloque à `95%` et attend que l'appel d'API se termine pour passer instantanément à `100%` et rediriger l'utilisateur.

### 3.2 Messages d'étapes indicatifs
Changer le texte d'étape en fonction du pourcentage simulé pour faire patienter l'utilisateur :
- **0% à 25%** : *« 📥 Analyse du cours et extraction du texte... »*
- **25% à 60%** : *« 🤖 Inférence LLM locale et formulation des questions... »*
- **60% à 85%** : *« ✍️ Rédaction des distracteurs et choix pédagogiques... »*
- **85% à 95%** : *« 🔍 Validation de la structure JSON et finalisation... »*

### 3.3 Rendu de la barre
Le composant prend en entrée la variable `active` (boolean).
- Conteneur de fond gris clair, bords arrondis.
- Barre interne colorée (dégradé indigo/violet `bg-gradient-to-r from-indigo-500 to-purple-600`), largeur dynamique basée sur le pourcentage d'avancement.
- Effet de pulsation ou de transition fluide CSS (`transition-all duration-500 ease-out`).

---

## 4. Étapes détaillées

### Étape 1 — Créer le composant ProgressBar
Créer le fichier `frontend/src/components/ProgressBar.tsx` :
```tsx
import { useState, useEffect } from 'react';

export default function ProgressBar({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState("Démarrage...");

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        let increment = 1;
        if (prev < 50) increment = 2.5;
        else if (prev < 80) increment = 0.8;
        else increment = 0.1;
        return Math.min(prev + increment, 95);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (progress < 25) setStepText("📥 Analyse du cours et extraction du texte...");
    else if (progress < 60) setStepText("🤖 Inférence LLM locale et formulation des questions (cette étape prend du temps)...");
    else if (progress < 85) setStepText("✍️ Rédaction des distracteurs et choix pédagogiques...");
    else setStepText("🔍 Validation du JSON et enregistrement du quiz...");
  }, [progress]);

  if (!active) return null;

  return (
    <div className="space-y-2 mt-4 p-4 bg-slate-50 border rounded-lg">
      <div className="flex justify-between text-sm font-medium text-slate-700">
        <span>{stepText}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
```

### Étape 2 — Intégrer le composant dans UploadPage
Importer `ProgressBar` dans `UploadPage.tsx` et le placer directement sous le bouton submit de génération, lié à l'état `loading`.

---

## 5. Definition of Done

- [ ] Le composant `ProgressBar` est créé dans un fichier autonome.
- [ ] La barre avance de manière progressive et non linéaire lorsque le processus de génération est en cours.
- [ ] Les messages d'étapes s'adaptent de manière logique selon l'avancement simulé.
- [ ] La barre s'arrête à 95% et ne dépasse jamais 100% tant que la promesse d'API n'est pas résolue.
- [ ] La barre disparaît ou est réinitialisée en cas d'erreur de requête d'API.

---

## 6. Pièges à éviter

1. **Effets de bord d'intervalles React** : Veiller à retourner la fonction de nettoyage `clearInterval` dans le `useEffect` pour éviter les fuites de mémoire (le timer continuant de tourner en tâche de fond après démontage du composant).
2. **Transition brute** : Ne pas utiliser de changements brutaux de largeur sans transitions CSS. Utiliser `transition-all duration-500` pour lisser les sauts de pourcentage.
