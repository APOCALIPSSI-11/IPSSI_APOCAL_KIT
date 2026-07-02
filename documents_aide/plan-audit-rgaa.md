# Plan d'audit accessibilité RGAA

> **Équipe 11 · EduTutor IA** · Perturbation J4 — axe Accessibilité
> **Objectif** : préparer la mise en conformité RGAA exigée pour un service public, en traitant le risque [R2](analyse-risques-j4.md) (exposition 9 🔴).
> **Nature du livrable J4** : c'est un **plan** (méthode + planning), pas l'audit lui-même. L'exécution est planifiée en **Release 3**.

---

## 1. Pourquoi

Un service public numérique est **légalement tenu** d'être accessible (RGAA — Référentiel Général d'Amélioration de l'Accessibilité, transposition française des WCAG 2.1 niveau AA). Sans conformité, **l'État ne peut pas déployer EduTutor** : c'est un bloquant, pas une option.

## 2. Périmètre de l'audit

Échantillon représentatif des parcours critiques (pas toutes les pages, mais tous les types d'écran) :

| # | Page / écran | Parcours | Priorité |
|---|--------------|----------|----------|
| 1 | `/signup` + `/login` | S'inscrire / se connecter | P0 |
| 2 | `/upload` | Déposer un cours (PDF / texte) | P0 |
| 3 | `/quiz` (génération + passage) | Générer et répondre à un quiz | P0 |
| 4 | `/resultat` | Consulter le score et les corrections | P0 |
| 5 | `/historique` | Consulter l'historique | P1 |
| 6 | `/dashboard-classe` (enseignant) | Piloter la classe | P1 |
| 7 | Composants transverses (menu, modale, toasts, spinner de génération) | — | P0 |

## 3. Méthode : audit en 2 passes

### Passe 1 — Automatique (dégrossir, ~30 % des critères)

| Outil | Usage | Ce qu'il détecte |
|-------|-------|------------------|
| **axe-core** (extension Axe DevTools) | Scan par page | Contrastes, labels manquants, rôles ARIA, structure |
| **Lighthouse** (Chrome, onglet Accessibility) | Score global par page | Vue d'ensemble + régressions |
| **WAVE** (WebAIM) | Visualisation des erreurs dans la page | Alternatives, hiérarchie des titres |

➡️ Automatisable en CI via `@axe-core/playwright` — voir [US-J4-09](user-stories-j4.md#us-j4-09).

### Passe 2 — Manuelle (les ~70 % que l'automatique ne voit pas)

| Test | Comment | Critère RGAA |
|------|---------|--------------|
| **Navigation clavier** | Parcourir toute la page au clavier seul (Tab / Maj+Tab / Entrée / Échap), sans souris | 12.x (navigation), 7.x (scripts) |
| **Focus visible** | Vérifier qu'on voit toujours l'élément focusé | 10.7 |
| **Lecteur d'écran** | Rejouer chaque parcours avec **NVDA** (Windows, gratuit) ou VoiceOver | 7.x, 9.x, 11.x |
| **Zoom 200 %** | Vérifier qu'aucun contenu n'est tronqué / perdu | 10.4 |
| **Contrastes** | Mesurer les ratios (texte ≥ 4.5:1, gros texte ≥ 3:1) | 3.2, 3.3 |
| **Formulaires** | Chaque champ a un label associé + message d'erreur explicite | 11.x |
| **Images / icônes** | Alternative textuelle pertinente (ou `alt=""` si décoratif) | 1.x |
| **Contenu dynamique** | Spinner de génération, toasts annoncés au lecteur d'écran (`aria-live`) | 7.x |

## 4. Grille de relevé (par anomalie)

Chaque anomalie est consignée ainsi (feuille de calcul ou tableur partagé) :

| Champ | Exemple |
|-------|---------|
| ID | A-012 |
| Page | /quiz |
| Critère RGAA | 12.8 (ordre de tabulation) |
| Description | L'ordre de tabulation saute la question 3 |
| Gravité | Bloquant / Majeur / Mineur |
| Recommandation | Réordonner le DOM ou `tabindex` |
| US de correction | US-J4-06 |
| Statut | À corriger / Corrigé / Vérifié |

## 5. Les 10 critères prioritaires (quick wins RGAA)

À traiter en premier car fort impact / faible coût :

1. Contrastes texte ≥ 4.5:1 (thème sombre à vérifier)
2. Tous les champs de formulaire ont un `<label>` associé
3. Navigation complète au clavier (aucun piège au clavier)
4. Focus toujours visible
5. Ordre de tabulation logique
6. Alternatives textuelles des images / icônes informatives
7. Hiérarchie correcte des titres (`h1`→`h2`→`h3`)
8. Langue de la page déclarée (`lang="fr"`) — lien avec l'i18n
9. Messages d'erreur de formulaire explicites et reliés au champ
10. Contenus dynamiques (spinner, toasts) annoncés via `aria-live`

## 6. Planning (Release 3)

| Étape | Durée | Qui | Sortie |
|-------|-------|-----|--------|
| Passe automatique (7 écrans) | 0,5 j | Romain (QA) | Rapport axe-core / Lighthouse |
| Passe manuelle clavier + NVDA | 1,5 j | Romain + Van Anh | Grille d'anomalies |
| Correction des 10 critères prioritaires | 2 j | Van Anh (FE) | US-J4-06/07 en Done |
| Intégration axe-core en CI | 0,5 j | Frederick | US-J4-09 en Done |
| Rédaction déclaration d'accessibilité | 0,5 j | Hugo | US-J4-08 en Done |
| Contre-audit de validation | 0,5 j | Romain | Taux de conformité chiffré |

## 7. Livrables de l'audit

1. **Grille d'anomalies** priorisée (feuille partagée).
2. **Taux de conformité RGAA** chiffré (nb critères conformes / applicables).
3. **Déclaration d'accessibilité** publiée ([US-J4-08](user-stories-j4.md#us-j4-08)) : taux, dérogations, contact, voie de recours.
4. **Tests axe-core en CI** ([US-J4-09](user-stories-j4.md#us-j4-09)) empêchant les régressions.

## 8. Ce que le PO doit décider

- **Niveau cible** : conformité RGAA « totale » vs « partielle avec plan » pour le premier déploiement.
- **Arbitrage** entre correction immédiate (P0) et dérogations temporaires documentées (R2, action corrective).
- **Critère d'acceptation transverse** : ajouter l'accessibilité à la **Definition of Done** (voir [actions-po-j4.md](actions-po-j4.md)).
