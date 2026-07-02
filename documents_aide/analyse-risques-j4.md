# Analyse de risques J4 — Passage à l'échelle

> **Équipe 11 · EduTutor IA** · Sprint 4 (02/07/2026)
> **Livrable perturbation J4** : registre + matrice de criticité (≥ 5 risques), actions préventives **estimées et priorisées**, descendues dans le backlog.
> **Artefact associé** : [equipe-11-registre-risques-v4.0.xlsx](../../cadrage/artefacts/equipe-11-registre-risques-v4.0.xlsx)
> **Voir aussi** : [Brief J4](README.md) · [Rappel pilotage/risques](rappel-j4-pilotage-risques.md) · [User stories J4](user-stories-j4.md)

---

## Méthode (barème officiel J4)

> **Exposition = Probabilité × Impact.** On traite **d'abord les cases rouges** (exposition ≥ 6).

| Probabilité (P) | | Impact / Gravité (I) | |
|---|---|---|---|
| 1 | faible | 1 | mineur |
| 2 | moyenne | 2 | majeur |
| 3 | élevée | 3 | critique / bloquant |

**Exposition (criticité) = P × I** → valeurs possibles : 1, 2, 3, 4, 6, 9.

| Exposition | Niveau | Traitement |
|---|---|---|
| **6 – 9** | 🔴 Critique | Action préventive prioritaire, en tête de Release 3 |
| **3 – 4** | 🟠 Modéré | Action préventive planifiée / surveillance active |
| **1 – 2** | 🟢 Faible | Accepté, surveillé |

**Règle d'or (rappel J4)** : *un risque identifié sans action préventive dans le backlog n'est qu'une inquiétude ; un risque traduit en **item estimé et priorisé** devient du **pilotage**.* → chaque risque significatif descend dans le [Product Backlog v4.0](../../cadrage/artefacts/equipe-11-product-backlog-v4.0.xlsx).

**Catégories couvertes** : technique · conformité · i18n · humain · externe.

---

## 1. Registre des risques (cotation)

| ID | Risque | Catégorie | P | I | **Expo** | Niveau | Tendance | Responsable |
|----|--------|-----------|:-:|:-:|:--------:|--------|:--------:|-------------|
| **R1** | Effondrement du service sous la charge nationale | Technique / scalabilité | 3 | 3 | **9** | 🔴 | ↑ | Frederick (BE) |
| **R2** | Non-conformité RGAA → interdiction de déploiement en service public | Conformité | 3 | 3 | **9** | 🔴 | → | Van Anh (FE) + Romain (QA) |
| **R3** | Point de rupture inconnu (découvert en production) | Technique | 2 | 3 | **6** | 🔴 | ↑ | Romain (QA) |
| **R4** | Interface mono-langue → expansion européenne bloquée | i18n | 3 | 2 | **6** | 🔴 | → | Van Anh (FE) |
| **R8** | Équipe réduite ne tient pas la charge Release 3 | Humain | 3 | 2 | **6** | 🔴 | → | Seer (SM) |
| **R5** | Coût / latence LLM explosent à l'échelle | Technique / externe | 2 | 2 | **4** | 🟠 | ↑ | Frederick (BE) |
| **R6** | Panne silencieuse en prod (pas de supervision) | Technique | 2 | 2 | **4** | 🟠 | → | Frederick (BE) |
| **R7** | Quiz généré dans la mauvaise langue | i18n / technique | 2 | 2 | **4** | 🟠 | → | Frederick (BE) |
| **R9** | Afflux de demandes RGPD / SAR à l'échelle | Conformité | 2 | 2 | **4** | 🟠 | ↑ | Seer (SM) |
| **R10** | SPOF : dépendance à un hébergeur unique (OVH) | Externe | 1 | 3 | **3** | 🟠 | → | Frederick (BE) |

*Tendance : ↑ le risque s'aggrave avec le succès · → stable tant que non traité.*

## 2. Matrice de criticité (Probabilité × Impact)

```
 Impact ↑
 3 critique │              R3 (6) 🔴      R1 (9) 🔴
            │   R10 (3) 🟠               R2 (9) 🔴
 2 majeur   │              R5 R6 R7      R4 (6) 🔴
            │              R9 (4) 🟠     R8 (6) 🔴
 1 mineur   │
            └───────────────────────────────────────→ Probabilité
                1 faible      2 moyenne      3 élevée
```

