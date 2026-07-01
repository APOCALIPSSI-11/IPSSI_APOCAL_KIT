# Plan de revue — Sprint 2 (clôture)

> **Équipe 11 · EduTutor IA** · Sprint 2 (mercredi 01/07/2026)
> **Rédigé par** : Seer MENSAH ASSIAKOLEY (Scrum Master)
> **Date de rédaction** : 01/07/2026
> **Source** : [equipe-11-sprint-backlog-v2.3.xlsx](../cadrage/artefacts/equipe-11-sprint-backlog-v2.3.xlsx) (audit du 01/07) + vérification directe du code (`git log`, lecture des fichiers backend/frontend)
> **Objectif** : préparer la Sprint Review avec le PO (Mohamed Amine EL AFRIT) en distinguant ce qui est *réellement* livré de ce qui reste à faire, avant de basculer sur le Sprint 3.

---

## 1. Déroulé proposé pour la revue

1. **Démo live** (10 min) : signup avec consentement RGPD → upload → génération quiz → réponse → score → export ZIP des données.
2. **Revue des écarts** (10 min) : présenter le tableau §2 ci-dessous — ce qui était annoncé "Done" dans le backlog v2.2 vs. l'état réel du code après audit du 01/07.
3. **Point absences/charge** (5 min) : Redouane, Azeddine, Hugo (cf. §3).
4. **Rappel de la décision technique J3A** (→ [ADR-002](../adr/ADR-002-securisation-llm-rgpd-j3a.md), déjà Accepted) et validation du report des 2 écarts résiduels vers le Sprint 3.
5. **Annonce perturbation J3-bis (RGPD)** et son intégration au Sprint 3 (cf. [sprint3-redispatch.md](sprint3-redispatch.md)).

---

## 2. Écarts identifiés entre le backlog déclaré et le code réel

Cette table croise le statut affiché dans le Sprint Backlog v2.3 (déjà audité une première fois le 01/07) avec une **seconde vérification directe** faite pour cette revue (lecture du code + `git log --author`).

| Tâche | Assigné | Statut backlog v2.3 | Vérification code (01/07, 2e passe) | Conclusion |
|---|---|---|---|---|
| T-23.2 / T-23.3 — Barre de progression + polling | Frederick TOUFIK | Done | `quizzes/views.py::QuizStatusView` + route `status/<pk>/` confirmées, frontend `UploadPage.tsx` fait bien du polling | ✅ **Confirmé Done** |
| T-11.4 — Agrégation par chapitre | Romain LEFEVRE | Done | `StatsView` utilise `Case/When` pour l'agrégation par chapitre (`quizzes/views.py`) | ✅ **Confirmé Done** |
| T-RGPD-01.1 — Endpoint export ZIP | Frederick TOUFIK | Done (audit initial disait "PAS FAIT") | `ExportDataView` existe, route `/api/accounts/export/` enregistrée dans `urls.py`, retourne bien un ZIP (`profil_et_quizz.json` + `reponses_tentatives.csv`) | ✅ **Confirmé Done** — l'audit v2.3 était obsolète, le code a été poussé après |
| T-RGPD-01.2 — Bouton export frontend | Hugo HAVET | Done (audit initial disait "stub, bouton désactivé") | `ProfilePage.tsx` a un vrai `handleExport()` qui télécharge le blob ; bouton actif | ✅ **Confirmé Done** — audit obsolète |
| T-RGPD-01.3 — Audit trail RGPD | Seer MENSAH-ASSIAKOLEY | Done | `RGPDRequestLog` existe, journalise bien les suppressions (`accounts/views.py:285`) | ⚠️ **Partiel réel** — voir écart critique ci-dessous |
| T-RGPD-02 — Consentement signup | Thi Van Anh NGUYEN | Done | `SignupPage.tsx` a la checkbox obligatoire + liens CGU/confidentialité, bouton désactivé tant que non cochée | ✅ **Confirmé Done** |
| T-SEC-02 — Validation stricte post-LLM | Redouane ID SOUGOU | To Do (audit disait "FAIT") | `parse_and_validate_quiz` valide bien 10 questions/4 options/`correct_index` + échappement XSS, couvert par tests | ✅ **Confirmé Done** malgré le statut "To Do" affiché — libellé de statut à corriger dans le classeur |
| T-SEC-03 — Tests adversariaux | Romain LEFEVRE | Done (audit disait "PAS FAIT") | `llm/tests.py` contient bien 3 tests : injection de prompt, XSS, `correct_index` invalide — commit `Roro9526 feat(security): implement adversarial LLM tests` | ✅ **Confirmé Done** — audit obsolète |
| T-SEC-01 — Structured prompting anti-injection | Azeddine AMARI | In Progress (1h restant) | Séparation system/user OK pour OpenAI/Anthropic. **Toujours absente pour Ollama** : `ollama_client.py` concatène system+cours dans un unique prompt (`/api/generate` ne sépare pas les rôles) | ❌ **Confirmé non résolu** — report Sprint 3 |

