# Suivi des User Stories — EduTutor IA (Équipe 11)

> Analyse croisée entre le Product Backlog v2.0 (`equipe-11-product-backlog-v2.0.xlsx`) et l'état réel du code (30/06/2026).
> Les statuts Excel sont souvent « Todo » ou « Backlog » — ce document reflète **ce qui est effectivement implémenté**.

---

## Légende

| Icône | Signification |
|-------|--------------|
| ✅ | **Terminée** — Backend + Frontend opérationnels |
| 🔄 | **Partiellement implémentée** — Fonctionnel mais incomplet selon les critères d'acceptation |
| ❌ | **Non commencée** — Placeholder ou absente du code |
| 🚫 | **Won't Have** — Hors scope, explicitement exclue |

---

## EP-01 — Identification utilisateur

### US-01 · Créer un compte avec email et mot de passe ✅ TERMINÉE

- **MoSCoW** : MUST | **SP** : 3 | **Sprint** : S1
- **Persona** : Étudiant·e
- **Story** : *En tant qu'étudiant·e, je veux créer un compte avec email et mot de passe, afin de sauvegarder mes quizz et y revenir.*

**Ce qui est fait :**
- Backend : `SignupView` (`accounts/views.py`) — endpoint `POST /api/accounts/signup/` avec validation email + mdp ≥ 8 caractères, email de confirmation envoyé (best-effort via Brevo)
- Frontend : `SignupPage.tsx` — formulaire complet (email, prénom optionnel, nom optionnel, mdp), redirect `/upload` après inscription
- Modèle `User` Django (extension AbstractUser) + migration `0001_initial.py`
- Contrôle admin : l'admin peut fermer les inscriptions (`SiteConfig.allow_signups`)

**Ce qui manque :**
- L'encart RGPD pendant l'inscription est absent (prévu en US-22)

---

### US-07 · Réinitialiser mot de passe via email ✅ TERMINÉE

- **MoSCoW** : SHOULD | **SP** : 3 | **Sprint** : S6 (Excel) → **implémentée avant planning**
- **Persona** : Étudiant·e

