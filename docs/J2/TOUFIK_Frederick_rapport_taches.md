# Rapport d'activité — Frederick TOUFIK (J2)

> **Date** : 2026-07-01
> **Développeur** : Frederick TOUFIK
> **Tâches concernées** : T-01.2, T-02.3, T-04.1, T-17.1, TJ2.3

---

## 1. Reformatage des tâches T-01.2 et T-02.3

Les fichiers `TOUFIK_Frederick_T01-2_signup.md` et `TOUFIK_Frederick_T02-3_courses.md` étaient rédigés dans un format documentaire détaillé (extraits de code, explications pédagogiques, diagrammes ASCII) non conforme au format standard utilisé dans le projet pour les autres tâches.

**Format de référence appliqué** : T-04.1, T-17.1, TJ2.3 — structure en 6 sections numérotées avec bloc de métadonnées en en-tête.

### Modifications apportées à `TOUFIK_Frederick_T01-2_signup.md`

| Avant | Après |
|---|---|
| Métadonnées : `**Développeur**`, `**Complexité**`, `**Priorité**` | Métadonnées : `**User Story**`, `**Sprint**`, `**Estimation**`, `**Assigné**`, `**Statut**` |
| Section `### Ce que la tâche demande` | `## 1. Objectif de la tâche` |
| Section `### Fichiers concernés` (table sans colonne "À modifier ?") | `## 2. Contexte du code actuel` (table avec colonne "À modifier ?") |
| Sections imbriquées `### 1.`, `### 2.`, `### 3.` avec code exhaustif | `## 3. Spécifications techniques` (description synthétique sans extraits de code complets) |
| Absent | `## 4. Étapes détaillées` |
| Absent | `## 5. Definition of Done` (6 critères avec cases à cocher) |
| Absent (pièges dispersés dans le texte) | `## 6. Pièges à éviter` (3 pièges numérotés) |
| Pas de champ Statut | **Statut : Done** (code présent et fonctionnel dans le dépôt) |

### Modifications apportées à `TOUFIK_Frederick_T02-3_courses.md`

| Avant | Après |
|---|---|
| Métadonnées : `**Développeur**`, `**Complexité**`, `**Priorité**` | Métadonnées : `**User Story**`, `**Sprint**`, `**Estimation**`, `**Assigné**`, `**Statut**` |
| Section `### Ce que la tâche demande` | `## 1. Objectif de la tâche` |
| Section `### Fichiers à créer / modifier` (table sans colonne "À modifier ?") | `## 2. Contexte du code actuel` (table avec colonne "À modifier ?", mention **CRÉER** pour les nouveaux fichiers) |
| Sections `### 1.` à `### 6.` avec code exhaustif et explications | `## 3. Spécifications techniques` (description synthétique par composant) |
| Absent | `## 4. Étapes détaillées` (4 étapes dont `makemigrations`) |
| Absent | `## 5. Definition of Done` (6 critères avec cases à cocher) |
| Absent (pièges dispersés dans le texte) | `## 6. Pièges à éviter` (3 pièges numérotés) |
| Pas de champ Statut | **Statut : Done** (implémenté dans ce sprint, voir §3) |

---

## 2. Vérification du statut réel de chaque tâche

Analyse effectuée par lecture du code source du dépôt.

### T-01.2 — Sérialiseur DRF + endpoint `POST /api/accounts/signup/`

**Statut constaté : Done** (confirmé, cohérent avec le statut marqué après reformatage).

| Critère DoD | État |
|---|---|
| `SignupSerializer` avec `validate_email`, `validate_password`, `create` | ✅ `backend/accounts/serializers.py` lignes 41–87 |
| `SignupView` avec `AllowAny`, `authentication_classes = []`, logique best-effort | ✅ `backend/accounts/views.py` lignes 44–72 |
| Route `signup/` enregistrée dans `accounts/urls.py` | ✅ `backend/accounts/urls.py` ligne 18 |
| Mot de passe haché via `set_password()` | ✅ |
| Email de validation envoyé en best-effort | ✅ |

### T-02.3 — Endpoint `POST /api/courses/`

**Statut constaté avant intervention : Todo** (aucune app `courses` dans le dépôt, `"courses"` absent de `INSTALLED_APPS`).
**Statut après intervention : Done** (voir §3).

### T-04.1 — Backend `AnswerQuizView`

**Statut constaté : Done** (cohérent avec le statut déjà marqué dans le fichier de tâche).

