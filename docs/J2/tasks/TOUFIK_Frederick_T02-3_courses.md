# T-02.3 — Endpoint `POST /api/courses/` (texte ≥ 200 car) + validation

> **Développeur** : Frederick TOUFIK · **US** : US-02 — Création d'un cours  
> **Complexité** : 1 pt | **Priorité** : 1

### Ce que la tâche demande

Créer un endpoint `POST /api/courses/` (authentifié) qui accepte un titre et un texte de cours d'au moins 200 caractères, valide ces données, persiste le cours en base et retourne le cours créé en 201.

### Contexte dans le projet existant

Le projet ne possède pas de modèle `Course` dédié. L'équivalent fonctionnel est le champ `source_text` du modèle `Quiz` (`quizzes/models.py`), qui stocke le texte source d'où le LLM génère les questions. La contrainte "≥ 200 caractères" existe déjà dans `llm/serializers.py` (lignes 27–30) pour `GenerateQuizSerializer`.

La tâche T-02.3 consiste donc à créer une **couche dédiée** au cours, dissociée de la génération LLM : un cours peut être soumis et stocké indépendamment, puis utilisé ultérieurement pour générer un quiz.

---

### Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `backend/courses/models.py` | Créer (nouveau) — modèle `Course` |
| `backend/courses/serializers.py` | Créer (nouveau) — `CourseSerializer` avec validation ≥ 200 car |
| `backend/courses/views.py` | Créer (nouveau) — `CourseCreateView` |
| `backend/courses/urls.py` | Créer (nouveau) — route `POST /` |
| `backend/apocal/urls.py` | Modifier — inclure `courses.urls` |
| `backend/apocal/settings.py` | Modifier — ajouter `"courses"` dans `INSTALLED_APPS` |

---

### 1. `courses/models.py` — Le modèle `Course`

```python
# backend/courses/models.py  (à créer)

from django.conf import settings
from django.db import models


class Course(models.Model):
    """Contenu textuel soumis par un utilisateur, base d'un futur quiz."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses",
    )
    title = models.CharField(max_length=200)
    content = models.TextField()            # le texte du cours (≥ 200 chars, validé au sérialiseur)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Course<{self.title!r} by {self.user.email}>"
```

#### Explication des choix

**`ForeignKey` vers `settings.AUTH_USER_MODEL`**

On pointe vers `settings.AUTH_USER_MODEL` et non `django.contrib.auth.models.User` directement : c'est la bonne pratique Django pour rester compatible si le projet change un jour de modèle User personnalisé. On suit le même pattern que `quizzes/models.py` (ligne 9) et `accounts/models.py` (ligne 23).

**`on_delete=CASCADE`**

Si l'utilisateur supprime son compte (`ProfileView.delete`), ses cours sont supprimés avec lui. C'est cohérent avec la politique du projet (hard delete dans `accounts/views.py` ligne 279).

**`content = models.TextField()`**

`TextField` sans `max_length` pour la BDD (PostgreSQL accepte du texte illimité). La contrainte ≥ 200 caractères est validée dans le sérialiseur, pas dans le modèle, pour produire une erreur JSON propre plutôt qu'une exception SQL.

---

### 2. `courses/serializers.py` — Le sérialiseur `CourseSerializer`

```python
# backend/courses/serializers.py  (à créer)

from rest_framework import serializers

from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    """Création et lecture d'un cours."""

    class Meta:
        model = Course
        fields = ["id", "title", "content", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "title": {"required": True, "allow_blank": False},
            "content": {"required": True, "allow_blank": False},
        }

    def validate_content(self, value: str) -> str:
        value = value.strip()
        if len(value) < 200:
            raise serializers.ValidationError(
                f"Le contenu doit faire au moins 200 caractères "
                f"(actuellement {len(value)})."
            )
        return value
```

#### Explication des choix

**`ModelSerializer` et non `Serializer`**

`ModelSerializer` génère automatiquement les champs depuis le modèle et implémente `create()`. Il suffit donc de surcharger uniquement `validate_content` pour la règle métier spécifique. C'est le même pattern que `QuizSerializer` dans `quizzes/serializers.py`.

**Méthode `validate_content` (et non validation dans `validate`)**

DRF offre deux niveaux de validation :
- `validate_<field>` : validation d'un seul champ, appelée automatiquement si le champ est présent et non vide
- `validate` : validation croisée entre plusieurs champs

Ici la contrainte porte uniquement sur `content`, donc `validate_content` est le bon niveau. Cela retourne une erreur JSON ciblée sur le champ :
```json
{ "content": ["Le contenu doit faire au moins 200 caractères (actuellement 45)."] }
```

**`.strip()` avant le comptage**

On retire les espaces en tête et en fin avant de compter : un utilisateur qui envoie 150 espaces + 50 lettres ne doit pas valider la contrainte. C'est le même choix fait dans `llm/serializers.py` (ligne 19) : `source_text = (attrs.get("source_text") or "").strip()`.

