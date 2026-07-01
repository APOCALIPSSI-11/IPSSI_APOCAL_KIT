# T-02.1 — Modèle `Course` Django + migration

> **User Story** : US-02 — *En tant que Léa, je veux uploader un PDF ≤ 5 Mo ou saisir un texte > 200 caractères afin de fournir ma matière de révision sans ressaisie manuelle.*
> **Sprint** : Sprint 1
> **Estimation** : 1h
> **Assigné** : Seer MENSAH ASSIAKOLEY (repris d'Azzedine AMARI)
> **Statut** : Done

---

## 1. Objectif de la tâche

Créer un nouveau modèle Django `Course` qui représente **un cours déposé par un utilisateur** (PDF ou texte collé). Ce modèle est la fondation des tâches suivantes :

- **T-02.2** : endpoint `POST /api/courses` avec upload PDF ≤ 5 Mo + extraction PyPDF2 → écrit dans `Course`
- **T-02.3** : endpoint `POST /api/courses` avec texte ≥ 200 caractères + validation → écrit dans `Course`
- **T-02.4** : page React `/upload` qui appelle ces endpoints

⚠️ **Ne pas confondre avec le modèle `Quiz` existant.** Aujourd'hui `Quiz.source_text` contient déjà le texte du cours. Le nouveau modèle `Course` **coexiste** avec `Quiz` dans ce sprint (pas de refacto destructive). Une tâche future basculera `Quiz` en FK vers `Course` ; on ne le fait **pas** ici.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/quizzes/models.py](../../../../backend/quizzes/models.py) | Contient `Quiz`, `Question` | **OUI** — ajouter `Course` |
| [backend/quizzes/admin.py](../../../../backend/quizzes/admin.py) | Admin Django pour Quiz/Question | **OUI** — enregistrer `Course` |
| [backend/quizzes/migrations/](../../../../backend/quizzes/migrations/) | `0001_initial.py`, `0002_question_selected_index.py` | **OUI** — créer `0003_course.py` |
| [backend/apocal/settings.py](../../../../backend/apocal/settings.py) | `INSTALLED_APPS` inclut déjà `quizzes` | Non |
| [backend/quizzes/serializers.py](../../../../backend/quizzes/serializers.py) | Sérialiseurs DRF | Non (fait en T-02.2/T-02.3) |
| [backend/quizzes/views.py](../../../../backend/quizzes/views.py) | Endpoints DRF | Non (fait en T-02.2/T-02.3) |
| [backend/quizzes/urls.py](../../../../backend/quizzes/urls.py) | Routes | Non (fait en T-02.2) |

---

## 3. Spécification du modèle `Course`

### Champs à ajouter

| Champ | Type Django | Contraintes | Justification |
|---|---|---|---|
| `user` | `ForeignKey(settings.AUTH_USER_MODEL)` | `on_delete=CASCADE`, `related_name="courses"` | Un cours appartient à un seul user. Suppression du compte → suppression des cours (RGPD). |
| `title` | `CharField` | `max_length=200` | Titre affiché dans la liste des cours. Saisi par l'utilisateur ou déduit du nom de fichier PDF. |
| `content` | `TextField` | obligatoire (pas de `blank=True`) | Texte brut du cours. PDF → texte extrait via PyPDF2 (T-02.2). Texte → saisie directe (T-02.3). |
| `source` | `CharField` | `max_length=10`, `choices=SOURCE_CHOICES` | Origine du contenu : `"pdf"` ou `"text"`. Permet à l'admin/UI de tracer la provenance. |
| `created_at` | `DateTimeField` | `auto_now_add=True` | Date de dépôt. |
| `updated_at` | `DateTimeField` | `auto_now=True` | Date de dernière modification. |

### Choices pour `source`

```python
class Source(models.TextChoices):
    PDF = "pdf", "PDF uploadé"
    TEXT = "text", "Texte collé"
```

### Méta

- `ordering = ["-created_at"]` (plus récent en premier, cohérent avec `Quiz`)
- `verbose_name = "Cours"`, `verbose_name_plural = "Cours"`

### Méthode `__str__`

Retourner `f"{self.title} — {self.user.username}"` (cohérent avec `Quiz.__str__`).

---

## 4. Étapes détaillées

### Étape 1 — Ajouter le modèle (15 min)

Éditer [backend/quizzes/models.py](../../../../backend/quizzes/models.py) et ajouter la classe `Course` **avant** la classe `Quiz` (ordre logique : un cours existe avant son quiz).

Squelette à compléter (suivre le style des modèles existants, avec `help_text` partout) :

```python
class Course(models.Model):
    """Cours déposé par un utilisateur (PDF extrait ou texte collé)."""

    class Source(models.TextChoices):
        PDF = "pdf", "PDF uploadé"
        TEXT = "text", "Texte collé"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses",
        help_text="Propriétaire du cours.",
    )
    title = models.CharField(
        max_length=200,
        help_text="Titre du cours (saisi ou déduit du nom de fichier PDF).",
    )
    content = models.TextField(
        help_text="Texte brut du cours (extrait PDF ou saisie utilisateur).",
    )
    source = models.CharField(
        max_length=10,
        choices=Source.choices,
        help_text="Origine du contenu : PDF uploadé ou texte collé.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Cours"
        verbose_name_plural = "Cours"

    def __str__(self) -> str:
        return f"{self.title} — {self.user.username}"
```

### Étape 2 — Générer la migration (10 min)

Depuis la racine du projet :

```bash
docker compose exec backend python manage.py makemigrations quizzes
```

Cela doit produire `backend/quizzes/migrations/0003_course.py`.

### Étape 3 — Appliquer la migration (5 min)

```bash
docker compose exec backend python manage.py migrate quizzes
```

### Étape 4 — Enregistrer dans l'admin (10 min)

Éditer [backend/quizzes/admin.py](../../../../backend/quizzes/admin.py) :

```python
from .models import Course

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "source", "created_at"]
    list_filter = ["source", "created_at"]
    search_fields = ["title", "content"]
```

---

## 5. Definition of Done

- [ ] Classe `Course` ajoutée dans `quizzes/models.py` avec les 6 champs spécifiés
- [ ] Choices `Source.PDF` / `Source.TEXT` définis
- [ ] Migration `0003_course.py` générée et versionnée
- [ ] Migration appliquée sans erreur
- [ ] Modèle visible dans l'admin Django
- [ ] Création manuelle d'un Course via admin fonctionne
- [ ] Aucune régression sur les tests existants : `pytest` OK

---

## 6. Pièges à éviter

1. **Ne pas refactorer Quiz**. Ne pas ajouter de FK vers Course tout de suite pour ne pas casser le code des autres tâches.
2. **Ne pas créer d'app séparée** (`courses/`). On reste dans l'app `quizzes`.
3. **Pas de `FileField` pour le PDF**. Seul le texte extrait est persisté dans `content` pour des raisons de simplicité de stockage.
