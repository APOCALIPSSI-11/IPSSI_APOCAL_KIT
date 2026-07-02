# Audit d'accessibilité RGAA — EduTutor IA (rapport final)

> **Équipe 11 · EduTutor IA** · Perturbation J4 — volet **Accessibilité**
> **Binôme accessibilité (Van Anh & Seer)** : Thi Van Anh NGUYEN + Seer MENSAH ASSIAKOLEY
> **Date** : 02/07/2026 · **Version** : 1.0 (baseline) · **Référentiel** : RGAA 4.1 (WCAG 2.1 AA)
> **Objectif** : traiter le risque **R2** (non-conformité RGAA → interdiction de déploiement en service public, exposition **9 🔴**).
> **Documents liés** : [README.md](README.md) · [etude-accessibilite-rgaa.md](etude-accessibilite-rgaa.md) · [declaration-accessibilite.md](declaration-accessibilite.md)

---

## 1. Contexte et cadre légal

Le passage à l'échelle nationale (adoption par l'État) fait d'EduTutor un **service public numérique**. La loi n° 2005-102 (art. 47) et le décret n° 2019-768 imposent la conformité au **RGAA** (transposition française des WCAG 2.1 niveau AA). **Sans conformité, l'État ne peut pas déployer** : c'est un bloquant légal, matérialisé par le risque **R2** (P=3 × I=3 = **9**).

Ce document est le **rapport d'audit baseline** : il établit l'état initial de l'accessibilité, chiffre un taux de conformité de départ et priorise les corrections. L'exécution des corrections est planifiée en **Release 3** (US-J4-06/07/08/09/13, épic EP-13).

## 2. Périmètre audité

