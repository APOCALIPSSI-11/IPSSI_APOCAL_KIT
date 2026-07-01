# T-Backlog-v2.4 — MàJ Sprint Backlog v2.4 (statuts corrigés)

> **User Story** : Reliquat J3 — *Qualité de projet & Maintenance*
> **Sprint** : Sprint 3
> **Estimation** : 0.5h (30 min)
> **Assigné** : Seer MENSAH ASSIAKOLEY
> **Statut** : Todo

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de mettre à jour le tableau Excel de suivi du projet de la version 2.3 à la version 2.4. Il s'agit de corriger les écarts de statut identifiés lors de l'audit de la Sprint Review 2 (cf. [sprint2-revue.md](../sprint2-revue.md)). Certains items marqués "Todo" ou "Pas Fait" dans le backlog Excel sont en réalité terminés et fonctionnels dans le code (comme T-SEC-02, T-RGPD-01.1/01.2, et T-SEC-03). Cette mise à jour garantit que les artefacts de gestion de projet reflètent fidèlement l'état réel de l'application.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [docs/cadrage/artefacts/equipe-11-sprint-backlog-v2.3.xlsx](../../cadrage/artefacts/equipe-11-sprint-backlog-v2.3.xlsx) | Sprint Backlog Excel actuel | **OUI** (à enregistrer sous une nouvelle version v2.4) |

---

## 3. Spécifications techniques

### 3.1 Liste des corrections de statuts à appliquer :
1. **T-SEC-02** (Validation post-LLM) : Passer le statut à **Done**.
2. **T-RGPD-01.1 / T-RGPD-01.2** (Export ZIP backend/frontend) : Passer le statut à **Done**.
3. **T-SEC-03** (Tests adversariaux en CI) : Passer le statut à **Done**.
4. Enregistrer le fichier résultant sous le nom `equipe-11-sprint-backlog-v2.4.xlsx` dans le répertoire des artefacts de cadrage.

---

## 4. Étapes détaillées

### Étape 1 — Ouvrir le classeur Excel
Ouvrir `equipe-11-sprint-backlog-v2.3.xlsx` avec un outil d'édition de feuilles de calcul.

### Étape 2 — Corriger les statuts
Mettre à jour les statuts pour les 4 tâches identifiées dans le tableau de suivi.

### Étape 3 — Enregistrer sous la nouvelle version
Enregistrer le fichier sous le nom `equipe-11-sprint-backlog-v2.4.xlsx`.

### Étape 4 — Versionner sur Git
Ajouter le nouveau fichier sur Git et nettoyer/supprimer la version v2.3 si nécessaire (ou conserver l'historique selon les normes de l'équipe).

---

## 5. Definition of Done

- [ ] Le fichier `equipe-11-sprint-backlog-v2.4.xlsx` est présent dans `docs/cadrage/artefacts/`.
- [ ] Les statuts de T-SEC-02, T-RGPD-01.1/01.2 et T-SEC-03 sont correctement mis à **Done**.
- [ ] Le fichier s'ouvre sans erreur et aucune formule de calcul de charge n'a été corrompue.
