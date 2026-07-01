# T-02.3 — Endpoint `POST /api/courses/` (texte ≥ 200 car.) + validation

> **User Story** : US-02 — *En tant que Léa, je veux soumettre le texte d'un cours afin qu'il soit stocké et utilisé ultérieurement pour générer un quiz.*
> **Sprint** : Sprint 1
> **Estimation** : 1h30
> **Assigné** : Frederick TOUFIK
> **Statut** : Done

---

## 1. Objectif de la tâche

Créer une app Django `courses` exposant un endpoint `POST /api/courses/` (authentifié) qui accepte un titre et un texte de cours d'au moins 200 caractères, valide ces données, persiste le cours en base de données et retourne le cours créé en `201 CREATED`. Cette couche est dissociée de la génération LLM : un cours peut être soumis et stocké indépendamment, puis utilisé pour générer un quiz.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| `backend/courses/models.py` | Modèle `Course` (à créer) | **CRÉER** |
| `backend/courses/serializers.py` | `CourseSerializer` avec validation ≥ 200 caractères (à créer) | **CRÉER** |
| `backend/courses/views.py` | `CourseCreateView` (à créer) | **CRÉER** |
| `backend/courses/urls.py` | Route `POST /` (à créer) | **CRÉER** |
| [backend/apocal/urls.py](../../../backend/apocal/urls.py) | URL racine du projet | **OUI** (inclure `courses.urls`) |
| [backend/apocal/settings.py](../../../backend/apocal/settings.py) | Configuration Django | **OUI** (ajouter `"courses"` dans `INSTALLED_APPS`) |

---

## 3. Spécifications techniques

### 3.1 Modèle `Course`

```python
class Course(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="courses")
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
```

- `ForeignKey` vers `settings.AUTH_USER_MODEL` (bonne pratique Django, compatible futur modèle User personnalisé).
- `on_delete=CASCADE` : suppression du compte → suppression des cours associés (cohérent avec le hard delete RGPD de T-17.1).
- `content = TextField()` sans `max_length` BDD ; la contrainte ≥ 200 caractères est dans le sérialiseur (erreur JSON propre).

### 3.2 Sérialiseur `CourseSerializer`

- `ModelSerializer` avec surcharge de `validate_content` (validation d'un seul champ, erreur ciblée).
- `.strip()` avant comptage pour rejeter les soumissions de 200 espaces.
- `user` absent des `fields` du sérialiseur — injecté dans la vue via `serializer.save(user=request.user)`.
- `read_only_fields = ["id", "created_at"]` : générés côté serveur, non surchargeables par le client.

### 3.3 Vue `CourseCreateView`

- `permission_classes = [IsAuthenticated]` : l'endpoint exige une connexion.
- `serializer.save(user=request.user)` : injection du user courant sans l'exposer dans le payload JSON.
- Retourne `HTTP 201 CREATED` avec les données `CourseSerializer`.

---

## 4. Étapes détaillées

### Étape 1 — Créer l'app `courses`
Créer les fichiers `backend/courses/__init__.py`, `backend/courses/apps.py`, `backend/courses/models.py`, `backend/courses/serializers.py`, `backend/courses/views.py`, `backend/courses/urls.py` et le répertoire `backend/courses/migrations/` avec son `__init__.py`.

### Étape 2 — Déclarer l'app dans Django
Dans `backend/apocal/settings.py`, ajouter `"courses"` dans `INSTALLED_APPS`.

### Étape 3 — Inclure les URLs
Dans `backend/apocal/urls.py` :
```python
path("api/courses/", include("courses.urls")),
```

### Étape 4 — Créer la migration initiale
```bash
python manage.py makemigrations courses
```

---

## 5. Definition of Done

- [ ] L'endpoint `POST /api/courses/` est fonctionnel et requiert une authentification par token.
- [ ] Une requête sans token retourne un code `401 UNAUTHORIZED`.
- [ ] Un `content` de moins de 200 caractères retourne un code `400 BAD REQUEST` avec un message précisant le nombre de caractères reçus.
- [ ] Un cours valide est persisté en base de données et retourné avec un code `201 CREATED`.
- [ ] Le champ `user` est automatiquement assigné à partir de `request.user` (non injectable par le client).
- [ ] La migration initiale `courses/0001_initial.py` est présente.

---

## 6. Pièges à éviter

1. **Exposition du `user` dans le payload** : Ne pas inclure `user` dans les `fields` du sérialiseur. L'injecter exclusivement via `serializer.save(user=request.user)` pour empêcher un client de créer un cours au nom d'un autre utilisateur.
2. **Validation `strip()` avant comptage** : Un contenu de 200 espaces ne doit pas valider la contrainte métier. Toujours appeler `.strip()` avant de mesurer `len(value)`.
3. **Oublier l'app dans `INSTALLED_APPS`** : Sans cette déclaration, `makemigrations` et `migrate` ignorent silencieusement l'app et la table n'est jamais créée en base.