| Critère DoD | État |
|---|---|
| `AnswerItemSerializer` et `SubmitAnswersSerializer` | ✅ `backend/quizzes/serializers.py` lignes 47–65 |
| `AnswerQuizView` avec calcul du score et mise à jour de `selected_index` | ✅ `backend/quizzes/views.py` lignes 48–104 |
| Route `<int:pk>/answer/` enregistrée dans `quizzes/urls.py` | ✅ `backend/quizzes/urls.py` ligne 11 |
| Validation 10 réponses uniques couvrant [1..10] | ✅ `SubmitAnswersSerializer.validate_answers` |
| Score persisté sur `Quiz.score` | ✅ |
| `selected_index` persisté sur chaque `Question` | ✅ |

### T-17.1 — Backend `ProfileView.delete` (suppression RGPD)

**Statut constaté : Done** (cohérent avec le statut déjà marqué dans le fichier de tâche).

| Critère DoD | État |
|---|---|
| `DeleteAccountSerializer` avec validation du mot de passe | ✅ `backend/accounts/serializers.py` lignes 222–231 |
| `ProfileView.delete` : révocation token, logout, `user.delete()` | ✅ `backend/accounts/views.py` lignes 269–280 |
| Retourne `204 NO CONTENT` | ✅ |
| Cascade sur `Profile`, `Course`, `Quiz` via `on_delete=CASCADE` | ✅ |

### TJ2.3 — Validation post-bascule (benchmark latence + test hors-ligne)

**Statut constaté : Done** (cohérent avec le statut déjà marqué dans le fichier de tâche).

Tous les critères DoD du fichier `docs/pertubations/j2/Etude_benchmarks/benchmark-llm.md` sont cochés :
- 6 modèles mesurés (90 mesures latence + 54 notations qualité)
- p95 de `llama3.2:3b` mesuré à 14.9 s ≤ 15 s sur tier Standard
- Test hors-ligne validé (aucune dépendance API externe en runtime)
- Recommandation tranchée formalisée dans ADR-0001

---

## 3. Implémentation de T-02.3 — App `courses`

L'app `courses` n'existait pas. Les fichiers suivants ont été créés ou modifiés.

### Fichiers créés

#### `backend/courses/__init__.py`
Fichier vide standard pour déclarer le package Python.

#### `backend/courses/apps.py`
Configuration de l'app Django (`CoursesConfig`, `default_auto_field = BigAutoField`).

#### `backend/courses/models.py`
Modèle `Course` avec :
- `user` : `ForeignKey(AUTH_USER_MODEL, on_delete=CASCADE, related_name="courses")`
- `title` : `CharField(max_length=200)`
- `content` : `TextField()` (contrainte ≥ 200 caractères dans le sérialiseur)
- `created_at` : `DateTimeField(auto_now_add=True)`

#### `backend/courses/serializers.py`
`CourseSerializer` (`ModelSerializer`) avec :
- `fields = ["id", "title", "content", "created_at"]`
- `read_only_fields = ["id", "created_at"]`
- `validate_content` : appel `.strip()` puis vérification `len >= 200`, message d'erreur incluant le nombre de caractères reçus

#### `backend/courses/views.py`
`CourseCreateView` (`APIView`) avec :
- `permission_classes = [IsAuthenticated]`
- `post` : validation via `CourseSerializer`, injection `user=request.user` dans `save()`, retour `HTTP 201 CREATED`

#### `backend/courses/urls.py`
Route `path("", CourseCreateView.as_view(), name="course-create")`.

#### `backend/courses/migrations/__init__.py`
Fichier vide pour le package de migrations.

#### `backend/courses/migrations/0001_initial.py`
Migration initiale créant la table `courses_course` avec les colonnes `id`, `user_id`, `title`, `content`, `created_at` et la contrainte de clé étrangère vers `auth_user`.

### Fichiers modifiés

#### `backend/apocal/settings.py`
Ajout de `"courses"` dans `INSTALLED_APPS` (après `"administration"`).

```python
# Avant
"accounts", "llm", "quizzes", "administration"

# Après
"accounts", "llm", "quizzes", "administration", "courses"
```

#### `backend/apocal/urls.py`
Ajout de l'inclusion des URLs de l'app `courses` dans `urlpatterns`.

```python
path("api/courses/", include("courses.urls")),
```

L'endpoint final exposé est : **`POST /api/courses/`**

---

## 4. Récapitulatif des statuts finaux

| Tâche | Statut avant analyse | Statut réel constaté | Statut final |
|---|---|---|---|
| T-01.2 — Signup backend | Non renseigné | Done | **Done** |
| T-02.3 — Courses endpoint | Non renseigné | Todo | **Done** (implémenté) |
| T-04.1 — AnswerQuizView | Done | Done | **Done** |
| T-17.1 — Delete account backend | Done | Done | **Done** |
| TJ2.3 — Benchmark validation | Done | Done | **Done** |
