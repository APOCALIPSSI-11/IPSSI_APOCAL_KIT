# Perturbation J4 — Passage à l'échelle (le succès national)

> **Équipe 11 · EduTutor IA** · Sprint 4 (jeudi 02/07/2026)
> **Perturbation annoncée** : J4 — *« Passage à l'échelle »*
> **Nature** : bonne nouvelle 🎉 (succès), pas une crise
> **Rédigé par** : Seer MENSAH ASSIAKOLEY (Scrum Master)
> **Sources** : [Rappel J4](https://mohamedelafrit.com/teaching/APOCALIPSSI/pages/rappels/j4.php) · [Perturbation J4 — livraison](https://mohamedelafrit.com/teaching/APOCALIPSSI/pages/perturbations/j4-livraison.php)

---

## ⚠️ Correction de cadrage importante

Les artefacts rédigés en amont ([sprint4-plan.md](../Gestion_projet/sprint4-plan.md), Sprint Backlog v3.0, Release Planning v3.0) décrivaient la perturbation J4 comme **« Mme Lefèvre revient — crise livraison/qualité »**. **C'était une hypothèse erronée.**

La perturbation J4 réelle publiée par le PO est l'**inverse d'une crise** : c'est le **succès massif** de l'application. Comme le dit le brief, *« cette fois c'est une bonne chose »*. Le présent dossier fait foi ; les artefacts sont réalignés en conséquence (voir [§7](#7-impact-sur-les-artefacts-et-le-sprint-4)).

---

## 1. Le contexte

EduTutor IA rencontre un **succès massif au niveau national**. L'**État français** souhaite l'adopter comme **plateforme de référence pour tous les lycées**. Une **levée de fonds** vient par ailleurs de réussir et ouvre une **expansion européenne**.

Ce succès n'est pas gratuit : l'État **impose des conditions strictes** pour un déploiement de service public à grande échelle.

## 2. La perturbation : trois axes simultanés

| # | Axe | Déclencheur | Enjeu |
|---|-----|-------------|-------|
| 1 | **Scalabilité** | L'application a *failli s'effondrer sous la charge* | Tenir des dizaines de milliers d'utilisateurs simultanés (tous les lycées) |
| 2 | **Accessibilité RGAA** | *Obligation légale* pour un service public | Conformité RGAA (Référentiel Général d'Amélioration de l'Accessibilité) |
| 3 | **Internationalisation (i18n)** | *Levée de fonds → expansion européenne* | Interface et contenus multilingues |

## 3. Ce qui est demandé : du MANAGEMENT, pas du code bricolé

La directive du PO est explicite :

> *« Je ne veux pas du code bricolé dans la panique. Je veux un plan clair : vos artefacts à jour, vos risques identifiés, votre pilotage. »*

👉 **L'évaluation porte sur la gestion agile** (réaction d'un Product Owner / Scrum Master face à une montée en charge), **pas sur la prouesse technique**. C'est parfaitement aligné avec la soutenance de vendredi, qui porte elle aussi sur la **gestion Scrum du projet**, pas sur le produit.

## 4. Livrables attendus (perturbation J4)

| # | Livrable | Où | Statut |
|---|----------|-----|--------|
| 1 | **Artefacts agiles révisés** intégrant les 3 axes : vision board, personas, story map, backlogs (product, release, sprint) | `docs/cadrage/artefacts/*-v4.0.*` | ➡️ v4.0 |
| 2 | **Analyse de risques** : ≥ 5 risques en matrice probabilité × impact, actions préventives estimées et priorisées | [analyse-risques-j4.md](analyse-risques-j4.md) | ✅ |
| 3 | **Pilotage** : burndown du Sprint 4 + burnup projet montrant l'impact des nouvelles exigences | Sprint Backlog v4.0 (feuille *Burndown Sprint 4*) + Release Planning v4.0 (*Burnup global*) | ➡️ v4.0 |
| 4 | **Bonus technique** (facultatif) : PoC sur un axe (bascule de langue, contrôle RGAA, migration…) | à décider selon capacité | ⏳ optionnel |

## 5. Rappel J4 — les 4 réflexes à démontrer

Le [rappel J4](rappel-j4-pilotage-risques.md) (« Pilotage & Gestion des Risques ») fixe l'état d'esprit attendu :

