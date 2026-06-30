# ADR-0002 — Endpoint `POST /api/courses/` avec validation texte ≥ 200 caractères

**Tâche** : T-02.3 · **US** : US-02 · **Auteur** : Frederick TOUFIK  
**Date** : 2026-06-30

---

## Statut

Accepted

---

## Contexte et problème

L'application doit permettre à un utilisateur authentifié de soumettre un contenu textuel (un « cours ») qui servira de base à la génération de quiz par le LLM. La contrainte métier est qu'un texte trop court (< 200 caractères) ne contient pas assez de matière pour générer 10 questions pertinentes.

Deux questions se posent :

1. **Où placer cet endpoint** : dans une app existante (`llm`, `quizzes`) ou dans une nouvelle app `courses` ?
2. **Où appliquer la contrainte ≥ 200 caractères** : dans le modèle, dans le sérialiseur, ou dans la vue ?

---

## Decision Drivers

- Séparation des responsabilités : la soumission d'un cours et sa génération de quiz sont deux actions distinctes.
- Cohérence avec DRF : l'erreur doit être une réponse JSON `400` ciblée sur le champ `content`.
- Extensibilité : le cours doit pouvoir être réutilisé sans être lié à une génération LLM immédiate.
- Cohérence de nommage : l'endpoint doit s'appeler `POST /api/courses/` selon la spec de la tâche.

---

## Options considérées

### Option A — Ajouter à l'app `llm` existante (`GenerateQuizSerializer`)

Étendre `llm/serializers.py` et `llm/views.py` pour accepter un `POST /api/llm/courses/` en plus du generate-quiz.

**Avantages :**
- Aucun nouveau fichier à créer.
- La contrainte ≥ 200 caractères existe déjà dans `GenerateQuizSerializer` (lignes 27–30 de `llm/serializers.py`).

**Inconvénients :**
- L'app `llm` a une responsabilité unique : interagir avec le LLM. Lui ajouter la gestion des cours la rend difficile à maintenir et à tester isolément.
- L'URL serait `/api/llm/courses/` et non `/api/courses/` comme demandé.
- Un cours stocké dans `llm` serait conceptuellement mal placé : le cours existe indépendamment du LLM.

**Rejeté** : couplage trop fort entre le stockage du contenu et la couche LLM.

---

### Option B — Ajouter à l'app `quizzes` existante

Créer un modèle `Course` dans `quizzes/models.py` et un endpoint dans `quizzes/views.py`.

**Avantages :**
- Moins de fichiers nouveaux.
- `quizzes` gère déjà du contenu lié aux utilisateurs.

**Inconvénients :**
- Un cours n'est pas un quiz : mélanger les deux dans la même app crée une confusion sémantique.
- L'app `quizzes` grossit et sa responsabilité devient floue.
- Les tests unitaires de `quizzes` devraient aussi couvrir `Course`, ce qui alourdit la suite de tests sans rapport direct.

**Rejeté** : violation du principe de responsabilité unique au niveau de l'app Django.

---

### Option C — Nouvelle app Django `courses` dédiée *(choisi)*

Créer une app `courses` avec :
- `courses/models.py` : modèle `Course` (user, title, content, created_at).
- `courses/serializers.py` : `CourseSerializer` avec `validate_content`.
- `courses/views.py` : `CourseCreateView`.
- `courses/urls.py` : route `POST ""`.

**Avantages :**
- Responsabilité claire : l'app `courses` ne gère que les cours.
- Extensible : on peut ajouter `GET /api/courses/`, `DELETE`, pagination, sans toucher à `llm` ni `quizzes`.
- URL conforme à la spec : `POST /api/courses/`.
- Pattern identique à celui des autres apps du projet (`quizzes`, `accounts`).

**Inconvénients :**
- Crée une nouvelle app et donc de nouveaux fichiers (modèle, migration, serializer, vue, urls).
- Nécessite d'ajouter `"courses"` dans `INSTALLED_APPS` et d'inclure les urls dans `apocal/urls.py`.

---

