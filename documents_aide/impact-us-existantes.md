# Impact de la perturbation J4 sur l'existant

> **Équipe 11 · EduTutor IA** · Sprint 4
> **Question** : la perturbation J4 (passage à l'échelle) **casse-t-elle** les priorités, les critères d'acceptation ou le travail déjà livré ?
> **Réponse courte** : **Non — J4 est additif, pas destructif.** Rien de livré n'est invalidé. J4 (a) **relève le niveau de qualité** pour la Release 3 via une DoD étendue, (b) **ajoute des critères transverses** (RGAA, i18n, charge) aux écrans quand ils seront redéployés à l'échelle, (c) **repriorise le backlog R3+** pour que les 3 axes passent devant.

---

## 1. Impact sur les priorités

**Principe** : J4 n'agit que sur le **futur** (Release 3). Il ne rétrograde ni ne supprime aucune US déjà livrée (R1 MVP `v1.0.0-mvp`, R2 `v1.1.0`).

| Ensemble | Statut | Effet J4 |
|----------|--------|----------|
| US R1 (MVP) : US-01..06, 07, 11, 17, 22, 23 | ✅ Done | **Aucun** — restent Done sous leur DoD d'origine |
| US R2 : US-26, US-T1 (clôture S4), US-07 | ✅ / clôture | **Aucun** sur la priorité ; livraison v1.1.0 maintenue |
| Perturbations J3/J3-bis : US-SEC-*, US-RGPD-*, US-J3B-* | ✅ Done | **Aucun** |
| Backlog R3+ **déjà présent** : US-08, 09, 10, 13, 14, 15, 16, 24, 25, 27, 28, 29, 30, US-T2, US-T3 | ⏳ Backlog | **Repriorisés** : ils passent **derrière** les MUST J4 (cases rouges), car les 3 axes conditionnent le déploiement national |
| Hors scope : US-18, 19, 20, 31 | WON'T | **Aucun** |

**Conflit de priorité ?** → **Aucun conflit dur.** Les MUST J4 sont en Release 3, les MUST existants sont déjà livrés (releases différentes). La seule conséquence est un **réordonnancement du backlog R3+** : les axes scalabilité/RGAA/i18n prennent la tête (voir [actions-po-j4.md](actions-po-j4.md)). Décision de PO assumée et tracée, pas une rupture.

## 2. Impact sur les critères d'acceptation (DoD étendue)

J4 introduit **3 exigences transverses** qui deviennent des critères de qualité pour toute US **re-livrée à l'échelle** (Release 3+). Les US déjà livrées **restent Done sous leur DoD d'origine** — on ne les repasse pas en « non conforme » rétroactivement ; on planifie leur **mise à niveau** dans le lot R3.

| US existante (écran) | RGAA | i18n | Charge | Critère transverse ajouté (R3) |
|----------------------|:----:|:----:|:------:|--------------------------------|
| US-01 Signup / US-07 Reset | ✔ | ✔ | — | Clavier + labels ARIA + contrastes ; chaînes externalisées |
| US-02 Upload | ✔ | ✔ | ✔ | Dépôt accessible + messages traduits + robustesse fichier |
| US-03 Génération quiz | ✔ | ✔ | ✔✔ | Async sous charge (US-J4-01) + langue du quiz (US-J4-11) |
| US-04/05 Passage + résultat | ✔ | ✔ | — | Navigation clavier du QCM + score/corrections traduits |
| US-06 Historique | ✔ | ✔ | — | Tableau accessible + dates localisées |
| US-11 Dashboard progression | ✔ | ✔ | — | Graphiques avec alternative textuelle |
| US-22 Consentement RGPD | ✔ | ✔ | — | Encart accessible + traduit (obligation légale renforcée à l'échelle) |
| US-23 Spinner génération | ✔ | ✔ | ✔ | **`aria-live`** pour annoncer l'avancement (sinon inaccessible) |
| US-26 Signup enseignant | ✔ | ✔ | — | Idem US-01 |
| US-T1 Dashboard classe | ✔ | ✔ | — | Idem US-11 |
| US-12 Export RGPD | ✔ | ✔ | — | Déclenchement accessible + contenu exporté dans la bonne langue |

**Contradiction de critères ?** → **Aucune.** Les nouveaux critères **s'ajoutent** (élèvent le seuil), ils ne **remplacent** ni ne **contredisent** les anciens. Exemple : US-03 « 10 QCM en < 60 s » reste vrai ; on ajoute « et de façon asynchrone sous charge nationale ».

## 3. Impact sur le travail déjà livré (fonctionnel)

**Rien ne casse fonctionnellement** : J4 n'exige aucune modification qui invaliderait le comportement actuel. En revanche, certains éléments livrés devront être **mis à niveau** (pas corrigés en urgence) pour tenir l'échelle :

| Élément livré | Point d'attention à l'échelle | US de mise à niveau |
|---------------|------------------------------|---------------------|
| Génération synchrone (US-03) | Effondre le serveur sous charge (risque R1) | US-J4-01 (file async) |
| Spinner de génération (US-23) | Non annoncé aux lecteurs d'écran | US-J4-06 (ARIA) |
| Toute l'UI (chaînes FR en dur) | Bloque l'Europe (risque R4) | US-J4-10 (externalisation) |
| Contenu du quiz (LLM) | Généré uniquement en FR | US-J4-11 (langue + validation) |
| Export (US-12) | Contenu et déclenchement mono-langue / non vocal | US-J4-11 + US-J4-13 (commande vocale) |
| Hébergement mono-instance | SPOF national (risque R10) | ADR résilience |

## 4. Verdict

| Question | Réponse |
|----------|---------|
| J4 casse-t-il des **priorités** ? | **Non** — il repriorise le backlog R3+, sans toucher au livré |
| J4 casse-t-il des **critères d'acceptation** ? | **Non** — il en **ajoute** (transverses), sans contredire les existants |
| J4 casse-t-il le **travail livré** ? | **Non** — MVP et R2 restent valides ; mises à niveau planifiées en R3 |
| Faut-il rouvrir des US Done ? | **Non** — on crée des US de mise à niveau en R3 (traçabilité propre) |

**Message soutenance** : *« Le succès n'a rien cassé. Nos incréments R1/R2 restent valides sous leur Definition of Done. Le passage à l'échelle relève simplement la barre : nous avons étendu la DoD (accessibilité, i18n, performance), repriorisé le backlog par le risque, et planifié la mise à niveau de l'existant en Release 3 — sans dette cachée. »*

## 5. Actions concrètes qui en découlent

1. **Étendre la DoD** (a11y / i18n / perf / observabilité) → [actions-po-j4.md §4](actions-po-j4.md).
2. **Repriorisation du backlog R3+** (axes J4 en tête) → [actions-po-j4.md §3](actions-po-j4.md).
3. **US de mise à niveau** de l'existant listées ci-dessus, rattachées aux US-J4-* → [user-stories-j4.md](user-stories-j4.md).
4. **Ne pas** rouvrir les US livrées : elles restent Done, on trace la dette technique de montée en charge dans le backlog.
