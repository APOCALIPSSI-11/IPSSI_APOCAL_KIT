# T-T1.1 — Backend : modèle `ClassGroup` + relation enseignant-étudiants

> **User Story** : US-T1 — *Espace Enseignant / Suivi de Classe*
> **Sprint** : Sprint 3
> **Estimation** : 3h
> **Assigné** : Seer MENSAH ASSIAKOLEY
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de concevoir et d'implémenter les modèles de données nécessaires pour structurer une "classe" (ou groupe d'élèves).
Un enseignant doit pouvoir être propriétaire d'une ou plusieurs classes. Chaque classe contient un ensemble d'étudiants. Cette structure servira de fondation pour les tâches de tableau de bord de suivi de classe (`T-T1.2` et `T-T1.3`).

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/courses/models.py](../../../backend/courses/models.py) | Modèle `Course` | **OUI** (ajouter `ClassGroup`) |
| [backend/courses/admin.py](../../../backend/courses/admin.py) | Enregistrement admin des cours | **OUI** (enregistrer `ClassGroup`) |
| [backend/courses/migrations/](../../../backend/courses/migrations/) | Fichiers de migration | **OUI** (générer la migration) |

---

## 3. Spécifications techniques

### 3.1 Définition du modèle `ClassGroup`

Dans [backend/courses/models.py](../../../backend/courses/models.py), ajouter la classe `ClassGroup` avec les spécifications suivantes :
- `name` : `CharField(max_length=100)` — Nom de la classe (ex: "Terminale S1", "M1 Informatique").
- `teacher` : `ForeignKey(settings.AUTH_USER_MODEL)` — L'enseignant qui gère la classe (`on_delete=models.CASCADE`, `related_name="managed_classes"`).
- `students` : `ManyToManyField(settings.AUTH_USER_MODEL)` — Les étudiants inscrits dans la classe (`related_name="enrolled_classes"`, `blank=True`).
- `created_at` : `DateTimeField(auto_now_add=True)` — Date de création du groupe.

Exemple :
```python
class ClassGroup(models.Model):
    """Représente une classe d'étudiants gérée par un enseignant."""
    
    name = models.CharField(
        max_length=100,
        help_text="Nom du groupe ou de la classe."
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="managed_classes",
        help_text="L'enseignant responsable de la classe."
    )
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="enrolled_classes",
        blank=True,
        help_text="Les étudiants inscrits dans cette classe."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Classe"
        verbose_name_plural = "Classes"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} ({self.teacher.email})"
```

---

## 4. Étapes détaillées

### Étape 1 — Déclarer le modèle
Ajouter `ClassGroup` dans [backend/courses/models.py](../../../backend/courses/models.py).

### Étape 2 — Créer la migration
Générer le fichier de migration :
```bash
python manage.py makemigrations courses
```

### Étape 3 — Appliquer la migration
Appliquer la migration sur la base de données :
```bash
python manage.py migrate courses
```

### Étape 4 — Enregistrer dans l'admin Django
Dans `backend/courses/admin.py` (ou créer le fichier s'il n'existe pas), enregistrer `ClassGroup` pour pouvoir l'administrer facilement :
```python
from django.contrib import admin
from .models import ClassGroup

@admin.register(ClassGroup)
class ClassGroupAdmin(admin.ModelAdmin):
    list_display = ["name", "teacher", "created_at"]
    search_fields = ["name", "teacher__email"]
    filter_horizontal = ["students"]
```

---

## 5. Definition of Done

- [x] Le modèle `ClassGroup` est défini avec les relations de clé étrangère (enseignant) et de relation Many-to-Many (étudiants) spécifiées.
- [x] La migration de base de données est générée et appliquée sans erreur.
- [x] Le modèle est éditable et visible dans l'interface d'administration Django.
- [x] Les tests de l'application `courses` s'exécutent avec succès.

---

## 6. Pièges à éviter

1. **Validation du rôle de l'enseignant** : Bien que Django permette d'attribuer n'est-ce que n'importe quel `User` à la relation `teacher`, idéalement, s'assurer que seuls les utilisateurs avec le profil `teacher` (ou superuser) puissent être affectés comme enseignant (par exemple via une validation au niveau du serializer ou du formulaire).
2. **Nommage ambigu de relation inverse** : Spécifier explicitement des `related_name` explicites et distincts comme `managed_classes` et `enrolled_classes` pour éviter les collisions avec d'autres relations Many-to-Many de Django.