## Décision

**Nous retenons l'Option C** : nouvelle app Django `courses`.

### Où appliquer la contrainte ≥ 200 caractères ?

Trois niveaux possibles :

| Niveau | Mécanisme | Résultat en cas d'erreur |
|--------|-----------|--------------------------|
| Modèle | `MinLengthValidator(200)` sur `content` | Exception `django.core.exceptions.ValidationError` non JSON |
| Vue | `if len(content) < 200: return Response(...)` | Logique métier dans la couche HTTP |
| **Sérialiseur** | `validate_content()` | **JSON `400` ciblé sur le champ** ✓ |

La validation dans le sérialiseur est retenue car elle produit une erreur JSON structurée par champ, cohérente avec tout le reste du projet (voir `validate_email` dans ADR-0001, `validate` dans `llm/serializers.py`).

---

### Implémentation

**`backend/courses/models.py`** (à créer) :

```python
from django.conf import settings
from django.db import models

class Course(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses",
    )
    title = models.CharField(max_length=200)
    content = models.TextField()        # contrainte ≥ 200 chars validée au sérialiseur
    created_at = models.DateTimeField(auto_now_add=True)
```

**`backend/courses/serializers.py`** (à créer) :

```python
from rest_framework import serializers
from .models import Course

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "title", "content", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_content(self, value: str) -> str:
        value = value.strip()
        if len(value) < 200:
            raise serializers.ValidationError(
                f"Le contenu doit faire au moins 200 caractères "
                f"(actuellement {len(value)})."
            )
        return value
```

**`backend/courses/views.py`** (à créer) :

```python
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import CourseSerializer

class CourseCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = serializer.save(user=request.user)
        return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
```

**`backend/courses/urls.py`** (à créer) :

```python
from django.urls import path
from .views import CourseCreateView

urlpatterns = [
    path("", CourseCreateView.as_view(), name="course-create"),
]
```

**`backend/apocal/urls.py`** (modification) — ajouter :

```python
path("api/courses/", include("courses.urls")),
```

**`backend/apocal/settings.py`** (modification) — ajouter dans `INSTALLED_APPS` :

```python
"courses",
```

---

## Conséquences

### Positives

- L'app `courses` est totalement indépendante : testable en isolation, supprimable sans impacter `llm` ou `quizzes`.
- `serializer.save(user=request.user)` injecte l'utilisateur sans l'exposer dans le payload JSON : un client ne peut pas créer un cours au nom d'un autre utilisateur.
- La méthode `validate_content` applique `.strip()` avant de compter : un texte rempli d'espaces ne contourne pas la contrainte.
- Le message d'erreur affiche le nombre de caractères actuels, ce qui aide l'utilisateur à corriger sa saisie.
- L'URL `POST /api/courses/` est conforme à la spec de la tâche.

### Négatives

- La création de l'app ajoute 4 fichiers nouveaux + 1 migration + 2 modifications (`settings.py`, `urls.py`).
- Le modèle `Course` ne vérifie pas la contrainte ≥ 200 au niveau base de données : un `Course.objects.create(content="x")` direct (hors API) ne serait pas bloqué. C'est un choix délibéré pour garder l'erreur JSON au niveau sérialiseur.

### Neutres

- Un cours créé via cet endpoint peut ultérieurement être passé à `POST /api/llm/generate-quiz/` via un paramètre `course_id` (évolution hors scope T-02.3).
- `permission_classes = [IsAuthenticated]` est la valeur par défaut du projet (`DEFAULT_PERMISSION_CLASSES` dans `settings.py`), mais on l'indique explicitement par souci de clarté.

---

## Liens

- Code : `backend/courses/` (app à créer)
- Pattern de référence pour la validation par champ : `backend/llm/serializers.py` lignes 17–36
- ADR connexe : `0001-signup-serializer-et-endpoint-post-signup.md` (même pattern `validate_<field>`)
- Modèle de référence pour `ForeignKey(AUTH_USER_MODEL)` : `backend/quizzes/models.py` ligne 9
