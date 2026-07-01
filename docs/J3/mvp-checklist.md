# Checklist de validation MVP — fin de Sprint 3

> **Équipe 11 · EduTutor IA**
> **Rédigé par** : Seer MENSAH ASSIAKOLEY (Scrum Master)
> **Date** : 01/07/2026
> **Objectif** : garantir que toutes les fonctionnalités du MVP (Sprint 1 + Sprint 2 + reliquats) sont réellement livrées avant la démo de fin de Sprint 3, en distinguant "marqué Done" de "vérifié dans le code".
> **Convention** : ✅ Vérifié dans le code (avec preuve) · ⚠️ Partiel / à surveiller · ❌ Manquant, action requise

---

## 1. Cœur du MVP (F1-F6, Sprint 1)

| # | Fonctionnalité | US | Statut | Preuve |
|---|---|---|---|---|
| F1 | Inscription (signup) | US-01 | ✅ | `backend/accounts/views.py::SignupView`, `frontend/src/pages/SignupPage.tsx` |
| F2 | Upload de cours (PDF + texte) | US-02 | ✅ | `backend/courses/`, `frontend/src/pages/UploadPage.tsx` |
| F3 | Génération de quiz (LLM) | US-03 | ✅ | `backend/llm/services/`, transaction atomique testée (`test_generate_quiz_rolls_back_on_question_insert_failure`) |
| F4 | Réponse au quiz + score | US-04 | ✅ | `backend/quizzes/views.py::AnswerQuizView`, `frontend/src/pages/QuizPage.tsx` |
| F5 | Affichage du score détaillé | US-05 | ✅ | Frontend bandeau score coloré |
| F6 | Historique des quiz | US-06 | ✅ | `backend/quizzes/views.py::QuizListView`, `frontend/src/pages/HistoryPage.tsx` |

**Gate F1-F6 : ✅ OK.** Cœur du MVP confirmé livré et fonctionnel.

---

## 2. Bonus Sprint 1-2