### 🔴 Écart critique trouvé lors de cette revue (non signalé dans le classeur)

**L'export RGPD n'est pas journalisé dans l'audit trail.** `ExportDataView.get()` (`backend/accounts/views.py:340-415`) ne crée **aucune** entrée `RGPDRequestLog`, alors que le modèle prévoit bien un choix `request_type="export"` (`accounts/models.py:56`) et qu'un commentaire TODO explicite l'attendait (`accounts/views.py:296-300`, jamais retiré ni traité). Seule la suppression de compte (`request_type="delete"`) est journalisée.

**Pourquoi c'est important** : la nouvelle perturbation J3-bis (cf. §4) exige explicitement une "SAR audit trail" couvrant *toutes* les demandes RGPD (export et suppression). C'est un pré-requis direct pour le Sprint 3, à traiter en tout début (effort estimé : 15-30 min, ajout d'un appel `RGPDRequestLog.objects.create(...)` dans `ExportDataView.get()`).

### Nettoyage mineur à prévoir
- `ProfilePage.tsx` lignes 13-15 : docblock avec des TODO obsolètes ("placeholder présent plus bas, à implémenter") alors que la fonctionnalité est livrée — à corriger pour éviter la confusion en revue de code.
- `docs/cadrage/artefacts/equipe-11-sprint-backlog-v2.3.xlsx` : plusieurs statuts ("To Do" pour T-SEC-02, "PAS FAIT" pour T-RGPD-01.1/01.2/T-SEC-03) sont obsolètes par rapport au code réel — prévoir une v2.4 avant la Sprint Review.

---

## 3. Absences et charge — état vérifié (`git log`)

| Membre | Constat déclaré | Vérification `git log --author` | Décision |
|---|---|---|---|
| **Redouane ID SOUGOU** | Aucune nouvelle depuis Sprint 1 | **0 commit** sur l'ensemble de l'historique du dépôt | Réaffectation totale de ses tâches Sprint 3 (T-T1.2) |
| **Azeddine AMARI** | Aucune nouvelle pendant Sprint 2 | **1 seul commit** sur tout l'historique (modèle User, Sprint 1) | Réaffectation de ses tâches Sprint 3 restantes (T-SEC-01 reliquat, T-26.1) |
| **Hugo HAVET** | En retard | 1 commit direct + contributions mergées (export ZIP RGPD, signup page, password reset) — travail réel mais rythme ralenti | Allègement de charge Sprint 3, pas de retrait total |
| **Romain LEFEVRE** | "A normalement fini", à vérifier | 3 commits confirmés (tests adversariaux TSEC-03, tâches J2, merge) — **vérification positive** : T-SEC-03 et T-11.4 sont bien dans le code | ✅ Aucune action requise, tâches confirmées Done |

**Conclusion** : les réaffectations demandées par le Product Owner/Scrum Master sont justifiées par les faits (git). Détail du redispatch → [sprint3-redispatch.md](sprint3-redispatch.md).

---

## 4. Nouvelle perturbation à annoncer en revue : J3-bis (RGPD)

Une deuxième perturbation RGPD arrive (distincte du volet RGPD déjà traité en Sprint 2 sous J3) : un **SAR (Subject Access Request) formel** d'un utilisateur fictif, Hugo Petit, avec des exigences précises (format JSON structuré, politique de rétention écrite, audit trail avec hash de fichier, lettre de réponse professionnelle). Détail complet et intégration au Sprint 3 → [sprint3-redispatch.md](sprint3-redispatch.md) §3.

---

## 5. Décision à valider en fin de revue

- [ ] Confirmer les 2 écarts résiduels de J3A (T-SEC-01 Ollama, audit trail export) et leur report en tâches Sprint 3 nommées (§2)
- [ ] Valider le redispatch Sprint 3 (réaffectations Redouane/Azeddine, allègement Hugo, US J3B intégrées)
- [ ] Valider la checklist MVP à date → [mvp-checklist.md](mvp-checklist.md)
- [ ] Mettre à jour le Sprint Backlog en v2.4 avec les statuts corrigés (§2) avant transmission au PO
