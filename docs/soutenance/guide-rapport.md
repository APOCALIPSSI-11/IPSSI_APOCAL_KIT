# Guide de préparation — Rapport de travail (soutenance du 03/07/2026)

> **Équipe 11 · EduTutor IA** · APOCAL'IPSSI 2026

---

## ⚠️ Cadrage : sur quoi le jury nous évalue

La soutenance évalue **la gestion Scrum du projet**, pas la sophistication du produit. Critères officiels du sujet :
qualité du cadrage initial et de la **re-priorisation**, robustesse (sécurité IA, RGPD), **fréquence et répartition des commits**, **capacité d'adaptation aux 5 perturbations**, qualité de la démo et du **retour réflexif**.

Règle d'or du rapport : **chaque affirmation est adossée à une preuve** (commit, version d'artefact, burndown, document). On raconte comment l'équipe a décidé, mesuré et corrigé — pas comment Django fonctionne.

## Format cible

- 15-20 pages hors annexes, PDF, déposé dans `docs/soutenance/`.
- Une page = une idée ; tableaux et graphiques plutôt que paragraphes longs.
- Chaque section se termine par un encadré « **Preuves** » (liens repo/artefacts/Miro).

## Plan détaillé (avec sources à piocher)

### 1. Contexte et équipe (1 page)
- Sujet APOCAL'IPSSI : reprendre EduTutor IA (base edtech inachevée) et en faire un produit viable en 4 jours + soutenance.
- Équipe 11 (7 membres), rôles : SM = Seer, PO = M. EL AFRIT (superviseur), répartition BE/FE/QA.
- **Preuves** : README, [board Miro](https://miro.com/app/board/uXjVHAUf7Ek=/).

### 2. Cadrage J1 : les 7 artefacts (2 pages)
- Méthode : matinée de cadrage, 7 artefacts livrés avant 13h (PVB, personas, customer journey, story map, release planning, product backlog, sprint backlog).
- Montrer la **trajectoire de versions v1.0 → v3.0** : chaque perturbation ou clôture de sprint a produit une version tracée par commit. C'est LA démonstration de « l'artefact vivant ».
- **Preuves** : `docs/cadrage/artefacts/` (v1.0/v1.1 → v2.1/v2.3 → v3.0), `docs/pertubations/j1/`, commits du 29-30/06.

### 3. Organisation Scrum et outillage (2 pages)
- Cadence réelle : cadrage (lun.) → S1 (mar. soir) → S2 (mer. journée) → S3 (mer. soirée) → S4 (jeu., J4) → S5 buffer (ven. matin).
- Dailies, Sprint Reviews (démos PO), rétros documentées ; GitHub (PR + CI), Miro, classeurs.
- DoR/DoD partagées (onglet du Product Backlog) et **appliquées** : exemple concret — US-T1 livrée fonctionnellement en S3 mais non close car les tests manquaient (T-T1.4 → S4).
- **Preuves** : PR #1-#11, pipeline CI, Sprint Backlog v3.0.

### 4. Les 5 perturbations et leur absorption (4-5 pages — cœur du rapport)
Pour chacune : contexte → décision (MoSCoW/redispatch) → exécution → résultat → leçon. Utiliser les fiches rétro (T-SOUT-3).
- **J1 produit** (« Mme Lefèvre ») : persona enseignant émergent → US-T1/T2/T3 + US-26 au backlog, PVB/personas v1.1.
- **J2 technique** (« latence inacceptable ») : protocole de benchmark, décision de bascule → **ADR-001** (`docs/adr/`), `docs/pertubations/j2/`.
- **J3 conformité** (sécurité LLM + RGPD) : défense anti prompt-injection en 4 couches → **ADR-002**, note de sécurité, US-SEC-01/02/03 + US-RGPD-01/02, pivot du Sprint 2.
- **J3-bis RGPD/SAR** (« demande inattendue » de Hugo Petit) : 5 livrables en un sprint (export JSON, audit trail hashé, politique de rétention, lettre SAR, tests d'isolation) — intégrée au Sprint 3 sans sacrifier l'objectif produit.
- **J4 crise** : compléter jeudi avec le post-mortem blameless (T-J4.2).
- **Preuves** : `docs/adr/ADR-001…md`, `ADR-002…md`, `docs/pertubations/`, `docs/legal/`, burndown S2/S3.

### 5. Gestion des aléas humains — le chapitre qui nous distingue (2-3 pages)
Raconter factuellement, **sans blâme** (le rapport reste blameless, on décrit des faits git, pas des personnes fautives) :
- Constat : 1 membre sans aucun commit, 1 membre à 1 commit, 1 membre en retard au début qui **s'est rattrapé** (Hugo : politique de rétention + lettre SAR + T-T1.4).
- Méthode : vérification systématique des déclarations par `git log` + lecture du code (cf. [sprint2-revue.md](../J3/Gestion_projet/sprint2-revue.md) §3, [sprint3-redispatch.md](../J3/Gestion_projet/sprint3-redispatch.md) §1).
- Décisions : réaffectations tracées tâche par tâche, allègement ciblé (Hugo), plafonnement de la surcharge (Seer ≤ 6 h en S4), **réintégration en binôme** d'Azeddine et Redouane au Sprint 4 sur des tâches non bloquantes.
- Résultat : Sprint 3 clôturé 14/14 malgré une capacité réelle de 5 personnes sur 7.
- **Preuves** : git log par auteur, tableaux de charge des redispatchs, [sprint3-cloture.md](../J4/Gestion_projet/sprint3-cloture.md) §6.

### 6. Métriques (2 pages)
- Burndowns S1/S2/S3 (réels, graphiques du Sprint Backlog v3.0) + burnup global 33 → 54 → 66 SP / scope 71.
- Interprétation honnête : S1 sur-livré (session étendue), S2 perturbé puis ré-audité, S3 nominal.
- L'anecdote « audit vs classeur » : deux fois, les statuts du classeur ont menti dans les deux sens ; c'est l'audit de code qui a rétabli la vérité → action rétro « mise à jour au commit ».

### 7. Décisions techniques tracées (1 page)
ADR-001 (choix LLM/bascule de modèle) et ADR-002 (sécurisation LLM + RGPD J3A) : format, statut, écarts résiduels et leur clôture en S3. Le message : **les décisions techniques passent par un artefact, pas par la mémoire orale**.

### 8. Releases et démos (1 page)
- [v1.0.0-mvp](https://github.com/APOCALIPSSI-11/IPSSI_APOCAL_KIT/releases/tag/v1.0.0-mvp) : MVP F1-F6 + sécurité LLM + RGPD/SAR, **démo vidéo jointe**.
- v1.1.0 (Release 2 « enseignant », tag jeudi soir) : signup enseignant + dashboard de classe.

### 9. Rétrospective globale et leçons (1-2 pages)
Reprendre les rétros S1→S4 + post-mortem J4. 3-5 leçons maximum, formulées en « ce qu'on referait / ce qu'on ne referait plus ».

### Annexes
Liens : repo GitHub, releases, board Miro, les 7 artefacts v3.0, ADRs, docs légales RGPD, fiches rétro perturbations.

## Check-list avant remise

- [ ] Chaque section a son encadré Preuves avec liens cliquables
- [ ] Graphiques burndown/burnup exportés depuis les classeurs v3.0
- [ ] Aucune section ne décrit du code sans lien avec une décision de gestion
- [ ] Relecture croisée par un membre qui n'a pas rédigé la section
- [ ] Ton blameless vérifié sur le chapitre 5
- [ ] PDF final commité dans `docs/soutenance/` avant vendredi 9h