🔴 **Cases rouges (à traiter d'abord)** : R1, R2, R3, R4, R8.

## 3. Conséquences & traitement (registre détaillé)

| ID | Conséquence si avéré | Action **préventive** (réduit P/I) | Action **corrective** (si survient) |
|----|----------------------|-----------------------------------|-------------------------------------|
| R1 | Indisponibilité le jour du lancement national, perte de confiance de l'État | File asynchrone (Celery/Redis) + réplica lecture + tests de charge | Page maintenance + file de secours + rollback de version |
| R2 | Blocage légal : pas de mise en service public possible | Audit RGAA + correction des critères prioritaires + déclaration d'accessibilité | Dérogation temporaire documentée + plan de mise en conformité daté |
| R3 | On découvre la limite de charge en pleine production | Tests de charge (k6/Locust) chiffrant le seuil avant lancement | Throttling / limitation de débit d'urgence |
| R4 | Impossible de livrer l'Europe promise aux investisseurs | Externaliser les chaînes (i18n FR/EN/ES), rien codé en dur | Traduction manuelle en urgence des écrans clés |
| R8 | Retard / abandon de la Release 3, engagement non tenu | MoSCoW strict, binômage, US non-critiques en R3+, renfort post-levée | Re-priorisation, réduction du périmètre du 1er incrément R3 |
| R5 | Facture cloud/LLM hors budget | Cache des quiz + dimensionnement + budget d'alerte | File d'attente + dégradation gracieuse |
| R6 | Panne non détectée avant les utilisateurs | Observabilité (métriques + alertes seuils) | Astreinte + procédure incident documentée |
| R7 | Perte de confiance des utilisateurs internationaux | Détection de la langue du cours + génération ciblée | Bouton « régénérer dans ma langue » |
| R9 | Non-respect des délais légaux RGPD (Art. 12) | Industrialiser le traitement SAR (déjà amorcé J3-bis) | Procédure SAR prioritaire + escalade DPO |
| R10 | Panne régionale = service national à l'arrêt | Redondance multi-région / fournisseur de secours (ADR à produire) | Bascule sur environnement de secours |

## 4. Du risque à l'action préventive dans le backlog

> La colonne clé est la dernière : une action préventive **formulée comme un item de backlog estimé**, qui réduit la **probabilité (P↓)** ou l'**impact (I↓)**.

| Risque | Cause probable | Expo | Action préventive → item backlog (points) | Effet | US |
|--------|----------------|:----:|--------------------------------------------|:-----:|----|
| R1 Saturation au pic national | Génération synchrone, un seul serveur, base non répliquée | 9 | « File asynchrone + tests de charge + scaling horizontal » · **18 pts** | P↓ & I↓ | [US-J4-01](user-stories-j4.md#us-j4-01), [03](user-stories-j4.md#us-j4-03), [04](user-stories-j4.md#us-j4-04) |
| R2 Rejet accessibilité (RGAA) | Contrastes, navigation clavier, alternatives manquantes | 9 | « Audit RGAA + correction des critères prioritaires + déclaration » · **13 pts** | P↓ | [US-J4-06](user-stories-j4.md#us-j4-06), [07](user-stories-j4.md#us-j4-07), [08](user-stories-j4.md#us-j4-08), [09](user-stories-j4.md#us-j4-09) |
| R3 Point de rupture inconnu | Aucun test de charge | 6 | « Scénario de tests de charge k6/Locust chiffrant le seuil » · **5 pts** | P↓ | [US-J4-03](user-stories-j4.md#us-j4-03) |
| R4 Internationalisation bâclée | Textes codés en dur dans le code | 6 | « Externaliser les chaînes (fichiers de langue) + sélecteur » · **8 pts** | P↓ | [US-J4-10](user-stories-j4.md#us-j4-10) |
| R5 Coût cloud/LLM hors budget | Une inférence par requête, pas de suivi | 4 | « Cache des quiz + budget d'alerte + dimensionnement » · **5 pts** | I↓ | [US-J4-02](user-stories-j4.md#us-j4-02) |
| R6 Panne silencieuse | Pas de supervision | 4 | « Métriques + alertes de production » · **5 pts** | I↓ | [US-J4-05](user-stories-j4.md#us-j4-05) |
| R7 Mauvaise langue de quiz | Langue du cours non détectée | 4 | « Détection de langue + génération ciblée » · **5 pts** | P↓ | [US-J4-11](user-stories-j4.md#us-j4-11) |
| R9 Afflux SAR RGPD | Traitement SAR manuel | 4 | « Industrialiser le traitement SAR (fiche + check-list) » · **3 pts** | I↓ | US-28, US-29 |
| R10 Panne fournisseur unique | Dépendance OVH mono-région | 3 | « ADR résilience : fournisseur de secours + repli » · **3 pts** | I↓ | ADR à produire |

## 5. Synthèse & priorisation

| Priorité | Risques | Décision de pilotage |
|---|---|---|
| **P0 — cases rouges** | R1, R2, R3, R4, R8 | En **tête de Release 3** ; bloquants pour tout déploiement national |
| **P1 — modérés à surveiller** | R5, R6, R7, R9 | Planifiés en Release 3, suivis en daily |
| **P2 — faibles** | R10 | ADR de résilience à produire, non bloquant immédiat |

**Total des actions préventives techniques descendues au backlog : ~ 59 SP** (dont 29 SP de MUST pour les cases rouges) → confirme que le passage à l'échelle est un **chantier de Release 3 complet, planifié**, et non du code improvisé dans le Sprint 4. C'est exactement le message attendu par le PO.

R8 (humain) est traité **organisationnellement** (redispatch, MoSCoW, renfort post-levée) et non par une US produit.

## 6. Traçabilité

- Actions préventives → [Product Backlog v4.0](../../cadrage/artefacts/equipe-11-product-backlog-v4.0.xlsx), épics **EP-12** (Scalabilité), **EP-13** (Accessibilité RGAA), **EP-14** (i18n).
- Registre exécutable (cotation + coloration criticité) → [equipe-11-registre-risques-v4.0.xlsx](../../cadrage/artefacts/equipe-11-registre-risques-v4.0.xlsx).
- Plans d'exécution des mesures → [plan-audit-rgaa.md](plan-audit-rgaa.md) · [plan-tests-utilisateurs.md](plan-tests-utilisateurs.md) · [actions-po-j4.md](actions-po-j4.md).