**`read_only_fields = ["id", "created_at"]`**

L'`id` et le `created_at` sont générés côté serveur ; les rendre `read_only` évite qu'un client ne les envoie et les écrase accidentellement.

**`user` absent des `fields`**

Le champ `user` n'est pas exposé dans le sérialiseur : il est injecté dans la vue via `serializer.save(user=request.user)` (voir ci-dessous). Cela empêche un client de créer un cours au nom d'un autre utilisateur.

---

### 3. `courses/views.py` — La vue `CourseCreateView`

```python
# backend/courses/views.py  (à créer)

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CourseSerializer


class CourseCreateView(APIView):
    """Crée un cours (contenu textuel ≥ 200 caractères) pour l'utilisateur connecté."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=CourseSerializer,
        responses={201: CourseSerializer},
        description="Soumet un cours textuel. `content` doit faire au moins 200 caractères.",
    )
    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = serializer.save(user=request.user)     # injection du user courant
        return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
```

#### Explication des choix

**`permission_classes = [IsAuthenticated]`**

Contrairement à `SignupView` (publique), créer un cours exige d'être connecté : un cours est lié à un utilisateur. La config globale de `settings.py` (lignes `DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]`) impose cela par défaut, mais on le répète explicitement pour la lisibilité et la cohérence avec les autres vues du projet.

**`serializer.save(user=request.user)`**

DRF passe les kwargs de `save()` directement à `create()` du sérialiseur, fusionnés dans `validated_data`. L'utilisateur connecté est ainsi injecté sans être exposé dans le payload JSON. C'est le même mécanisme que dans `llm/views.py` (lignes 150–154) :
```python
quiz = Quiz.objects.create(user=request.user, ...)
```

**`@extend_schema`**

Le décorateur de `drf-spectacular` documente l'endpoint dans la Swagger UI automatiquement générée à `/api/docs/`. C'est la convention du projet (utilisé dans toutes les vues : `accounts/views.py`, `llm/views.py`, `quizzes/views.py`).

**`status.HTTP_201_CREATED`**

Même logique que pour `SignupView` : REST impose `201` pour la création d'une ressource.

---

### 4. `courses/urls.py` — La route

```python
# backend/courses/urls.py  (à créer)

from django.urls import path

from .views import CourseCreateView

urlpatterns = [
    path("", CourseCreateView.as_view(), name="course-create"),
]
```

---

### 5. `apocal/urls.py` — Inclusion de l'app courses

```python
# backend/apocal/urls.py  (modification)

# Ajouter la ligne suivante dans urlpatterns :
path("api/courses/", include("courses.urls")),
```

L'URL finale sera : **`POST /api/courses/`**

---

### 6. `apocal/settings.py` — Déclaration de l'app

```python
# backend/apocal/settings.py  (modification)

INSTALLED_APPS = [
    # Django ...
    # Third-party ...
    # Local
    "accounts",
    "llm",
    "quizzes",
    "administration",
    "courses",          # ← ajouter ici
]
```

---

### Réponse type de l'API

**Requête :**
```json
POST /api/courses/
Authorization: Token <mon_token>
Content-Type: application/json

{
  "title": "Introduction aux réseaux de neurones",
  "content": "Un réseau de neurones est un modèle de machine learning inspiré du cerveau humain. Il est composé de couches de neurones artificiels connectés entre eux. Chaque neurone reçoit des entrées, les pondère, applique une fonction d'activation et transmet le résultat à la couche suivante. L'apprentissage consiste à ajuster les poids par rétropropagation du gradient..."
}
```

**Réponse 201 :**
```json
{
  "id": 7,
  "title": "Introduction aux réseaux de neurones",
  "content": "Un réseau de neurones est un modèle...",
  "created_at": "2026-06-30T14:32:00Z"
}
```

**Réponse 400 — contenu trop court :**
```json
{
  "content": [
    "Le contenu doit faire au moins 200 caractères (actuellement 45)."
  ]
}
```

**Réponse 401 — non authentifié :**
```json
{
  "detail": "Informations d'authentification non fournies."
}
```

---

### Lien avec le reste du projet

Une fois l'endpoint `POST /api/courses/` en place, il devient naturel de chaîner la génération de quiz depuis un cours existant. Dans une version suivante, `GenerateQuizView` (`llm/views.py`) pourrait accepter un `course_id` en plus du `source_text` :

```python
# Évolution possible dans llm/serializers.py
course_id = serializers.IntegerField(required=False)

def validate(self, attrs):
    if attrs.get("course_id"):
        # récupère le Course et utilise son content comme source_text
        ...
```

Cela n'est pas dans le scope de T-02.3 mais montre comment la tâche s'insère dans l'architecture globale.