1. **Le succès génère de nouveaux risques à l'échelle** — c'est exactement notre situation.
2. **L'anticipation prime sur la réaction** — on planifie, on ne bricole pas.
3. **Piloter avec des données** (burndown/burnup), pas des impressions.
4. **Le backlog absorbe toutes les exigences** et toutes les actions préventives.

## 6. Critères de validation (7 points du jury)

- [ ] Vision / story map mises à jour (3 axes intégrés)
- [ ] Persona élargie (utilisateur international / en situation de handicap)
- [ ] Matrice de risques complète (≥ 5 risques)
- [ ] Actions préventives estimées
- [ ] Backlog repriorisé + release planning à jour
- [ ] Historique des sprints conservé (S1 → S4)
- [ ] Burndown / burnup actualisés

## 7. Impact sur les artefacts et le Sprint 4

Le Sprint 4 était déjà chargé (clôture Release 2 + préparation soutenance). La perturbation J4 étant **une charge de management** (pas de code lourd), elle **s'insère sans exploser la capacité** : l'essentiel est de la documentation d'artefacts, réalisable dans la réserve de perturbation déjà prévue.

### Tâches Sprint 4 existantes — réinterprétées

| Tâche existante | Réinterprétation J4 (passage à l'échelle) |
|---|---|
| `T-J4.1` Perturbation J4 : triage + exécution (réserve 4 h) | Devient : **triage des 3 axes** + révision des artefacts en v4.0 + rédaction de la matrice de risques |
| `T-J4.2` Post-mortem « crise » | Devient : **fiche de décision J4** (comment le backlog a absorbé les 3 axes) — pas un post-mortem de crise, mais une note de pilotage |
| `T-R2.1 / T-R2.2` Release 2 (v1.1.0) | **Inchangées** — la Release 2 se clôture normalement |
| `T-SOUT-*` préparation soutenance | **Inchangées**, enrichies : la story J4 devient un temps fort du pitch |

### Nouvelles tâches J4 à ajouter au Sprint 4

Voir le détail dans [user-stories-j4.md](user-stories-j4.md). En résumé, la charge additionnelle est **documentaire** (artefacts v4.0 + matrice de risques), déjà couverte par la réserve `T-J4.1`. Les **user stories techniques** des 3 axes sont **ajoutées au Product Backlog** et **planifiées en Release 3** (« Passage à l'échelle national ») — elles ne sont **pas** codées dans le Sprint 4, conformément à la directive « pas de code bricolé ».

## 8. Pourquoi c'est cohérent avec le projet

- La **Release 1 (MVP)** est livrée (`v1.0.0-mvp`).
- La **Release 2** (rôle enseignant + dashboard de classe) se clôture ce sprint (`v1.1.0`).
- La perturbation J4 ouvre naturellement la **Release 3** : le produit passe du prototype validé au **service public national et européen**. Les 3 axes (scalabilité, RGAA, i18n) sont exactement les exigences non-fonctionnelles d'un tel changement d'échelle.

---

## Sommaire du dossier J4

| Document | Contenu |
|---|---|
| [README.md](README.md) *(ce fichier)* | Brief de la perturbation, cadrage, livrables |
| [rappel-j4-pilotage-risques.md](rappel-j4-pilotage-risques.md) | Synthèse du rappel J4 (pilotage & risques) |
| [analyse-risques-j4.md](analyse-risques-j4.md) | Registre + matrice de criticité (≥ 5 risques) + actions préventives estimées |
| [user-stories-j4.md](user-stories-j4.md) | Nouvelles US (3 axes + Release 2/3), critères Given/When/Then + nouveaux épics |
| [impact-us-existantes.md](impact-us-existantes.md) | Vérification : J4 ne casse pas les priorités / critères / livrables existants |
| [plan-audit-rgaa.md](plan-audit-rgaa.md) | Plan d'audit accessibilité RGAA (méthode, outils, planning) |
| [plan-tests-utilisateurs.md](plan-tests-utilisateurs.md) | Protocole de tests utilisateurs (panel handicap + international) |
| [actions-po-j4.md](actions-po-j4.md) | Décisions Product Owner (repriorisation, Release 3, DoR/DoD) |

**Artefacts mis à jour** : Product Backlog v4.0 + Registre des risques v4.0 (`docs/cadrage/artefacts/`).
