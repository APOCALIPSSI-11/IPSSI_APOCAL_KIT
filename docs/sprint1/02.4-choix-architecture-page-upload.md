# ADR 0002: Choix d'architecture pour la page d'upload et saisie de cours

- **Statut**: Accepté (Sprint 1)
- **Date**: 2026-06-30
- **Décideurs**: Équipe 11 (Frontend + PO + Scrum Master)
- **Contexte Sprint**: T-02.4 — Page React `/upload` (dropzone + textarea + sélecteur méthode + appel API)

## Contexte

Nous devons livrer une interface réactive pour la persona principale (Léa) permettant deux modes d'entrée exclusifs:

1. **Upload PDF** (taille maximale: **5 Mo**)
2. **Saisie texte** (minimum: **200 caractères**)

Cette entrée alimente le backend Django DRF via `POST /api/courses` (multipart/form-data), pour déclencher le pipeline de génération vers le LLM local (Ollama).  
Contraintes de projet: **local-first**, faible complexité, temps Sprint 1 limité, robustesse UX face à la latence de génération.

---

## Décision

### A. Gestion d'état locale (React Hooks `useState`) — **adoptée**
Nous utilisons un état local par composant (`useState`) pour:
- le mode d'entrée (`pdf` vs `texte`),
- les champs du formulaire,
- les erreurs de validation,
- l'état de soumission (`loading`).

**Justification**:
- Le périmètre est local à la page `/upload`.
- Aucun besoin de partage transverse complexe avec d'autres écrans.
- Réduit la dette technique et le coût cognitif (principe **KISS**).
- Évite l'introduction prématurée de Redux/Zustand en Sprint 1.

---

### B. Drag & Drop natif HTML5 — **adopté**
Nous implémentons le drag & drop avec l'API native (`dragenter`, `dragover`, `dragleave`, `drop`) au lieu de `react-dropzone`.

**Justification**:
- Objectif de bundle léger et démarrage rapide.
- Alignement avec la stratégie local-first, dépendances minimales.
- Surface fonctionnelle requise simple (1 fichier PDF, pas d'upload avancé multi-fichiers).

---

### C. Validation défensive côté client miroir backend — **adoptée**
La page applique des contrôles immédiats avant appel API:
- garde-fou taille PDF (`<= 5 Mo`),
- garde-fou texte (`>= 200 caractères`),
- feedback explicite (messages d'erreur + compteur de caractères).

**Justification**:
- Réduit les appels réseau inutiles.
- Améliore l'expérience utilisateur (retour instantané).
- Aligne frontend et backend pour limiter les incohérences de contrat.

---

### D. Gestion explicite de latence (loading/progression) — **adoptée**
La page affiche un état de traitement explicite pendant l'appel à l'API:
- bouton désactivé,
- indicateur visuel de progression (barre/animation),
- message de patience contextualisé (traitement local Ollama).

**Justification**:
- Le temps de génération local peut varier selon machine/modèle.
- Réduit l'incertitude et les abandons pendant attente.
- Rend le comportement prévisible pour Léa.

---

## Conséquences

### Positives
- Architecture front simple, lisible et maintenable.
- Bundle maîtrisé (pas de dépendance dropzone supplémentaire).
- UX plus robuste grâce aux validations immédiates et au feedback de latence.
- Sécurité opérationnelle améliorée (moins d'entrées invalides envoyées).

### Négatives / Risques
- Le drag & drop natif demande plus de code artisanal (gestion fine des événements).
- Risque de cas limites PDF (fichier corrompu, MIME ambigu, extraction backend échouée).
- L'indicateur de progression reste potentiellement “indéterminé” si le backend ne renvoie pas de progression granulaire.

---

## Alternatives considérées

1. **Redux/Zustand dès Sprint 1**: rejeté (surdimensionné pour un formulaire local).
2. **`react-dropzone`**: rejeté (dépendance supplémentaire, bénéfice limité au scope actuel).
3. **Validation uniquement backend**: rejeté (UX dégradée, appels inutiles).
4. **Aucun indicateur de latence**: rejeté (anxiété utilisateur, risque d'abandon).

---

## Plan de suivi

- Sprint 1: implémentation complète avec tests UI (mode, validation, soumission).
- Sprint 2: monitorer erreurs réelles d'upload PDF et ajuster messages.
- Sprint 2+: évaluer besoin d'extraction état global uniquement si la complexité cross-page augmente.