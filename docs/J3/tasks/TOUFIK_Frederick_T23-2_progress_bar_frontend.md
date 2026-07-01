# T-23.2 — Barre de progression de génération dédiée (UI)

> **User Story** : US-23 — *En tant que Léa, je veux voir une progression visuelle de la génération du quiz afin de savoir que le système travaille et d'estimer le temps d'attente.*
> **Sprint** : Sprint 2
> **Estimation** : 2h
> **Assigné** : Frederick TOUFIK
> **Statut** : Done

---

## 1. Objectif de la tâche

Créer un composant React `ProgressBar` à afficher pendant la génération du quiz. La génération locale (CPU standard) pouvant prendre 1 à 3 minutes, le spinner actuel (`⏳ animate-spin` sur le bouton) ne suffit pas à rassurer l'utilisateur et crée un moment de décrochage identifié sur le customer journey de Léa (étape 3).

Le composant simulera une progression fluide et non linéaire combinée à des messages d'étapes indicatifs pour rendre l'attente active et lisible.

**Dépendance** : T-23.1 (Hugo HAVET) est Done — le spinner de base existe déjà sur `UploadPage.tsx`. Cette tâche ajoute la barre dédiée en complément ou en remplacement.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| `frontend/src/components/ProgressBar.tsx` | Nouveau composant réutilisable de barre de progression | **CRÉER** |
| [frontend/src/pages/UploadPage.tsx](../../../frontend/src/pages/UploadPage.tsx) | Page d'upload — contient déjà l'état `loading` et le bouton submit | **OUI** (intégrer `ProgressBar`) |

---

## 3. Spécifications techniques

### 3.1 Simulation de progression non linéaire

Le backend effectue un appel synchrone bloquant vers Ollama : le frontend ne connaît pas l'avancement exact. La barre simule une progression réaliste via un `setInterval` React de 500 ms :

| Plage | Incrément par tick | Comportement perçu |
|---|---|---|
| 0 % → 50 % | +2,5 % | Progression rapide rassurante |
| 50 % → 80 % | +0,8 % | Ralentissement progressif |
| 80 % → 95 % | +0,1 % | Plafonnement visible |
| 95 % | bloqué | Attente réponse API |
| Réponse reçue | → 100 % | Passage immédiat, redirect |

### 3.2 Messages d'étapes

| Progression | Message affiché |
|---|---|
| 0 % – 25 % | `📥 Analyse du cours et extraction du texte...` |
| 25 % – 60 % | `🤖 Inférence LLM locale et formulation des questions (cette étape prend du temps)...` |
| 60 % – 85 % | `✍️ Rédaction des distracteurs et choix pédagogiques...` |
| 85 % – 95 % | `🔍 Validation du JSON et enregistrement du quiz...` |

### 3.3 API du composant

```tsx
<ProgressBar active={loading} />
```

- `active: boolean` — la barre est montée/réinitialisée sur ce flag.
- Quand `active` passe à `false` (erreur ou succès), `progress` se remet à 0.
- Si `active` est `false` au rendu : le composant retourne `null` (invisible).

### 3.4 Rendu

```tsx
import { useState, useEffect } from 'react';

export default function ProgressBar({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('Démarrage...');

  useEffect(() => {
    if (!active) { setProgress(0); return; }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        let inc = 2.5;
        if (prev >= 50) inc = 0.8;
        if (prev >= 80) inc = 0.1;
        return Math.min(prev + inc, 95);
      });
    }, 500);
    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (progress < 25) setStepText('📥 Analyse du cours et extraction du texte...');
    else if (progress < 60) setStepText('🤖 Inférence LLM locale et formulation des questions (cette étape prend du temps)...');
    else if (progress < 85) setStepText('✍️ Rédaction des distracteurs et choix pédagogiques...');
    else setStepText('🔍 Validation du JSON et enregistrement du quiz...');
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

---

## 4. Étapes détaillées

### Étape 1 — Créer le composant
Créer `frontend/src/components/ProgressBar.tsx` avec le code ci-dessus.

### Étape 2 — Intégrer dans UploadPage
Dans `frontend/src/pages/UploadPage.tsx`, importer et placer `<ProgressBar active={loading} />` directement sous le bouton submit, lié à l'état `loading` existant.

---

## 5. Definition of Done

- [x] Le fichier `frontend/src/components/ProgressBar.tsx` est créé.
- [x] La barre avance de manière non linéaire (rapide puis lente) quand `active={true}`.
- [x] Les messages d'étapes changent selon la progression simulée.
- [x] La barre se bloque à 95 % et ne dépasse jamais 100 % avant la réponse API.
- [x] La barre disparaît (retour à null) et se réinitialise à 0 % quand `active={false}`.
- [x] Pas de fuite mémoire : `clearInterval` appelé dans le return du `useEffect`.

---

## 6. Pièges à éviter

1. **Fuite mémoire sur l'intervalle** : Le `useEffect` doit retourner `() => clearInterval(interval)`. Sans ce nettoyage, l'intervalle continue de tourner après démontage du composant et peut déclencher des `setState` sur un composant mort (warning React).
2. **Transition CSS absente** : Sans `transition-all duration-500`, la largeur de la barre saute brutalement toutes les 500 ms. La transition CSS lisse visuellement les incréments discrets.
3. **Condition `active` inversée** : Vérifier que `if (!active) return null` est bien en fin de hook (après les `useEffect`), pas avant — les hooks React ne peuvent pas être conditionnels.