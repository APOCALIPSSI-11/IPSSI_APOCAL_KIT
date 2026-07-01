# Guide de préparation — Slides de soutenance (03/07/2026)

> **Équipe 11 · EduTutor IA** · APOCAL'IPSSI 2026

> **Format imposé** : pitch **15 min** + démo live + retour réflexif + Q/R jury

---

## ⚠️ Angle : on présente une gestion de projet, pas un produit

Le jury évalue le **pilotage Scrum sous perturbations**. Le produit n'apparaît que comme preuve que le pilotage a fonctionné. Budget temps recommandé sur 15 min :

| Bloc | Durée | Slides |
|---|---|---|
| Contexte + équipe | 1 min | 1-2 |
| Cadrage & artefacts vivants | 2 min | 3-4 |
| Perturbations (×5) & décisions | 5 min | 5-9 |
| Aléas humains & redispatch | 2 min | 10 |
| Métriques (burndown/burnup) | 2 min | 11 |
| Démo (ou vidéo) | 2 min | 12 |
| Leçons & clôture | 1 min | 13 |

**Les 7 membres parlent** (répartition à figer en T-SOUT-5/T-S5.1). Suggestion : chacun présente un bloc où il a réellement contribué — crédibilité maximale en Q/R.

## Contenu slide par slide

1. **Titre** — EduTutor IA, équipe 11, « 4 jours, 5 perturbations, 3 versions d'artefacts » + liens repo/Miro.
2. **L'équipe et les rôles** — 7 têtes, rôles BE/FE/QA/SM ; annoncer honnêtement que la gestion des absences fait partie de l'histoire (teaser slide 10).
3. **Cadrage J1** — les 7 artefacts avant 13h ; visuel : frise des versions v1.0 → v1.1 → v2.1/v2.3 → v3.0 avec les événements déclencheurs. Message : « un artefact qui ne bouge pas est un artefact mort ».
4. **Notre cadence réelle** — timeline lun→ven : cadrage, S1 mardi soir, S2 mercredi journée (pivot J3), S3 mercredi soir, S4 jeudi (J4 + Release 2), S5 buffer, soutenance. Marquer les releases (v1.0.0-mvp, v1.1.0).
5. **Perturbation J1 (produit)** — Mme Lefèvre → persona enseignant, US-26/US-T1 ; visuel : story map avant/après.
6. **Perturbation J2 (technique)** — benchmark + ADR-001 ; visuel : tableau de décision. Message : « une décision technique = un ADR commité ».
7. **Perturbation J3 (sécurité LLM + RGPD)** — défense en 4 couches anti prompt-injection, ADR-002 ; visuel : schéma des couches + extrait test adversarial en CI.
8. **Perturbation J3-bis (SAR)** — la demande de Hugo Petit traitée en 1 sprint : 7 critères d'acceptation → 7 ✅ ; visuel : le tableau CA du [sprint3-cloture.md](../J4/Gestion_projet/sprint3-cloture.md) §2.
9. **Perturbation J4 (crise)** — à compléter jeudi : timeline de crise + extrait du post-mortem blameless.
10. **Gérer les humains, pas les héros** — slide clé : constat git (0 commit / 1 commit / rattrapage), méthode (vérifier par le code, redispatch tracé, allègement ciblé, réintégration en binôme), résultat (S3 : 14/14 avec 5 contributeurs). Ton : factuel et blameless.
11. **Métriques** — 3 mini-burndowns S1/S2/S3 + burnup 33→54→66/71 SP (graphiques des classeurs v3.0). Une phrase d'interprétation par sprint, y compris ce qui a raté (statuts obsolètes → audits de code).
12. **Démo** — parcours 90 s : signup (consentement) → upload → génération (barre de progression) → score → export RGPD → dashboard classe enseignant. **Plan B obligatoire** : vidéo de la release lancée par Redouane si le live échoue.
13. **Leçons + ouverture** — 3 leçons max (ex. : backlog mis à jour au commit ; décisions = artefacts ; charge plafonnée) + Release 3 en une ligne. Slide de fin avec QR codes (repo, release, Miro).

## Règles de design

- 1 idée par slide, ≤ 20 mots de texte, le reste en visuel (graphiques exportés des classeurs, captures, frises).
- Pas de capture de code sauf le test adversarial (slide 7) — c'est une preuve, pas de la technique gratuite.
- Numéros de commits/versions en petit mais présents : le jury doit sentir que tout est traçable.
- Dernière slide de secours (backup) : tableau des 7 artefacts v3.0 avec liens, pour les Q/R.

## Préparation Q/R (15 min de la fin de séance)

Questions probables et qui répond :
- « Comment avez-vous géré les absents ? » → Seer (méthode git) + Hugo (vécu du rattrapage).
- « Pourquoi deux audits du backlog ? » → Frederick (statuts corrigés dans les deux sens).
- « Votre burndown S1 dépasse la capacité, pourquoi ? » → Romain (session étendue volontaire, sur-livraison assumée).
- « Que feriez-vous différemment ? » → n'importe qui, avec les 3 leçons de la slide 13.
- « Détail RGPD/SAR ? » → Hugo (politique + lettre) + Seer (audit trail, hash).

## Check-list

- [ ] 13 slides + backups, exportées en PDF dans `docs/soutenance/`
- [ ] Graphiques burndown/burnup issus des classeurs v3.0 (pas redessinés à la main)
- [ ] Timing répété ≤ 15 min chrono (T-SOUT-5 jeudi, T-S5.1 vendredi)
- [ ] Les 7 temps de parole écrits sur un pense-bête
- [ ] Vidéo de secours testée sur la machine de projection