| # | Fonctionnalité | US | Statut | Preuve |
|---|---|---|---|---|
| Reset mot de passe | US-07 | ✅ | `PasswordResetRequestView` / `PasswordResetConfirmView` + pages dédiées |
| Suppression de compte (droit à l'oubli, Art. 17) | US-17 | ✅ | `ProfileView.delete()`, journalisé dans `RGPDRequestLog` (`request_type="delete"`) |
| Dashboard de progression | US-11 | ✅ | `StatsView` (agrégation par chapitre confirmée, `Case/When`), `DashboardPage.tsx` |
| Feedback génération (spinner + barre + polling) | US-23 | ✅ | `QuizStatusView`, polling frontend confirmé dans `UploadPage.tsx` |

**Gate bonus : ✅ OK.**

---

## 3. Sécurité LLM (perturbation J3A, décision technique dans [ADR-002](../adr/ADR-002-securisation-llm-rgpd-j3a.md))

| # | Item | US | Statut | Preuve / action |
|---|---|---|---|---|
| Structured prompting (OpenAI/Anthropic) | US-SEC-01 | ✅ | Séparation system/user confirmée dans `openai_compatible.py`, `anthropic_client.py` |
| Structured prompting (Ollama) | US-SEC-01 | ❌ | `ollama_client.py:32-35` concatène encore system+user — **reliquat Sprint 3, assigné Frederick TOUFIK** ([sprint3-redispatch.md](sprint3-redispatch.md) §2) |
| Validation stricte post-LLM (schéma + anti-XSS) | US-SEC-02 | ✅ | `parse_and_validate_quiz` — 10 questions/4 options/`correct_index` validé + échappement HTML |
| Tests adversariaux (injection + XSS) en CI | US-SEC-03 | ✅ | `backend/llm/tests.py` : `test_security_prompt_injection_ignored`, `test_security_xss_injection_escaped`, `test_security_invalid_correct_index_raises_llm_error` |

**Gate sécurité : ⚠️ OK avec 1 réserve documentée** (Ollama), non-bloquante pour la démo (le provider OpenAI-compatible est celui utilisé en configuration Pro/Standard par défaut, cf. [ADR-0001](../adr/ADR-001-choix-llm.md)), corrigée en tout début de Sprint 3.

---

## 4. RGPD initial (perturbation J3)

| # | Item | US | Statut | Preuve / action |
|---|---|---|---|---|
| Consentement explicite à l'inscription | US-RGPD-02 | ✅ | `SignupPage.tsx` : checkbox obligatoire + liens CGU/confidentialité, bouton désactivé sans consentement |
| Export des données (ZIP JSON+CSV) | US-RGPD-01 | ✅ | `GET /api/accounts/export/`, bouton actif dans `ProfilePage.tsx` |
| Audit trail des suppressions | US-RGPD-01.3 | ✅ | `RGPDRequestLog` créé sur `ProfileView.delete()` |
| Audit trail des exports | US-RGPD-01.3 | ❌ | `ExportDataView.get()` ne journalise rien — **repris et étendu par US-J3B-2**, assigné Seer |

**Gate RGPD initial : ⚠️ OK avec 1 réserve**, traitée par la perturbation suivante (§5).

---

## 5. RGPD / SAR (perturbation J3-bis) — critères d'acceptation officiels

| Critère | Description | Statut à date | Action Sprint 3 |
|---|---|---|---|
| CA-J3B-1 | Endpoint retourne 200 avec données structurées | ⚠️ Retourne un ZIP binaire, pas un JSON direct | US-J3B-4 (Frederick) |
| CA-J3B-2 | Export inclut 6 catégories (user, quizzes, réponses, rapports, logs) | ⚠️ User/quizzes/réponses présents ; "rapports" **n'existe pas comme fonctionnalité produit** (aucun système de signalement de contenu livré — seulement un TODO `[TODO J4]` dans `ProfilePage.tsx:15`, non planifié avant le Sprint 3) ; logs d'audit pas inclus dans l'export lui-même | US-J3B-4 : documenter explicitement l'absence de "rapports" comme N/A justifié plutôt que comme un manque |
| CA-J3B-3 | ≥ 2 formats disponibles (ex. JSON + CSV) | ✅ | Déjà satisfait (ZIP contient JSON + CSV) |
| CA-J3B-4 | Bouton frontend présent en zone authentifiée | ✅ | `ProfilePage.tsx` |
| CA-J3B-5 | Politique de rétention écrite, ≥ 3 sections | ❌ | US-J3B-1 (Hugo HAVET) |
| CA-J3B-6 | Audit trail SAR persisté en base | ⚠️ Partiel (delete seulement) | US-J3B-2 (Seer) |
| CA-J3B-7 | Réponse professionnelle et structurée à Hugo Petit | ❌ | US-J3B-3 (Hugo HAVET) |

**⚠️ Anti-pattern à vérifier explicitement (piège CNIL signalé par la perturbation)** : s'assurer qu'aucune vue RGPD n'utilise `Model.objects.all()` sans filtrer par `user=request.user` — vérifié dans `ExportDataView` actuel (filtre `Quiz.objects.filter(user=user)` présent partout), à re-vérifier pour toute nouvelle vue créée en Sprint 3 (US-J3B-5, Romain LEFEVRE).

---

## 6. Definition of Done — Gate de sortie Sprint 3 (livraison MVP)

Le MVP est considéré **livrable** en fin de Sprint 3 si et seulement si :

- [ ] §1 et §2 restent verts (non-régression F1-F6 + bonus)
- [ ] Le reliquat Ollama (US-SEC-01) est corrigé **ou** documenté comme risque accepté si le temps manque (cf. seuil de retrait dans [sprint3-redispatch.md](sprint3-redispatch.md) §4)
- [ ] US-J3B-1 à US-J3B-5 sont toutes au moins à l'état "Done" ou explicitement reportées en Sprint 4 avec justification écrite
- [ ] Le Sprint Backlog est mis à jour en v2.4 avec des statuts qui reflètent l'état réel du code (plus d'écart entre classeur et code, cf. [sprint2-revue.md](../J3/sprint2-revue.md) §2)
- [ ] Les 2 écarts résiduels documentés dans [ADR-002](../adr/ADR-002-securisation-llm-rgpd-j3a.md) (Ollama, audit trail export) sont traités conformément aux tâches Sprint 3 qui leur sont assignées
- [ ] Une démo end-to-end est rejouée : signup (avec consentement) → upload → génération quiz → réponse → score → export (avec audit trail visible en base `RGPDRequestLog`) → politique de rétention accessible → lettre de réponse SAR présentée
- [ ] Tag Git de livraison posé (à définir : `v1.0.0-mvp` a déjà été utilisé en clôture Sprint 2 — prévoir un tag dédié type `v1.1.0-rc` ou équivalent pour la clôture Sprint 3, à confirmer avec le PO)

---

## 7. Risques portés en Sprint 4 si le Sprint 3 est trop chargé

Si la charge de 23.75h identifiée dans [sprint3-redispatch.md](sprint3-redispatch.md) §4 s'avère intenable avec 5 contributeurs réels, l'ordre de retrait recommandé (du moins critique au plus critique pour le MVP) est :

1. T-T1.2 (dashboard-classe backend) → glisse en Sprint 4 (déjà amorti par T-T1.4 "Polish" prévu en Sprint 4)
2. US-J3B-2 limité au strict CA-J3B-6 (logger l'export) sans les champs bonus `status`/`file_hash`
3. US-26 (rôle enseignant) dans son ensemble, si nécessaire — c'est une ouverture de périmètre (Release 2), pas un engagement RGPD/sécurité obligatoire
4. **Ne jamais retirer** : US-J3B-1/3/5 (rédaction, non-bloquant en effort mais attendu par les critères d'acceptation formatifs de la perturbation) et le reliquat Ollama (risque sécurité documenté par un ADR, doit être clos ou explicitement accepté)
