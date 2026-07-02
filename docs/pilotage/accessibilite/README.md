# J4 — Artefacts v3.1 · Volet ACCESSIBILITÉ (Van Anh & Seer)

> **Équipe 11 · EduTutor IA** · Perturbation J4 (passage à l'échelle : adoption nationale + levée de fonds Europe)
> **Lot** : **Accessibilité RGAA** — épic **EP-13**, risque **R2**, persona **Lucia Bernal**.
> **Réalisé par** : Thi Van Anh NGUYEN & Seer MENSAH ASSIAKOLEY.
> **Version** : **v3.1** (révision mineure de la v3.0 = ajout du volet accessibilité).

Ce dossier est **la version consolidée des artefacts qui intègre tout ce qui a été livré (v3.0) + l'accessibilité telle que pensée par Van Anh**. Les axes Scalabilité (EP-12) et i18n (EP-14) restent à ajouter par les autres binômes.

---

## 1. Répartition du travail (volet accessibilité)

| Artefact | Auteur principal | Rôle |
|----------|------------------|------|
| Persona · Customer Journey · Vision Board · Story Map | **Van Anh** | conçoit le volet accessibilité (persona Lucia, cible inclusion, 8ᵉ activité story map) |
| Product Backlog · Release Planning · Sprint Backlog · Registre des risques · Audit · Déclaration | **Seer** | descend l'accessibilité dans le pilotage (EP-13, R2, burndown/burnup) |

Tout le contenu créé pour l'accessibilité est au nom de **Van Anh & Seer**.

## 2. Les 11 livrables

### Domaine Van Anh (pris comme vérité, coquilles corrigées)
| Fichier | Contenu accessibilité | Corrections apportées |
|---------|-----------------------|------------------------|
| `equipe-11-persona-v3.1.docx` | Persona **Lucia Bernal** (§3, lycéenne malvoyante, lecteur d'écran, 100 % clavier) | Renumérotation (Lucia = 3, Établissement = 4, Anti-personas = 5) + identification v3.1 |
| `equipe-11-customer-journey-v3.1.docx` | 4ᵉ parcours **Lucia** (§3) | Renumérotation (Lucia = 3, Établissement = 4, Synthèse = 5) + identification v3.1 |
| `equipe-11-product-vision-board-v3.1.docx` | Cible **inclusion/accessibilité** (§2.3) + signature « service public accessible » | Cibles renumérotées (2.1→2.4), identification v1.1 → v3.1 |
| `equipe-11-story-map-v3.1.xlsx` | 8ᵉ activité **« Accessibilité (RGAA) »** (US-J4-06/07/08/09/13) | Renommée v3.0 → v3.1, colonne complétée (US-J4-07/08) |

### Domaine Seer (v3.0 → v3.1, formules live + graphiques connectés)
| Fichier | Contenu accessibilité | Formules / graphiques |
|---------|-----------------------|------------------------|
| `equipe-11-product-backlog-v3.1.xlsx` | Épic **EP-13** + **US-J4-06/07/08/09/13** (persona Lucia) + **DoD accessibilité** | Totaux `=SUM(...)` (Epics, Backlog) |
| `equipe-11-release-planning-v3.1.xlsx` | Jalon **Release 3 accessibilité** + porte de sortie RGAA | **Burnup** : scope 71 → 89 + **graphique LineChart** lié aux cellules |
| `equipe-11-sprint-backlog-v3.1.xlsx` | Tâches **T-A11Y.1..5** (Sprint 4) | Total `=SUM(E20:E34)` + **burndown** avec **graphique** lié |
| `equipe-11-registre-risques-v3.1.xlsx` | **R2** (Lucia) + R2b/R2c + matrice de criticité | **Non livré dans ce dossier** (source risques à rattacher) |

### Documents d'étude (Van Anh & Seer)
| Fichier | Contenu |
|---------|---------|
| `etude-accessibilite-rgaa.md` | Étude de fond RGAA (13 thématiques, POUR, handicaps, appliquée à EduTutor) |
| `audit-rgaa-final.md` | Rapport d'audit (7 écrans, 14 anomalies, taux ≈ 63 %, cible ≥ 85 %) |
| `declaration-accessibilite.md` | Déclaration d'accessibilité RGAA (modèle légal) |

## 3. Décisions de reconciliation (coquilles & i18n)

- **Persona = Lucia Bernal** (choix de Van Anh) → propagé dans backlog, story map, registre, audit, déclaration, étude (remplace l'ancien « Malik »).
- **Coquilles de numérotation** des docx corrigées (doublons « 4. », sous-titres « 1.x » de Lucia, cible « 2.2 primaire » mal étiquetée, vision en « v1.1 Draft »).
- **i18n (espagnol)** : la dimension bilingue de Lucia est **conservée comme couleur de persona**, mais **non propagée dans l'épic/US accessibilité** (EP-13 reste RGAA). L'internationalisation (EP-14) est le lot d'un autre binôme.

## 4. Cohérence chiffrée (soutenance)

- **EP-13 = 18 SP** (US-J4-06 5 · 07 3 · 08 2 · 09 3 · 13 5) · **2 MUST « rouges » = 8 SP**.
- **Burnup** : 71 → **89 SP** (perturbation absorbée, visible) — *consolidé 3 axes = 135 SP*.
- **Risque R2** : `=P*G` = 3×3 = **9** 🔴 → action préventive **13 pts** priorisée (règle d'or J4).
- **Excel connecté** : totaux et criticité en **formules**, burndown/burnup en **graphiques liés aux cellules** (dynamiques).

## 5. Reste à faire
- Ajouter/rattacher le fichier `equipe-11-registre-risques-v3.1.xlsx` pour boucler la traçabilité du risque R2.
- Finaliser les US restantes du lot EP-13 selon le backlog ci-dessous.

## 6. Suivi backlog EP-13 (statut des US)

| US | Intitulé court | Statut actuel | Commentaire |
|----|----------------|---------------|-------------|
| US-J4-06 | Navigation clavier + lecteur d'écran | Partiellement implémentée | Labels et `lang` déjà en place, skip-link/ARIA dynamique à finaliser |
| US-J4-07 | Contrastes + zoom + non-couleur-seule | Partiellement implémentée | Dashboard table OK, reste contrastes globaux + focus uniforme |
| US-J4-08 | Déclaration d'accessibilité | Livrée (brouillon) | Document prêt, placeholders à finaliser avant publication |
| US-J4-09 | Audit axe-core en CI | À faire | Pas encore intégré dans la pipeline |
| US-J4-13 | Commande vocale | À faire | Hors MVP, prévu en itération ultérieure |

## 7. Reste à faire
- Fusion avec les axes **scalabilité** (EP-12) et **i18n** (EP-14) des autres binômes → artefacts consolidés.
- *(facultatif)* incrément technique T-A11Y.5 sur `frontend/src/`.
- Mise à jour du **Miro**.
