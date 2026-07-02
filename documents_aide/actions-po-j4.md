# Actions Product Owner — Perturbation J4

> **Équipe 11 · EduTutor IA** · Sprint 4
> **Objectif** : traduire la perturbation J4 en décisions produit — repriorisation, définition de la Release 3, extension des critères de qualité. C'est le rôle du **PO** (appuyé par le SM), pas de l'équipe technique.
> **Voir aussi** : [Brief J4](README.md) · [Analyse de risques](analyse-risques-j4.md) · [User stories J4](user-stories-j4.md)

---

## 1. Décision n°1 — Ne pas coder dans la panique

Conformément à la directive du PO (*« pas de code bricolé »*), les 3 axes ne sont **pas** développés dans le Sprint 4. Ils sont :
1. **transformés en user stories estimées** (13 US, ~64 SP), critères en **Given/When/Then** → [Product Backlog v4.0](../../cadrage/artefacts/equipe-11-product-backlog-v4.0.xlsx) ;
2. **priorisés** selon l'exposition au risque ;
3. **regroupés dans une Release 3** planifiée.

## 2. Décision n°2 — Ouvrir la Release 3 « Passage à l'échelle national »

| Attribut | Valeur |
|----------|--------|
| **Nom** | Release 3 — Passage à l'échelle national & européen |
| **Objectif (goal)** | Rendre EduTutor déployable comme service public : tenir la charge nationale, être conforme RGAA, être multilingue |
| **Épics** | EP-12 Scalabilité · EP-13 Accessibilité RGAA · EP-14 Internationalisation |
| **Portes de sortie** | Tests de charge OK (seuil connu) · taux RGAA cible atteint · UI FR/EN/ES · SUS ≥ 75 |
| **Ce qui reste hors R3** | US-J4-12 (formats localisés, COULD) → R3+ |

## 3. Décision n°3 — Repriorisation MoSCoW du backlog

Ordre de priorité imposé par l'**exposition au risque** (les cases rouges d'abord) :

| Rang | US | Axe | MoSCoW | SP | Risque traité |
|:---:|----|-----|--------|:--:|---------------|
| 1 | US-J4-01 File asynchrone | Scalabilité | MUST | 8 | R1 (9) |
| 2 | US-J4-03 Tests de charge | Scalabilité | MUST | 5 | R3 (6) |
| 3 | US-J4-06 Clavier + lecteur d'écran | RGAA | MUST | 5 | R2 (9) |
| 4 | US-J4-07 Contrastes + zoom | RGAA | MUST | 3 | R2 (9) |
| 5 | US-J4-10 Bascule de langue | i18n | MUST | 8 | R4 (6) |
| 6 | US-J4-04 Scaling horizontal | Scalabilité | SHOULD | 8 | R5 |
| 7 | US-J4-05 Observabilité | Scalabilité | SHOULD | 5 | R6 |
| 8 | US-J4-02 Cache quiz | Scalabilité | SHOULD | 5 | R5 |
| 9 | US-J4-09 Audit a11y en CI | RGAA | SHOULD | 3 | R2 |
| 10 | US-J4-08 Déclaration RGAA | RGAA | SHOULD | 2 | R2 |
| 11 | US-J4-11 Quiz dans la langue du cours | i18n | SHOULD | 5 | R7 |
| 12 | US-J4-13 Commande vocale (accessibilité) | RGAA | COULD | 5 | R2 |
| 13 | US-J4-12 Formats localisés | i18n | COULD | 2 | — |

**1er incrément R3 (MUST, cases rouges)** = US-J4-01, 03, 06, 07, 10 → **29 SP**.
**Vérification de non-régression** : ces ajouts ne cassent ni les priorités ni les critères des US livrées — voir [impact-us-existantes.md](impact-us-existantes.md).

## 4. Décision n°4 — Étendre la Definition of Done (qualité à l'échelle)

Les nouvelles exigences deviennent **transverses** : toute US livrée en Release 3 doit désormais respecter la DoD étendue.

| Axe | Critère ajouté à la DoD |
|-----|-------------------------|
| Accessibilité | Aucune violation axe-core critique · navigable au clavier · contrastes ≥ 4.5:1 |
| i18n | Aucune chaîne codée en dur (toutes externalisées) · rendu vérifié en EN |
| Performance | Réponse sous charge nominale · endpoints lourds passés en asynchrone |
| Observabilité | Métrique + log structuré sur tout nouvel endpoint critique |

Et la **Definition of Ready** (DoR) : une US n'entre en sprint que si son impact a11y / i18n / charge est identifié.

## 5. Décision n°5 — Mettre à jour les artefacts (v4.0)

| Artefact | Mise à jour J4 |
|----------|----------------|
| **Product Vision Board** | Ajouter la cible « service public national + Europe » et les 3 axes comme objectifs qualité |
| **Personas** | Ajouter Malik (handicap), Sofia (international), Nadia (SRE) |
| **Story Map** | Bande transverse « Passage à l'échelle » (a11y/i18n/scalabilité) au-dessus des activités |
| **Product Backlog** | +3 épics, +12 US (fait, v4.0) |
| **Release Planning** | +Release 3 + burnup montrant la montée de scope J4 |
| **Sprint Backlog** | Bloc perturbation J4 (management) dans le Sprint 4 (fait, plan v4.0) |
| **Registre des risques** | Nouveau (fait) |

## 6. Décision n°6 — Piloter par les faits

- **Burndown Sprint 4** : suivre le reste-à-faire du bloc J4 + clôture R2.
- **Burnup projet** : la courbe de **scope total monte** de +59 SP à J4 — c'est la **preuve visuelle** que le backlog a absorbé la perturbation. À présenter au jury.

## 7. Ce que le PO annonce en revue de sprint

> « Le succès nous impose 3 axes. Nous ne les codons pas dans la panique : nous les avons **transformés en 13 user stories estimées (64 SP)** — critères en Given/When/Then —, **priorisées par le risque** (matrice probabilité × impact), et **planifiées en Release 3** avec des portes de sortie mesurables (tests de charge, conformité RGAA, SUS ≥ 75). Nous avons vérifié que **rien de livré n'est cassé** (analyse d'impact). L'audit et les tests utilisateurs sont **cadrés** (méthode + planning). Voici le burnup : le périmètre a augmenté, le pilotage suit. »

## 8. Checklist PO (à cocher en soutenance)

- [x] Backlog repriorisé par le risque
- [x] Release 3 définie (goal + portes de sortie)
- [x] DoR/DoD étendues (a11y, i18n, perf, observabilité)
- [x] Personas élargis (handicap, international, SRE)
- [x] Plan d'audit RGAA cadré → [plan-audit-rgaa.md](plan-audit-rgaa.md)
- [x] Plan de tests utilisateurs cadré → [plan-tests-utilisateurs.md](plan-tests-utilisateurs.md)
- [ ] Burndown/burnup actualisés (artefacts v4.0)