**Ce qui est fait :**
- Backend : `PasswordResetRequestView` + `PasswordResetConfirmView` (`accounts/views.py`) — lien magique par email, anti-énumération (réponse identique que l'email existe ou non)
- Tokens sécurisés via `accounts/tokens.py`
- Frontend : `ForgotPasswordPage.tsx` + `ResetPasswordPage.tsx`

**Critères d'acceptation :** lien magique valide 24 h + redirect `/reset-password` → **TOUS SATISFAITS**

---

### US-13 · Connexion OAuth Google / Apple ❌ NON COMMENCÉE

- **MoSCoW** : COULD | **SP** : 5 | **Sprint** : n.c.
- Aucune trace de `django-allauth` ou de boutons OAuth dans le code.
- Prévu pour R3+.

---

### US-18 · SSO entreprise SAML/OIDC 🚫 WON'T

- Reporté R3+, cible B2B post-prototype. Hors scope actuel.

---

### US-22 · Encart RGPD pendant l'inscription ❌ NON COMMENCÉE

- **MoSCoW** : SHOULD | **SP** : 1 | **Sprint** : S6 (Excel Statut : Todo)
- `SignupPage.tsx` ne contient aucun encart RGPD ni lien vers la politique de confidentialité.
- Les pages légales existent (`ConfidentialitePage.tsx`, `CGUPage.tsx`) mais ne sont pas liées depuis le formulaire d'inscription.

---

### US-26 · Compte enseignant sans validation manuelle ❌ NON COMMENCÉE

- **MoSCoW** : SHOULD | **SP** : 3 | **Sprint** : S6 (Excel Statut : Todo ⚠ prioritaire)
- Aucune route `/signup-enseignant` ni distinction de rôle enseignant dans le code. L'inscription est générique (tous profils confondus).
- Pas de champ "type de compte" dans `SignupPage.tsx` ni dans `SignupSerializer`.

---

## EP-02 — Gestion de contenu

### US-02 · Uploader un PDF ou saisir un texte de cours ✅ TERMINÉE

- **MoSCoW** : MUST | **SP** : 5 | **Sprint** : S1
- **Persona** : Étudiant·e

**Ce qui est fait :**
- Backend : `GenerateQuizView` (`llm/views.py`) — `POST /api/llm/generate-quiz/` accepte multipart (PDF ≤ 5 Mo) **ou** JSON (`source_text` ≥ 200 caractères). Extraction texte via `pdf_utils.py` (PyPDF2).
- Frontend : `UploadPage.tsx` — switch mode texte/PDF, dropzone fichier, textarea, compteur de caractères en temps réel.
- Validation côté client + serveur.

**Critères d'acceptation :** contenu extrait, stocké, bouton "Générer" visible → **TOUS SATISFAITS**

---

### US-08 · Bibliothèque des cours uploadés ❌ NON COMMENCÉE

- **MoSCoW** : SHOULD | **SP** : 5 | **Sprint** : S6 (Backlog)
- Pas de modèle `Course` distinct, ni de page `/library`. Les cours uploadés sont directement rattachés à un quiz (champ `source_text` sur le modèle `Quiz`).

---

### US-14 · Import cours depuis une URL web ❌ NON COMMENCÉE

- **MoSCoW** : COULD | **SP** : 8 | **Sprint** : n.c.
- Aucun scraping / champ URL dans le code. Prévu R3+.

---

## EP-03 — Génération de quiz

### US-03 · Générer un quiz de 10 QCM en moins de 60 s ✅ TERMINÉE

- **MoSCoW** : MUST | **SP** : 8 | **Sprint** : S2
- **Persona** : Étudiant·e

**Ce qui est fait :**
- Backend : `GenerateQuizView` + couche de services LLM polymorphe (`llm/services/`) supportant Ollama, Groq, OpenAI, Anthropic, Gemini, Mistral, Cerebras, OpenRouter, Mock.
- Prompt structuré dans `quiz_prompt.py`, parsing JSON robuste.
- Persistance en base : modèles `Quiz` + `Question` dans une transaction atomique.
- Frontend : bouton dans `UploadPage.tsx` → redirect sur `QuizPage.tsx` après création.

**Note sur le délai < 60 s :** garanti uniquement avec un provider cloud (Groq, Anthropic…). Sur CPU Ollama, peut dépasser. Le message UX prévient l'utilisateur ("1 à 5 min sur CPU").

---

### US-09 · Choisir difficulté et nombre de questions (5-20) ❌ NON COMMENCÉE

- **MoSCoW** : SHOULD | **SP** : 5 | **Sprint** : S6 (Backlog)
- Quiz fixé à 10 questions, aucun paramètre de difficulté ou de nombre dans `GenerateQuizSerializer` ni dans le prompt.

---

### US-15 · Questions ouvertes corrigées par LLM ❌ NON COMMENCÉE

- **MoSCoW** : COULD | **SP** : 13 | **Sprint** : n.c.
- Uniquement du QCM. Prévu R3+. (13 SP = seuil de redécoupage à faire avant prise en sprint.)

---

### US-19 · Chatbot IA dialogue 🚫 WON'T

- Concurrent direct de Khanmigo, hors stratégie produit.

---

## EP-04 — Passage de quiz

### US-04 · Soumettre ses réponses et obtenir une correction automatique ✅ TERMINÉE

- **MoSCoW** : MUST | **SP** : 3 | **Sprint** : S3

**Ce qui est fait :**
- Backend : `AnswerQuizView` (`quizzes/views.py`) — `POST /api/quizzes/<id>/answer/` reçoit 10 réponses, compare chacune à `correct_index`, persiste `selected_index` sur chaque `Question`, retourne `{score, total, details}`.
- Frontend : `QuizPage.tsx` — sélection des réponses, bouton "Soumettre mes réponses" (désactivé tant que < 10 réponses), appel API, affichage résultat.

---

### US-05 · Voir son score /10 et le détail bonnes/mauvaises réponses ✅ TERMINÉE

- **MoSCoW** : MUST | **SP** : 3 | **Sprint** : S3

**Ce qui est fait :**
- Backend : la réponse de `AnswerQuizView` contient `score`, `total` et `details` (index, selected, correct, correct?).
- Frontend : `QuizPage.tsx` — bandeau coloré (vert/ambre/rouge selon score), indication ✓/✗ par option, message d'encouragement contextuel.

---

### US-10 · Mode timer optionnel par question ❌ NON COMMENCÉE

- **MoSCoW** : SHOULD | **SP** : 3 | **Sprint** : S7 (Backlog)
- Aucun timer dans `QuizPage.tsx`. Prévu R3+.

---

### US-20 · Mode compétition multi-joueurs 🚫 WON'T

- Hors stratégie produit (gamification compétitive). Abandonné.

---

## EP-05 — Suivi de progression

### US-06 · Consulter l'historique de ses quizz passés ✅ TERMINÉE

- **MoSCoW** : MUST | **SP** : 3 | **Sprint** : S4

**Ce qui est fait :**
- Backend : `QuizListView` (`quizzes/views.py`) — `GET /api/quizzes/` retourne la liste des quiz triés par date décroissante.
- Frontend : `HistoryPage.tsx` — affiche titre, date, score (coloré), "pas encore passé" si score null, lien vers le quiz pour le repasser.

---

### US-11 · Dashboard de progression par chapitre 🔄 PARTIELLEMENT IMPLÉMENTÉE

- **MoSCoW** : SHOULD | **SP** : 5 | **Sprint** : S7 (Backlog)

**Ce qui est fait :**
- Backend : `StatsView` (`quizzes/views.py`) — agrège quiz passés, score moyen, meilleur score, précision globale, historique chronologique.
- Frontend : `DashboardPage.tsx` — 4 cartes KPI (quiz passés, score moyen, meilleur score, précision) + graphique en barres maison (progression des scores dans le temps).
- Bonus : `MistakesView` + `ReviewMistakesPage.tsx` pour réviser les erreurs.

**Ce qui manque :**
- Aucune agrégation **par chapitre** (le critère d'acceptation demande "graphique en barres score / chapitre"). Le dashboard est chronologique, pas thématique.
- Pas de tag chapitre sur les questions générées.

---

### US-T1 · Tableau de bord de classe (enseignant) ❌ NON COMMENCÉE

- **MoSCoW** : SHOULD | **SP** : 5 | **Sprint** : S6 (Excel Statut : Todo ⚠ prioritaire)
- Aucune notion de "classe" ou "groupe d'étudiants" dans les modèles. Pas de route `/dashboard-classe`.

---

### US-T2 · Filtres du dashboard classe ❌ NON COMMENCÉE

- **MoSCoW** : SHOULD | **SP** : 3 | **Sprint** : S6 (Backlog stretch S7)
- Dépend de US-T1. Non commencée.

---

### US-T3 · Alertes de révision personnalisées aux étudiants ❌ NON COMMENCÉE

- **MoSCoW** : SHOULD | **SP** : 5 | **Sprint** : S7 (Backlog stretch S7)
- Aucun système de messagerie / email vers étudiants depuis un espace enseignant. Non commencée.

---

### US-16 · Identifier les lacunes par chapitre ❌ NON COMMENCÉE

- **MoSCoW** : COULD | **SP** : 8 | **Sprint** : n.c.
- Aucun tag chapitre sur les questions. Prévu R3+.

---

## EP-06 — Conformité & administration

### US-12 · Exporter toutes ses données en JSON et CSV (RGPD Art. 15) ❌ NON COMMENCÉE

- **MoSCoW** : SHOULD | **SP** : 5 | **Sprint** : S5 (⚠ **OBLIGATOIRE J3-bis**, hors budget R2)
- **PRIORITÉ CRITIQUE** : exigé par la perturbation J3-bis, à livrer en Sprint 5.

**État actuel :**
- Frontend : `ProfilePage.tsx` — bouton "Exporter mes données (bientôt)" **désactivé** (`disabled + opacity-60`), marqué `[TODO J3-bis RGPD]`.
- Backend : `ProfileView.delete` contient un commentaire `# [TODO J3-bis RGPD] Avant de supprimer, proposer un export...` mais aucun endpoint d'export n'existe.
- **Aucune logique** d'export JSON/CSV ni de génération de ZIP.

---

### US-17 · Supprimer son compte (RGPD Art. 17 — droit à l'oubli) ✅ TERMINÉE

- **MoSCoW** : COULD | **SP** : 5 | **Sprint** : n.c. (Excel Statut : Backlog) → **implémentée avant planning**

**Ce qui est fait :**
- Backend : `ProfileView.delete` (`accounts/views.py`) — hard delete avec confirmation mot de passe, invalidation token, logout. Supprime le profil en cascade.
- Frontend : `ProfilePage.tsx` — zone de danger avec confirmation mot de passe + checkbox "je comprends que c'est irréversible".

**Note :** La suppression est définitive (hard delete), pas de cron de purge à 30 j comme suggéré dans les critères.

---

### US-28 · Télécharger une fiche RGPD pré-rédigée ❌ NON COMMENCÉE

- **MoSCoW** : SHOULD | **SP** : 1 | **Sprint** : Backlog R3+
- Aucun PDF RGPD ni route de téléchargement.

---

### US-29 · Check-list RGPD pré-validée pour DPO ❌ NON COMMENCÉE

- **MoSCoW** : COULD | **SP** : 2 | **Sprint** : Backlog R3+

---

### US-31 · Comparaison adoption multi-établissements 🚫 WON'T

- Nécessite une base installée multi-établissements. Reporté.

---

## EP-07 — Acquisition & mise en confiance

### US-21 · Témoignages d'étudiants sur la landing page ❌ NON COMMENCÉE

- **MoSCoW** : SHOULD | **SP** : 2 | **Sprint** : Backlog R3+
- `HomePage.tsx` existe mais ne contient pas de section témoignages.

---

## EP-08 — Feedback & guidage temps réel

### US-23 · Progression visible pendant la génération du quiz 🔄 PARTIELLEMENT IMPLÉMENTÉE

- **MoSCoW** : SHOULD | **SP** : 5 | **Sprint** : S6 (Excel Statut : Todo ⚠ prioritaire)

**Ce qui est fait :**
- Frontend : `UploadPage.tsx` — le bouton "Générer le quiz" affiche `⏳ Génération en cours… (1 à 5 min…)` avec une icône `animate-spin` pendant le chargement.

**Ce qui manque selon les critères d'acceptation :**
- Pas de **barre de progression** dédiée (seulement un spinner sur le bouton).
- Pas de rafraîchissement toutes les 5 s (l'appel est synchrone, il n'y a pas de polling).
- Le critère demande explicitement : "barre de progression / spinner visible, rafraîchi toutes les 5 s".

---

### US-27 · Prévisualiser les questions avant de les publier (enseignant) ❌ NON COMMENCÉE

- **MoSCoW** : SHOULD | **SP** : 3 | **Sprint** : Backlog R3+
- Pas d'écran de preview enseignant.

---

## EP-09 — Continuité hors-ligne

### US-24 · Consulter l'historique sans connexion ❌ NON COMMENCÉE

- **MoSCoW** : COULD | **SP** : 8 | **Sprint** : Backlog R3+
- Aucun service worker ni cache IndexedDB. Prévu R3+.

---

## EP-10 — Partage & viralité

### US-25 · Partager un quiz avec ses amis de promo ❌ NON COMMENCÉE

- **MoSCoW** : COULD | **SP** : 5 | **Sprint** : Backlog R3+
- Aucun système de lien de partage ni d'accès en lecture pour un destinataire.

---

## EP-11 — Réussite du déploiement établissement

### US-30 · Kit de déploiement accessible depuis l'app ❌ NON COMMENCÉE

- **MoSCoW** : COULD | **SP** : 3 | **Sprint** : Backlog R3+

---

## Tableau de synthèse global

| ID | Epic | Statut réel | MoSCoW | SP | Sprint prévu |
|----|------|-------------|--------|----|--------------|
| US-01 | EP-01 | ✅ Terminée | MUST | 3 | S1 |
| US-02 | EP-02 | ✅ Terminée | MUST | 5 | S1 |
| US-03 | EP-03 | ✅ Terminée | MUST | 8 | S2 |
| US-04 | EP-04 | ✅ Terminée | MUST | 3 | S3 |
| US-05 | EP-04 | ✅ Terminée | MUST | 3 | S3 |
| US-06 | EP-05 | ✅ Terminée | MUST | 3 | S4 |
| US-07 | EP-01 | ✅ Terminée | SHOULD | 3 | S6 |
| US-17 | EP-06 | ✅ Terminée | COULD | 5 | n.c. |
| US-11 | EP-05 | 🔄 Partielle | SHOULD | 5 | S7 |
| US-23 | EP-08 | 🔄 Partielle | SHOULD | 5 | S6 |
| US-12 | EP-06 | ❌ Non commencée ⚠ | SHOULD | 5 | S5 (J3-bis) |
| US-22 | EP-01 | ❌ Non commencée | SHOULD | 1 | S6 |
| US-26 | EP-01 | ❌ Non commencée | SHOULD | 3 | S6 |
| US-T1 | EP-05 | ❌ Non commencée | SHOULD | 5 | S6 |
| US-T2 | EP-05 | ❌ Non commencée | SHOULD | 3 | S6 |
| US-T3 | EP-05 | ❌ Non commencée | SHOULD | 5 | S7 |
| US-08 | EP-02 | ❌ Non commencée | SHOULD | 5 | S6 |
| US-09 | EP-03 | ❌ Non commencée | SHOULD | 5 | S6 |
| US-10 | EP-04 | ❌ Non commencée | SHOULD | 3 | S7 |
| US-21 | EP-07 | ❌ Non commencée | SHOULD | 2 | R3+ |
| US-27 | EP-08 | ❌ Non commencée | SHOULD | 3 | R3+ |
| US-28 | EP-06 | ❌ Non commencée | SHOULD | 1 | R3+ |
| US-13 | EP-01 | ❌ Non commencée | COULD | 5 | n.c. |
| US-14 | EP-02 | ❌ Non commencée | COULD | 8 | n.c. |
| US-15 | EP-03 | ❌ Non commencée | COULD | 13 | n.c. |
| US-16 | EP-05 | ❌ Non commencée | COULD | 8 | n.c. |
| US-24 | EP-09 | ❌ Non commencée | COULD | 8 | R3+ |
| US-25 | EP-10 | ❌ Non commencée | COULD | 5 | R3+ |
| US-29 | EP-06 | ❌ Non commencée | COULD | 2 | R3+ |
| US-30 | EP-11 | ❌ Non commencée | COULD | 3 | R3+ |
| US-18 | EP-01 | 🚫 Won't | WON'T | 13 | - |
| US-19 | EP-03 | 🚫 Won't | WON'T | 21 | - |
| US-20 | EP-04 | 🚫 Won't | WON'T | 13 | - |
| US-31 | EP-06 | 🚫 Won't | WON'T | 13 | - |

---

## Résumé chiffré

| Catégorie | Nb US | SP |
|-----------|-------|----|
| ✅ Terminées | 8 | 33 |
| 🔄 Partielles | 2 | 10 |
| ❌ Non commencées (prioritaires MUST/SHOULD) | 14 | 50 |
| ❌ Non commencées (COULD / R3+) | 8 | 53 |
| 🚫 Won't Have | 4 | 60 |
| **TOTAL** | **36** | **206** |

---

## Points d'attention immédiats

1. **US-12 (Export RGPD)** : livraison **obligatoire** pour la perturbation J3-bis (Sprint 5). Seul un placeholder désactivé existe. À implémenter en priorité absolue — endpoint `GET /api/accounts/export/` retournant un ZIP `quizz.json + reponses.csv`.

2. **US-22 (Encart RGPD inscription)** : simple à implémenter (1 SP), bloque la conformité légale de US-01. Ajouter un encart avec lien vers `/legal/confidentialite` dans `SignupPage.tsx`.

3. **US-23 (Barre de progression)** : le spinner sur bouton existe mais ne satisfait pas les critères (barre dédiée + rafraîchissement 5 s). Priorité S6.

4. **US-T1/T2/T3 (Dashboard enseignant)** : zéro base de code. Rôle enseignant non modélisé. Charge de travail importante avant S6.

5. **US-26 (Compte enseignant)** : nécessite d'ajouter un rôle `teacher` + route `/signup-enseignant` dans le frontend ET le backend.
