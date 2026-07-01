# Clôture Sprint 3 — Revue & Rétrospective

> **Équipe 11 · EduTutor IA** · Sprint 3 (mercredi 01/07/2026, soirée)
> **Rédigé par** : Seer MENSAH ASSIAKOLEY (Scrum Master)
> **Date** : 02/07/2026 (matin, avant Sprint Planning 4)
> **Sources** : [sprint3-redispatch.md](../../J3/Gestion_projet/sprint3-redispatch.md) (plan), git log du 01/07, vérification directe du code, [Sprint Backlog v3.0](../../cadrage/artefacts/equipe-11-sprint-backlog-v3.0.xlsx)

---

## 1. Résultat : Sprint 3 clôturé à 100 %

**14/14 tâches Done · 23.25 h planifiées · 0 h restant · 12 SP livrés** (+ US-T1 livrée fonctionnellement, DoD close en Sprint 4 via T-T1.4).

Clôture effective le 01/07 à 23h03 : merge de la [PR #11](https://github.com/APOCALIPSSI-11/IPSSI_APOCAL_KIT/pull/11), pose du tag et publication de la [release v1.0.0-mvp](https://github.com/APOCALIPSSI-11/IPSSI_APOCAL_KIT/releases/tag/v1.0.0-mvp) **avec démo vidéo**.

| Bloc | Tâches | Statut | Preuve |
|---|---|---|---|
| Rôle enseignant (US-26) | T-26.1 / T-26.2 / T-26.3 | ✅ Done | commits `15e40b6`, `f029739`/`48bb8ca`, `ba6b1f4` |
| Dashboard de classe (US-T1) | T-T1.1 / T-T1.2 / T-T1.3 | ✅ Done | commits `aba2de4`, `4d16f3e` (reste T-T1.4 polish+tests → S4) |
| Perturbation J3-bis RGPD/SAR | T-J3B-1 → T-J3B-5 | ✅ Done | `docs/legal/politique-retention.md`, `docs/legal/lettre-sar-hugo-petit.md`, commits `d50371d`/`8891fff`/`e15f53b`, tests `backend/accounts/tests.py` |
| Reliquats J3 | T-SEC-01r / T-ProfilePage-clean / T-Backlog-v3.0 | ✅ Done | commit `e15f53b` (Ollama `/api/chat`), docblock nettoyé, classeur v3.0 |

**Point levé en revue** : l'écart signalé dans le draft v3.0 sur T-26.2 (« marquée Done en ligne mais code introuvable ») est résolu — le code a été poussé par Frederick à 17h08 (`f029739`), après l'audit.

## 2. Critères d'acceptation de la perturbation J3-bis — bilan

| Critère | Statut final |
|---|---|
| CA-J3B-1 endpoint 200 JSON structuré | ✅ `?format=json` + route officielle (commits `e15f53b`, `8891fff`) |
| CA-J3B-2 export 6 catégories | ✅ livré (`8891fff`) ; « rapports » documenté N/A justifié (fonctionnalité inexistante au produit) |
| CA-J3B-3 ≥ 2 formats | ✅ ZIP (JSON+CSV) + JSON direct |
| CA-J3B-4 bouton frontend | ✅ ProfilePage (déblocage bouton corrigé `36ae707`) |
| CA-J3B-5 politique de rétention ≥ 3 sections | ✅ docs/legal/politique-retention.md |
| CA-J3B-6 audit trail SAR persisté | ✅ `RGPDRequestLog` + `status` + `file_hash` SHA-256, exports journalisés |
| CA-J3B-7 réponse professionnelle à Hugo Petit | ✅ docs/legal/lettre-sar-hugo-petit.md |

Piège CNIL (isolation utilisateur) : couvert par des tests dédiés (aucun `objects.all()` non filtré ; test d'anti-fuite inter-comptes).

## 3. Gate Definition of Done du MVP ([mvp-checklist.md](../../J3/Gestion_projet/mvp-checklist.md) §6)

- [x] §1/§2 non-régression F1-F6 + bonus : vérifiée (démo end-to-end rejouée + fixes `af38b7d`, `36ae707`)
- [x] Reliquat Ollama corrigé (T-SEC-01r) — US-SEC-01 close
- [x] US-J3B-1 à 5 toutes Done
- [x] Sprint Backlog à jour (v3.0, statuts = code réel)
- [x] Les 2 écarts résiduels d'ADR-002 traités (Ollama + audit trail export)
- [x] Démo end-to-end rejouée et enregistrée (vidéo jointe à la release)
- [x] Tag posé : `v1.0.0-mvp` sur `abd55a8` (le tag couvre MVP + sécurité J3 + RGPD J3-bis ; la Release 2 « enseignant » sera tagguée `v1.1.0` en Sprint 4)

## 4. Vélocité et métriques

| Sprint | Engagé | Livré | Burndown |
|---|---|---|---|
| Sprint 1 (mar. soir) | 53 h / 9 stories | 33 SP (F1-F6 + US-07/17, US-11/23 partielles) | clôture à 7 h restantes |
| Sprint 2 (mer. journée) | 17 h / pivot J3 | 21 SP (post ré-audit) | clôture à 2.5 h restantes |
| Sprint 3 (mer. soirée) | 23.25 h / 14 tâches | 12 SP + US-T1 fonctionnelle | clôture à 0 h |

Burnup cumulé : 33 → 54 → 66 SP sur un scope réel de 71 SP (+8 stretch non engagés). Détail et graphiques : [Release Planning v3.0](../../cadrage/artefacts/equipe-11-release-planning-v3.0.xlsx) et [Sprint Backlog v3.0](../../cadrage/artefacts/equipe-11-sprint-backlog-v3.0.xlsx).

## 5. Rétrospective Sprint 3

**Ce qui a bien marché**
- Le redispatch factuel (justifié par `git log`, pas par des impressions) a tenu : les 5 contributeurs actifs ont tous livré leurs tâches.
- Hugo HAVET, en charge allégée sur des livrables rédactionnels, a rendu les deux documents RGPD attendus — la stratégie « alléger sans exclure » a fonctionné (il a décroché en début de semaine puis s'est rattrapé).
- Frederick TOUFIK a absorbé la totalité des tâches reprises d'Azeddine (T-26.2, T-SEC-01r, T-J3B-4) et a même ré-audité des tâches Sprint 2 marquées à tort « To Do ».
- La double perturbation J3/J3-bis a été traitée dans le sprint sans sacrifier l'objectif produit (rôle enseignant).

**Ce qui a coûté**
- Surcharge assumée de Seer (9 h planifiées, réalisées) : non soutenable au-delà d'un sprint — à ne pas reproduire en Sprint 4.
- Deux séries de statuts obsolètes dans le classeur (dans les deux sens : du « Done » non fait ET du « To Do » déjà fait) ont exigé deux audits de code. Leçon : le backlog se met à jour au moment du commit, pas en fin de journée.
- CI cassée deux fois par des merges de PR simultanés (`f80c406`, `4bce369`) — leçon : merger séquentiellement et attendre le vert.

**Actions pour le Sprint 4**
1. Mise à jour du backlog en continu (responsable : chaque assigné, contrôle : SM).
2. Merges séquentiels, CI verte obligatoire avant merge suivant.
3. Charge de Seer ramenée ≤ 6 h ; Azeddine et Redouane réintégrés en binôme sur des tâches non bloquantes (préparation soutenance) pour que les 7 membres contribuent et parlent en soutenance.

## 6. Participation individuelle (git log, semaine du 29/06)

| Membre | Contribution vérifiée |
|---|---|
| Seer MENSAH ASSIAKOLEY | SM + artefacts + CI + RGPD/SAR backend + dashboard classe backend + releases/merges |
| Thi Van Anh NGUYEN | Frontend : consentement RGPD, signup enseignant, dashboard classe, profil, admin rôles |
| Frederick TOUFIK | Backend : signup-enseignant, export JSON SAR, Ollama /api/chat, barre de progression/polling |
| Hugo HAVET | Export ZIP RGPD, pages signup/reset (S1), politique de rétention, lettre SAR |
| Romain LEFEVRE | QA : tests adversariaux LLM (TSEC-03), sanitisation XSS, tests export/isolation |
| Azeddine AMARI | 1 commit S1 (modèle User) + personas J1 — réintégré en binôme au Sprint 4 |
| Redouane ID SOUGOU | 0 commit — tâches réaffectées ; réintégré en binôme au Sprint 4 |
