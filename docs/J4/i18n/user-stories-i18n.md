# User Stories — Epic 14 : Internationalisation (i18n)

> **Équipe 11 · EduTutor IA** · Epic 14 — Internationalisation
> **Critères visés** : CA-J4-1 (intégration story map/backlog), CA-J4-5 (repriorisation MoSCoW)
> **Format critères** : **Given / When / Then** = *Arrange / Act / Assert*
> **Persona de référence** : [Lucia](persona-lucia.md)
> **Rédigé par** : Romain LEFEVRE + Frederick TOUFIK

---

## Epic 14 — Internationalisation

| Champ | Détail |
|---|---|
| **Objectif** | Rendre EduTutor IA utilisable, dans son interface et dans ses contenus générés par IA, par un élève non francophone |
| **Persona** | Lucia (élève internationale) |
| **Portes de sortie** | UI disponible en FR/EN/ES, aucune chaîne codée en dur, taux de quiz générés dans la bonne langue mesuré et contrôlé |
| **Stories** | US-I18N-01 à 03 |

---

### US-I18N-01

**En tant que** Lucia, **je veux** basculer la langue de l'interface (FR/EN/ES) via un sélecteur, **afin de** comprendre l'application sans effort de traduction.

`International · MUST · 8 SP · Risque R-I18N-01`

- **Given** : l'interface utilise une librairie i18n (i18next côté React, framework i18n Django côté back), toutes les chaînes affichées sont externalisées dans des fichiers de langue (aucune chaîne codée en dur dans les composants)
- **When** : Lucia choisit "Español" dans le sélecteur de langue
- **Then** : tous les libellés, boutons et messages d'erreur de l'application basculent en espagnol, et ce choix est mémorisé (profil utilisateur + cookie) pour ses prochaines connexions

### US-I18N-02

**En tant que** Lucia, **je veux** que le quiz généré à partir d'un cours corresponde à la langue de ce cours, **afin de** réviser sans changer de langue en cours de route.

`International · SHOULD · 5 SP · Risque R-I18N-02`

- **Given** : un cours dont la langue est détectée automatiquement ou choisie explicitement à l'upload (ex. `es`), l'option i18n de génération est active
- **When** : Lucia déclenche la génération d'un quiz sur ce cours
- **Then** : le prompt système transmis au LLM impose explicitement la langue cible détectée, le quiz généré est produit dans cette langue, et un contrôle de validation (détection de langue sur la sortie) rejette et régénère si la langue produite ne correspond pas avant tout enregistrement

### US-I18N-03

**En tant que** Lucia, **je veux** que les dates, scores et nombres affichés respectent les conventions de ma langue/région, **afin de** lire mes résultats sans ambiguïté.

`International · COULD · 2 SP`

- **Given** : la locale active de Lucia est `es-ES`
- **When** : une date d'historique, un score ou un pourcentage est affiché n'importe où dans l'application
- **Then** : le format respecte la convention de la locale active (ordre jour/mois, séparateur décimal) sans intervention manuelle

---

## Récapitulatif pour intégration au Product Backlog v4.0

| ID | Epic | Persona | MoSCoW | SP | Risque traité |
|----|------|---------|--------|----|----------------|
| US-I18N-01 | EP-14 | Lucia (international) | MUST | 8 | R-I18N-01 |
| US-I18N-02 | EP-14 | Lucia (international) | SHOULD | 5 | R-I18N-02 |
| US-I18N-03 | EP-14 | Lucia (international) | COULD | 2 | — |

**Total Epic 14 : 3 US · 15 SP.** Aucune n'est engagée dans le Sprint 4 (directive PO : « pas de code bricolé ») — elles sont estimées et priorisées pour intégration en Release 3 par le PO, aux côtés des lots scalabilité et RGAA produits par le reste de l'équipe.
