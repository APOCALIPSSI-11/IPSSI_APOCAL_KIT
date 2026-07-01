# Rapport d'incident — Pipeline CI/CD cassé après merge des PR Sprint 2

> **Date** : 2026-07-01
> **Développeur** : Seer MENSAH ASSIAKOLEY
> **Tâches concernées** : TRGPD-01.2 (Hugo), T-03.4 (NGUYEN Thi Van Anh), TRGPD-02 (NGUYEN Thi Van Anh), J2 tasks (Romain LEFEVRE)
> **Statut** : Résolu

---

## 1. Contexte

Après le merge des PR #7, #8, #9 et #10 sur `main`, le pipeline CI GitHub Actions (`.github/workflows/ci.yml`) a échoué à deux reprises consécutives. Aucune des branches concernées n'avait vu le CI passer intégralement avant merge — chaque échec masquait le suivant, si bien que plusieurs problèmes indépendants se sont accumulés sans être détectés.

---

## 2. Premier échec — conflit de modèles et de migrations Django

**Symptôme** : `python manage.py check` échouait avec un clash `related_name`, et `python manage.py migrate --noinput` aurait échoué avec *"Conflicting migrations detected; multiple leaf nodes"*.

**Cause** : la PR #10 (Hugo, TRGPD-01.2 — export RGPD ZIP) a introduit un modèle `Course` dans l'app `quizzes` (`quizzes/models.py`, `quizzes/migrations/0003_course.py`, `quizzes/admin.py`), en plus du modèle `Course` déjà existant dans l'app `courses`. Les deux modèles définissaient `related_name="courses"` sur `User`, et deux migrations portaient toutes deux le numéro `0003` sans migration de fusion.

Vérification : `quizzes.Course` n'était utilisé nulle part dans le code (ni vues, ni serializers, ni l'export RGPD lui-même qui ne manipule que `Quiz`/`Question`). C'était un doublon mort de `courses.Course` (qui a la vraie API, le serializer et la validation).

**Correctif** (commit `c929105`) : suppression du modèle `Course`, de son admin et de sa migration dans `quizzes`.

---

## 3. Deuxième échec — bugs de code et tests jamais exécutés

Une fois le premier blocage levé, le CI a rééchoué sur des étapes plus tardives du pipeline, jamais atteintes auparavant.

### 3.1 Frontend — `Lint (eslint)`

| Problème | Fichier | Origine |
|---|---|---|
| Apostrophe française non échappée dans une chaîne à guillemets simples (`'...qu'Ollama...'`) → erreur de parsing TypeScript | `frontend/src/pages/UploadPage.tsx:108` | à identifier lors d'une session d'édition manuelle |
| `vi.importActual<any>` → règle `no-explicit-any` | `frontend/src/test/SignupPage.test.tsx`, `frontend/src/test/UploadPage.test.tsx` | Romain LEFEVRE, commit `2af8819` |
| Imports `waitFor` et `generateQuiz` inutilisés | `frontend/src/test/UploadPage.test.tsx` | idem |

### 3.2 Frontend — code perdu / mort pendant un merge (`UploadPage.tsx`)

La constante `MAX_PDF_SIZE_BYTES`, le tableau `LOADING_MESSAGES` et l'import de type `DragEvent` — introduits par NGUYEN Thi Van Anh (commit `c6403db`, T-03.4) — avaient disparu du fichier après un merge, alors que la logique qui les utilise (validation de taille de PDF, affichage du message de chargement rotatif) était toujours présente. Restaurés à l'identique depuis l'historique git.

En parallèle, une fonction `handleFileChange` (introduite par Romain LEFEVRE, commit `2af8819`) faisait doublon avec `handlePdfSelection`/`handlePdfDrop` et n'était jamais appelée dans le JSX. Supprimée (code mort).

### 3.3 Frontend — tests jamais exécutés (bloqués depuis leur création par l'erreur de parsing ci-dessus)

Les fichiers `SignupPage.test.tsx` et `UploadPage.test.tsx` (créés par Romain LEFEVRE, commit `2af8819`) n'avaient jamais tourné une seule fois en CI. Plusieurs défauts sont apparus dès la première exécution :