Échantillon représentatif des parcours critiques (tous les types d'écran, pas toutes les pages) :

| # | Page / écran | Composant frontend | Parcours | Priorité |
|---|--------------|--------------------|----------|----------|
| 1 | `/signup` + `/login` | `SignupPage.tsx`, `LoginPage.tsx` | S'inscrire / se connecter | P0 |
| 2 | `/upload` | `UploadPage.tsx` | Déposer un cours (PDF / texte) | P0 |
| 3 | `/quiz` (génération + passage) | `QuizPage.tsx`, `ProgressBar.tsx` | Générer et répondre à un quiz | P0 |
| 4 | `/resultat` | `QuizPage.tsx` (résultats) | Consulter le score et les corrections | P0 |
| 5 | `/historique` | `HistoryPage.tsx` | Consulter l'historique | P1 |
| 6 | `/dashboard-classe` | `DashboardPage.tsx` | Piloter la classe (enseignant) | P1 |
| 7 | Composants transverses | `Layout.tsx`, menu, modale, toasts, spinner | — | P0 |

## 3. Méthode : audit en 2 passes

### Passe 1 — Automatique (~30 % des critères)
- **axe-core** (Axe DevTools) : contrastes, labels manquants, rôles ARIA, structure.
- **Lighthouse** (onglet Accessibility) : score global par page + repérage des régressions.
- **WAVE** (WebAIM) : alternatives textuelles, hiérarchie des titres.

### Passe 2 — Manuelle (~70 % que l'automatique ne voit pas)
- **Navigation clavier seule** (Tab / Maj+Tab / Entrée / Échap), sans souris — RGAA 12.x / 7.x.
- **Focus visible** — RGAA 10.7.
- **Lecteur d'écran** NVDA (Windows) — RGAA 7.x / 9.x / 11.x.
- **Zoom 200 %** sans perte de contenu — RGAA 10.4.
- **Contrastes** (texte ≥ 4.5:1 ; gros texte ≥ 3:1) — RGAA 3.2 / 3.3.
- **Formulaires** : label associé + message d'erreur explicite — RGAA 11.x.
- **Alternatives** des images / icônes — RGAA 1.x.
- **Contenu dynamique** (spinner, toasts) annoncé via `aria-live` — RGAA 7.x.

## 4. Grille d'anomalies (relevé baseline)

> Gravité : **Bloquant** (empêche l'usage), **Majeur** (gêne forte), **Mineur** (confort). Statut initial : *À corriger*.

| ID | Page | Critère RGAA | Description de l'anomalie | Gravité | Recommandation | US | Statut |
|----|------|--------------|---------------------------|---------|----------------|----|--------|
| A-01 | `/quiz` | 12.8 / 7.1 | Les options de QCM ne sont pas navigables ni sélectionnables au clavier seul (piège au clavier) | 🔴 Bloquant | `role="radiogroup"` + gestion flèches/Entrée, éléments focusables | US-J4-06 | À corriger |
| A-02 | `/quiz` | 7.4 | Le spinner / la barre de progression de génération n'est pas annoncé au lecteur d'écran (paraît planté) | 🔴 Bloquant | `aria-live="polite"` + `role="status"` sur `ProgressBar.tsx` | US-J4-06 | À corriger |
| A-03 | `/login` `/signup` | 11.1 | Champs de formulaire sans `<label>` associé (placeholder seul) | 🔴 Bloquant | `<label for>` explicite sur chaque champ | US-J4-06 | Corrigé |
| A-04 | `/signup` | 11.10 | Messages d'erreur non reliés au champ ni annoncés | 🟠 Majeur | `aria-describedby` + `aria-invalid` + `role="alert"` | US-J4-06 | À corriger |
| A-05 | Transverse (thème sombre) | 3.2 | Contraste texte secondaire ~3.1:1 (< 4.5:1) sur fond sombre | 🟠 Majeur | Ajuster la palette `ThemeContext.tsx` (≥ 4.5:1) | US-J4-07 | À corriger |
| A-06 | `/resultat` | 3.3 | Bonnes/mauvaises réponses signalées par la couleur seule (vert/rouge) | 🟠 Majeur | Ajouter icône + texte (« Correct »/« Incorrect »), pas que la couleur | US-J4-07 | À corriger |
| A-07 | Transverse | 10.7 | Focus clavier peu ou pas visible sur boutons et liens | 🟠 Majeur | `:focus-visible` avec contour ≥ 2px contrasté | US-J4-06 | À corriger |
| A-08 | `/upload` | 1.1 | Icônes d'action (supprimer, info) sans alternative textuelle | 🟠 Majeur | `aria-label` ou texte visuellement masqué | US-J4-06 | À corriger |
| A-09 | Transverse | 12.1 | Pas de lien d'évitement (« Aller au contenu ») | 🟠 Majeur | Skip-link en tête de `Layout.tsx` | US-J4-06 | À corriger |
| A-10 | Transverse | 8.3 | Langue de la page non déclarée (`<html lang>`) | 🟠 Majeur | `lang="fr"` sur `<html>` (lien avec i18n) | US-J4-06 | Corrigé |
| A-11 | `/dashboard-classe` | 1.1 / 5.x | Graphiques (KPI) sans alternative textuelle / tableau équivalent | 🟠 Majeur | Fournir un résumé texte + tableau de données | US-J4-07 | Partiellement corrigé |
| A-12 | `/quiz` `/resultat` | 9.1 | Hiérarchie des titres incohérente (saut de `h1` à `h3`) | 🟡 Mineur | Rétablir `h1 → h2 → h3` | US-J4-07 | À corriger |
| A-13 | Transverse (modale) | 7.x | Modale ne piège pas le focus et n'est pas fermable au clavier (Échap) | 🟠 Majeur | Focus trap + fermeture Échap + retour focus déclencheur | US-J4-06 | À corriger |
| A-14 | `/historique` | 10.4 | Tableau tronqué / défilement perdu au zoom 200 % | 🟡 Mineur | Layout responsive, pas de largeur fixe en px | US-J4-07 | À corriger |

**14 anomalies** relevées : **3 bloquantes**, **9 majeures**, **2 mineures**.

## 5. Taux de conformité (baseline)

Estimation sur les **106 critères RGAA applicables** au périmètre (échantillon des 7 écrans) :

| Indicateur | Valeur baseline | Cible Release 3 |
|------------|:---------------:|:---------------:|
| Critères conformes | ~67 / 106 | ≥ 90 / 106 |
| **Taux de conformité RGAA** | **≈ 63 %** (non conforme) | **≥ 85 %** (partiellement conforme, seuil de déploiement) → viser 100 % |
| Anomalies bloquantes | 3 | **0** (prérequis absolu) |

> Un service public doit viser la **conformité totale**. Le seuil de **déploiement minimal** retenu avec le PO est **≥ 85 %** avec **0 anomalie bloquante** et un plan de mise en conformité daté pour le reste (dérogations documentées).

## 6. Du constat à la correction (traçabilité backlog)

Les corrections sont **descendues dans le Product Backlog v3.1** (règle d'or J4 : un risque devient du pilotage quand il est un item estimé et priorisé).

| US | Intitulé | MoSCoW | SP | Anomalies couvertes |
|----|----------|--------|:--:|---------------------|
| **US-J4-06** | Navigation clavier + lecteur d'écran (labels, ARIA, focus, skip-link, modale, `lang`) | MUST | 5 | A-01, A-02, A-03, A-04, A-07, A-08, A-09, A-10, A-13 |
| **US-J4-07** | Contrastes conformes + zoom 200 % + non-couleur-seule + titres | MUST | 3 | A-05, A-06, A-11, A-12, A-14 |
| **US-J4-08** | Déclaration d'accessibilité RGAA | SHOULD | 2 | (obligation légale, cf. [déclaration](declaration-accessibilite.md)) |
| **US-J4-09** | Audit axe-core automatisé en CI (non-régression) | SHOULD | 3 | prévention de toutes les régressions |
| **US-J4-13** | Commande vocale (accessibilité avancée) | COULD | 5 | confort avancé (R3+) |

**Total : 18 SP** (dont **8 SP MUST** en tête de Release 3). Aucune n'est engagée dans le Sprint 4 (directive PO : « pas de code bricolé »).

## 7. Planning d'exécution (Release 3)

| Étape | Durée | Qui | Sortie |
|-------|-------|-----|--------|
| Passe automatique (7 écrans) | 0,5 j | Romain (QA) | Rapport axe-core / Lighthouse |
| Passe manuelle clavier + NVDA | 1,5 j | Romain + Van Anh | Grille d'anomalies vérifiée |
| Correction des critères prioritaires | 2 j | Van Anh (FE) | US-J4-06/07 en Done |
| Intégration axe-core en CI | 0,5 j | Frederick | US-J4-09 en Done |
| Rédaction déclaration d'accessibilité | 0,5 j | Hugo | US-J4-08 en Done |
| Contre-audit de validation | 0,5 j | Romain | Taux de conformité chiffré ≥ 85 % |

## 8. Livrables de l'audit

1. ✅ **Grille d'anomalies** priorisée (§4 — 14 anomalies).
2. ✅ **Taux de conformité** baseline chiffré (§5 — ≈ 63 %, cible ≥ 85 %).
3. ✅ **Traçabilité backlog** vers EP-13 (§6).
4. ➡️ **Déclaration d'accessibilité** : voir [declaration-accessibilite.md](declaration-accessibilite.md) (US-J4-08).
5. ➡️ **axe-core en CI** : à implémenter en Release 3 (US-J4-09).

## 9. Décisions demandées au PO

- **Niveau cible** du premier déploiement : conformité « totale » **vs** « partielle ≥ 85 % + plan daté ».
- **Arbitrage** correction immédiate (P0/bloquant) **vs** dérogations temporaires documentées (R2, action corrective).
- **DoD étendue** : l'accessibilité est ajoutée à la Definition of Done (fait — voir Product Backlog v3.1, feuille *DoR & DoD*).
