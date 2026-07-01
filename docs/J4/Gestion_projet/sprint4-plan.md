# Sprint Planning — Sprint 4 (J4, jeudi 02/07/2026)

> **Équipe 11 · EduTutor IA** · Sprint 4
> **Rédigé par** : Seer MENSAH ASSIAKOLEY (Scrum Master)
> **Date** : 02/07/2026
> **Dépend de** : [sprint3-cloture.md](sprint3-cloture.md) · [Sprint Backlog v3.0, feuille Sprint 4](../../cadrage/artefacts/equipe-11-sprint-backlog-v3.0.xlsx)

---

## 1. Objectif du sprint

Triple objectif, dans cet ordre de priorité :
1. **Absorber la perturbation J4** (« Mme Lefèvre revient », crise livraison/qualité — annoncée à 10h00) : réserve de capacité dédiée de 5 h, méthode des 5 étapes (respirer → identifier les livrables → re-prioriser MoSCoW → exécuter → fiche rétro).
2. **Clôturer la Release 2** : T-T1.4 (polish + tests dashboard classe, dernière tâche de US-T1), tests d'intégration, **tag `v1.1.0`** + notes de release.
3. **Préparer la soutenance de vendredi** : rapport de gestion Scrum + slides + fiches rétro des 5 perturbations + mise à jour du Miro. **La soutenance porte sur la gestion Scrum du projet, pas sur le produit** — les livrables de préparation suivent [docs/soutenance/guide-rapport.md](../../soutenance/guide-rapport.md) et [docs/soutenance/guide-slides.md](../../soutenance/guide-slides.md).

## 2. Capacité et principes de redispatch (7 membres)

Décisions issues de la rétro Sprint 3 :
- **Seer ≤ 6 h** (la surcharge ×2.6 du Sprint 3 ne se reproduit pas la veille de soutenance).
- **Azeddine AMARI et Redouane ID SOUGOU réintégrés** — mais uniquement en **binôme** et sur des tâches **hors chemin critique** (collecte de preuves, captures, démo de secours). Double but : contribution réelle traçable avant la soutenance, et aucun risque si la tâche n'aboutit pas.
- **Hugo HAVET** repasse sur du code léger (T-T1.4) après avoir prouvé son rattrapage sur les livrables rédactionnels du Sprint 3.
- **Tout le monde parle en soutenance** : la répétition générale est une tâche d'équipe, chronométrée.

## 3. Backlog Sprint 4 (19.5 h planifiées)

| US | ID | Tâche | Assigné | Estim. (h) |
|---|---|---|---|---|
| US-J4 | T-J4.1 | Perturbation J4 : triage + exécution (réserve) | Seer + Frederick (renfort selon le scénario) | 4 |
| US-J4 | T-J4.2 | Post-mortem blameless de la crise J4 (livrable docs/J4/) | Romain + Seer | 1 |
| US-T1 | T-T1.4 | Polish + tests dashboard classe (clôture DoD US-T1) | Hugo | 2 |
| Release 2 | T-R2.1 | Tests intégration bout-en-bout R2 + non-régression MVP | Romain | 2 |
| Release 2 | T-R2.2 | Tag `v1.1.0` + release GitHub + màj démo vidéo | Seer | 1 |
| Soutenance | T-SOUT-1 | Rapport de gestion Scrum ([guide](../../soutenance/guide-rapport.md)) | Hugo (rédaction) + **Azeddine** (collecte des preuves : git log, burndowns, versions d'artefacts) | 3 |
| Soutenance | T-SOUT-2 | Slides ([guide](../../soutenance/guide-slides.md)) | Van Anh (structure/design) + **Redouane** (captures produit + démo de secours) | 2.5 |
| Soutenance | T-SOUT-3 | Fiches rétro des 5 perturbations (J1→J4) | Frederick + Romain | 1.5 |
| Soutenance | T-SOUT-4 | Mise à jour Miro (artefacts v3.0, burndowns, timeline perturbations) | Van Anh + Seer | 1.5 |
| Soutenance | T-SOUT-5 | Répétition générale chronométrée | Les 7 | 1 |

### Charge par personne

| Membre | Charge | Commentaire |
|---|---|---|
| Seer | 6 h (dont 4 h réserve J4 partagée) | plafonné volontairement |
| Frederick | 4.75 h | renfort J4 + fiches rétro |
| Romain | 4.5 h | QA + post-mortem |
| Van Anh | 4 h | slides + Miro |
| Hugo | 5 h | T-T1.4 + rédaction rapport |
| Azeddine | 3 h | binôme rapport (preuves) — non bloquant |
| Redouane | 2.5 h | binôme slides (captures, démo backup) — non bloquant |

*(la somme dépasse les 19.5 h car les tâches en binôme comptent pour chaque membre)*

## 4. Risques et garde-fous

| Risque | Garde-fou |
|---|---|
| La perturbation J4 déborde de la réserve de 4-5 h | Ordre de retrait : T-SOUT-4 (Miro réduit au minimum) puis T-R2.1 réduit au smoke test. **Jamais** retirer T-SOUT-1/2/5 (soutenance) ni T-J4.2 (post-mortem attendu par le jury). |
| Azeddine/Redouane ne livrent pas | Leurs tâches sont doublées par le binôme senior ; aucun livrable ne dépend d'eux seuls. |
| CI cassée par merges parallèles (récidive) | Merges séquentiels, CI verte avant merge suivant (action rétro S3). |
| Démo qui plante vendredi | T-S5.3 (Sprint 5, vendredi matin) : environnement vérifié + vidéo de secours déjà publiée avec la release. |

## 5. Sprint 5 (vendredi matin, buffer pré-soutenance — 2.5 h)

| ID | Tâche | Assigné |
|---|---|---|
| T-S5.1 | Répétition générale finale + répartition des temps de parole (les 7 parlent) | Les 7 |
| T-S5.2 | Derniers correctifs slides/rapport (relecture croisée) | Van Anh + Hugo |
| T-S5.3 | Setup démo + vidéo de secours testée | Frederick + Romain |
