# Redispatch — Sprint 3

> **Équipe 11 · EduTutor IA** · Sprint 3
> **Rédigé par** : Seer MENSAH ASSIAKOLEY (Scrum Master)
> **Date** : 01/07/2026
> **Dépend de** : [sprint2-revue.md](../J3/sprint2-revue.md) (écarts constatés), perturbation [J3-bis RGPD](https://mohamedelafrit.com/teaching/APOCALIPSSI/pages/perturbations/j3bis-rgpd.php)

---

## 1. Contexte de la réaffectation

| Membre | Situation | Décision |
|---|---|---|
| **Redouane ID SOUGOU** | Aucun commit depuis le Sprint 1 (0 commit sur tout l'historique du dépôt) | Retiré de la planification active. Ses tâches Sprint 3 (T-T1.2) sont réaffectées. |
| **Azeddine AMARI** | 1 seul commit sur tout l'historique, aucune activité Sprint 2 | Retiré de la planification active. Ses tâches Sprint 3 (T-26.1) et le reliquat Sprint 2 (T-SEC-01) sont réaffectés. |
| **Hugo HAVET** | contribution réelle vérifiée (export ZIP RGPD, signup, password reset) | **Charge allégée, pas retiré** : passe de 2h de code (T-26.3) à 2.5h de tâches de rédaction non-bloquantes (politique de rétention + lettre de réponse SAR), sans dépendance critique du chemin. |
| **Romain LEFEVRE** | Annoncé "a fini ses tâches" | **Vérifié dans le code** : T-SEC-03 (tests adversariaux) et T-11.4 (agrégation par chapitre) sont bien présents et testés (cf. [sprint2-revue.md](../J3/sprint2-revue.md) §2). Conserve son rôle QA, reçoit une tâche de vérification légère pour le Sprint 3. |
| **Van Anh NGUYEN, Frederick TOUFIK, Seer MENSAH ASSIAKOLEY** | Actifs, capacité disponible | Absorbent les réaffectations ci-dessus, répartition détaillée §4. |

**Capacité réelle du sprint** : la capacité nominale du classeur (7 × 3.5 h ≈ 24.5 h-pers) suppose 7 contributeurs actifs. En pratique, 2 membres n'apportent aucune capacité fiable (Redouane, Azeddine) et 1 membre est réduit (Hugo). La capacité réelle repose donc sur **5 personnes** avec une charge volontairement inégale (Seer absorbe le plus gros du report, comme demandé).

---

## 2. Reliquats Sprint 2 reportés (avant les nouvelles US)

| ID | Tâche | Était assigné à | Réaffecté à | Estim. |
|---|---|---|---|---|
| T-SEC-01 (reliquat) | Séparation system/user pour le client Ollama (`llm/services/ollama_client.py:32-35`) — actuellement le prompt système et le cours sont concaténés car `/api/generate` ne sépare pas les rôles ; passer par `/api/chat` avec un tableau `messages` résout le problème | Azeddine AMARI | **Frederick TOUFIK** | 1h |
| Fix audit trail export | `ExportDataView.get()` ne journalise pas la demande dans `RGPDRequestLog` (`accounts/views.py:296-300`, TODO jamais traité) | — (bug non assigné) | **Seer MENSAH ASSIAKOLEY** (fusionné dans US-J3B-2, §3) | 0.5h |
| Nettoyage docblock | `ProfilePage.tsx:13-15` — TODO obsolètes ("placeholder à implémenter") alors que la fonctionnalité est livrée | — | **Van Anh NGUYEN** | 0.25h |
| MàJ Sprint Backlog v2.4 | Corriger les statuts obsolètes identifiés en revue (T-SEC-02, T-RGPD-01.1/01.2, T-SEC-03) | — | **Seer MENSAH ASSIAKOLEY** | 0.5h |

---

## 3. Nouvelles User Stories — perturbation J3-bis (RGPD / SAR)

**Scénario** : une demande RGPD Art. 15 formelle (droit d'accès) d'un utilisateur fictif, *Hugo Petit* (`hugo.petit@test.local`), impose 5 livrables : endpoint d'export structuré, bouton frontend, politique de rétention écrite, piste d'audit SAR, lettre de réponse professionnelle.

> ⚠️ **Attention en daily** : la persona de cette perturbation s'appelle *Hugo Petit* — à ne pas confondre avec **Hugo Havet**, membre de l'équipe, qui rédige justement la lettre de réponse qui lui est adressée.

**Ce qui est déjà acquis** (vérifié dans le code, cf. [sprint2-revue.md](../J3/sprint2-revue.md) §2) :
- Endpoint d'export existant et fonctionnel (`GET /api/accounts/export/`, ZIP contenant JSON + CSV) → couvre déjà CA-J3B-2 (catégories user/quizzes/réponses) et CA-J3B-3 (≥ 2 formats) et CA-J3B-4 (bouton frontend actif).
- Il manque : la conformité *littérale* de CA-J3B-1 (l'énoncé attend une réponse JSON structurée en 200 ; l'implémentation actuelle renvoie un binaire ZIP), la politique de rétention, l'audit trail complet, et la lettre de réponse.

| ID | User Story / Tâche | Assigné | Estim. |
|---|---|---|---|
| **US-J3B-1** | Politique de rétention des données (≤ 1 page : durées de conservation par type de donnée · base légale Art. 6 · procédure de suppression Art. 17), livrée en Markdown dans `docs/J3/` | **Hugo HAVET** | 1.5h |
| **US-J3B-2** | Étendre `RGPDRequestLog` : logger aussi les demandes d'export (fix §2), ajouter les champs `status` (received/processing/answered) et `file_hash` (empreinte SHA-256 de l'archive générée) pour tracer chaque réponse SAR | **Seer MENSAH ASSIAKOLEY** | 2h |
| **US-J3B-3** | Lettre de réponse professionnelle au SAR de Hugo Petit : accusé de réception, lien de téléchargement, explication des données, rappel des droits Art. 16/17/18/20, contact DPO fictif | **Hugo HAVET** | 1h |
| **US-J3B-4** | Vérifier/adapter le format de l'endpoint d'export pour satisfaire littéralement les critères d'acceptation J3B (réponse JSON structurée disponible en plus du ZIP existant, sans casser le flux frontend actuel) | **Frederick TOUFIK** | 1.5h |
| **US-J3B-5** | Vérification QA : couvrir US-J3B-2/4 par des tests (endpoint export loggue bien, format JSON valide, isolation stricte par utilisateur — piège CNIL du persona J3B : ne jamais faire `Model.objects.all()` sans filtre `user=`) | **Romain LEFEVRE** | 1.5h |

---

## 4. Sprint Backlog Sprint 3 — vue consolidée après redispatch

| US | ID tâche | Tâche | Assigné | Estim. (h) | Origine |
|---|---|---|---|---|---|
| US-26 | T-26.1 | Backend : champ `role` sur `User` + migration | **Frederick TOUFIK** *(repris d'Azeddine)* | 2 | Backlog v2.3 |
| US-26 | T-26.2 | Backend : endpoint `POST /api/accounts/signup-enseignant/` | Frederick TOUFIK | 2 | Backlog v2.3 |
| US-26 | T-26.3 | Frontend : route `/signup-enseignant` + formulaire dédié | **Van Anh NGUYEN** *(repris de Hugo)* | 2 | Backlog v2.3 |
| US-T1 | T-T1.1 | Backend : modèle Classe/Groupe + relation enseignant-étudiants | Seer MENSAH ASSIAKOLEY | 3 | Backlog v2.3 |
| US-T1 | T-T1.2 | Backend : endpoint `GET /api/dashboard-classe/` | **Seer MENSAH ASSIAKOLEY** *(repris de Redouane)* | 3 | Backlog v2.3 |
| US-T1 | T-T1.3 | Frontend : route `/dashboard-classe` + composants KPI | Van Anh NGUYEN | 2 | Backlog v2.3 |
| Reliquat J3 | T-SEC-01r | Séparation system/user Ollama (`/api/chat`) | **Frederick TOUFIK** *(repris d'Azeddine)* | 1 | Sprint 2 |
| Reliquat J3 | — | Nettoyage docblock `ProfilePage.tsx` | Van Anh NGUYEN | 0.25 | Sprint 2 |
| Reliquat J3 | — | MàJ Sprint Backlog v2.4 (statuts corrigés) | Seer MENSAH ASSIAKOLEY | 0.5 | Sprint 2 |
| US-J3B-1 | — | Politique de rétention RGPD | Hugo HAVET | 1.5 | J3-bis |
| US-J3B-2 | — | Audit trail SAR complet (export loggué + statut + hash) | Seer MENSAH ASSIAKOLEY *(inclut le fix export, 0.5h)* | 2 | J3-bis |
| US-J3B-3 | — | Lettre de réponse SAR (Hugo Petit) | Hugo HAVET | 1 | J3-bis |
| US-J3B-4 | — | Conformité format endpoint export (JSON structuré) | Frederick TOUFIK | 1.5 | J3-bis |
| US-J3B-5 | — | Tests QA export + audit trail (isolation utilisateur) | Romain LEFEVRE | 1.5 | J3-bis |
| **TOTAL** | | **15 tâches** | | **23.75 h** | |

### Charge par personne (comparée à la capacité nominale 3.5 h)

| Membre | Charge Sprint 3 | vs nominal 3.5h | Commentaire |
|---|---|---|---|
| Seer MENSAH ASSIAKOLEY | 9 h | ×2.6 | Surcharge assumée volontairement (SM + dev), à surveiller en daily |
| Frederick TOUFIK | 6.5 h | ×1.9 | Absorbe la majorité des tâches backend d'Azeddine |
| Van Anh NGUYEN | 4.25 h | ×1.2 | Absorbe le frontend de Hugo + petit nettoyage |
| Hugo HAVET | 2.5 h | ×0.7 | Charge allégée, tâches de rédaction non-bloquantes uniquement |
| Romain LEFEVRE | 1.5 h | ×0.4 | Rôle QA maintenu, léger — ses tâches Sprint 2 sont confirmées Done |
| Azeddine AMARI | 0 h | — | Retiré de la planification active |
| Redouane ID SOUGOU | 0 h | — | Retiré de la planification active |

**Point de vigilance à porter en Sprint Planning** : la charge de Seer (9h) est ~2.6× la capacité nominale d'une personne. C'est un choix assumé ("n'hésitez pas à me surcharger") mais si le Sprint 3 dérive, la priorité de retrait est : d'abord T-T1.2 (dashboard-classe, peut glisser en Sprint 4 comme déjà prévu pour T-T1.4), puis US-J3B-2 peut se limiter au strict minimum CA-J3B-6 (juste logger l'export, sans les champs `status`/`file_hash` bonus).