- `screen.getByText(/PDF/i)` : sélecteur ambigu (matche à la fois le texte d'intro et le bouton) → remplacé par `getByRole('button', { name: /📄 PDF/i })`.
- Message d'erreur attendu (`"Le fichier PDF est trop volumineux"`) ne correspondait pas au message réellement produit par le code actif (`"Le fichier dépasse 5 Mo..."`) — le test avait été écrit contre le `handleFileChange` mort évoqué en 3.2.
- `screen.getByLabelText(/Nom/i)` matchait aussi le champ "Prénom" (qui se termine par "nom") → ancré en `/^Nom/i`.
- Le mock d'erreur de `signup()` était un objet brut (`{ response: { data: { detail: ... } } }`) au lieu d'une vraie instance `AxiosError` — `getApiErrorMessage()` ne l'aurait jamais traité comme tel en production → corrigé pour construire un vrai `AxiosError`.
- Aucun des deux tests de soumission ne cochait la case de consentement RGPD (`acceptedTerms`), rendue obligatoire par NGUYEN Thi Van Anh (commit `fc93f8d`, TRGPD-02, Sprint 2) — le bouton restait donc désactivé et le clic ne déclenchait rien.

### 3.4 Frontend — accessibilité (`SignupPage.tsx`)

Les champs Email, Prénom, Nom et Mot de passe n'ont jamais eu d'association `label`/`input` (`htmlFor`/`id`) depuis leur création par Mohamed Amine EL AFRIT en Sprint 1 (commit `f8244de`, 2026-06-07). Ce n'est pas une régression du Sprint 2 : c'est un défaut latent, jamais détecté faute de CI vert jusqu'ici. Corrigé en ajoutant les `id`/`htmlFor` correspondants.

### 3.5 Backend — `Lint (ruff)`

| Problème | Fichier | Origine |
|---|---|---|
| Imports `SimpleUploadedFile`, `PDFError`, `extract_text_from_pdf`, `parse_and_validate_quiz`, `LLMError`, `json` insérés au milieu du fichier lors d'une résolution de conflit | `backend/llm/tests.py` | merge `d5ac8f8` ("integrate J3/Seer into romain, resolve conflict in llm/tests.py") |
| Import local `Count` non trié | `backend/quizzes/views.py` | Romain LEFEVRE, commit `2af8819` |
| Import non trié | `backend/quizzes/urls.py` | — |

### 3.6 Backend — bug réel en production (pas seulement du lint)

Dans `StatsView.get()` (`backend/quizzes/views.py:127`), `Count` était déjà importé en haut du fichier mais **ré-importé localement** plus bas dans la même fonction (`from django.db.models import Case, When, IntegerField, Count, Sum`, ligne 147). En Python, un nom importé/assigné n'importe où dans une fonction devient local à toute la fonction — utiliser `Count` avant cet import local (ligne 127) provoquait une `UnboundLocalError` **à chaque appel**, cassant intégralement le dashboard de statistiques (Lot 6, MVP2) en conditions réelles. Introduit par Romain LEFEVRE, commit `2af8819`. Corrigé en retirant `Count` de l'import local (déjà disponible via l'import global).

---

## 4. Pourquoi ce n'est la faute de personne en particulier

Aucune fonctionnalité n'a été supprimée ou inversée par ces correctifs :
- Le seul code métier supprimé (`quizzes.Course`) était mort dès sa création.
- Le code perdu pendant un merge (`MAX_PDF_SIZE_BYTES`, `LOADING_MESSAGES`, `DragEvent`) a été **restauré**, pas cassé.
- Les bugs restants (`Count`, labels manquants, tests jamais exécutés) existaient déjà avant ce sprint mais n'avaient jamais été révélés : le pipeline CI plantait systématiquement dès la première erreur rencontrée (erreur de parsing ou de migration), empêchant les étapes suivantes (tests, autres fichiers lintés) de s'exécuter et donc de révéler leurs propres défauts.

---

## 5. Recommandations pour éviter la récidive

1. **Ne jamais merger une PR sans CI vert.** Envisager une règle de protection de branche sur `main` (statut CI requis avant merge).
2. **Rebaser/tester localement avant de pousser**, en particulier sur les fichiers à fort risque de conflit entre plusieurs branches (migrations Django, fichiers de test partagés).
3. **`npm ci` systématique avant `npm run lint`/`test` en local** : un `node_modules` obsolète a masqué des erreurs ESLint réelles lors du diagnostic (module `@typescript-eslint/parser` manquant).
4. **Vérifier qu'un test nouvellement ajouté s'exécute au moins une fois avant de merger** — les tests de `SignupPage`/`UploadPage` n'avaient jamais tourné depuis leur création.
5. **Attention aux imports locaux dans les fonctions Django** qui masquent un import de module déjà présent en haut de fichier (cause du bug `Count`).
