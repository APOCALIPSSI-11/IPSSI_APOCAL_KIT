# T-02.3 — Endpoint `POST /api/courses` (texte ≥ 200 car) + validation

> **User Story** : US-02 — *En tant que Léa, je veux uploader un PDF ≤ 5 Mo ou saisir un texte > 200 caractères afin de fournir ma matière de révision sans ressaisie manuelle.*
> **Sprint** : Sprint 1
> **Estimation** : 1h
> **Assigné** : Frederick TOUFIK
> **Statut** : Done

---

## 1. Objectif de la tâche

Créer l'endpoint `POST /api/quizzes/courses/upload-text/` acceptant une payload JSON avec du texte saisi directement par l'utilisateur. L'endpoint doit valider que le texte saisi fait au moins 200 caractères et l'enregistrer sous forme d'un objet `Course` (avec `source = "text"`).

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/quizzes/serializers.py](../../../../backend/quizzes/serializers.py) | Sérialiseurs DRF | **OUI** (créer `CourseTextInputSerializer`) |
| [backend/quizzes/views.py](../../../../backend/quizzes/views.py) | Endpoints d'API | **OUI** (créer `CourseTextUploadView`) |
| [backend/quizzes/urls.py](../../../../backend/quizzes/urls.py) | Routage des requêtes HTTP | **OUI** |

---

## 3. Spécifications techniques

### 3.1 Payload attendue
L'API attend une requête JSON :
```json
{
  "title": "Introduction à l'algorithmique",
  "content": "Texte très long de plus de 200 caractères..."
}
```
- **`title`** : Facultatif (si absent, générer un titre par défaut comme `"Saisie de cours - [Date/Heure]"`).
- **`content`** : Obligatoire, type chaîne de caractères.

### 3.2 Validation
- **Longueur minimale** : Le champ `content` doit faire au moins 200 caractères (après suppression des espaces en début/fin).
- Si la validation échoue, retourner un code statut `400 BAD REQUEST` avec un message décrivant le problème.

### 3.3 Persistance
Enregistrer un enregistrement dans la table `Course` :
- `user` : Utilisateur connecté (`self.request.user`).
- `title` : Titre fourni (ou valeur par défaut).
- `content` : Texte validé.
- `source` : `"text"`.

---

## 4. Étapes détaillées

### Étape 1 — Créer le sérialiseur de validation de texte
Dans `backend/quizzes/serializers.py` :
```python
class CourseTextInputSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200, required=False, allow_blank=True)
    content = serializers.CharField(required=True, allow_blank=False)

    def validate_content(self, value):
        cleaned_value = value.strip()
        if len(cleaned_value) < 200:
            raise serializers.ValidationError(
                f"Le cours doit contenir au moins 200 caractères (actuellement {len(cleaned_value)})."
            )
        return cleaned_value
```

### Étape 2 — Implémenter la vue
Dans `backend/quizzes/views.py` :
```python
from django.utils import timezone
from .serializers import CourseTextInputSerializer, CourseSerializer

class CourseTextUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = CourseTextInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        title = serializer.validated_data.get("title")
        if not title:
            # Générer un titre par défaut
            title = f"Texte saisi le {timezone.now().strftime('%d/%m/%Y à %H:%M')}"
            
        course = Course.objects.create(
            user=request.user,
            title=title,
            content=serializer.validated_data["content"],
            source=Course.Source.TEXT
        )
        
        return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
```

### Étape 3 — Configurer les URL
Dans `backend/quizzes/urls.py` :
```python
from .views import CourseTextUploadView

urlpatterns = [
    # ... autres urls
    path("courses/upload-text/", CourseTextUploadView.as_view(), name="course-upload-text"),
]
```

---

## 5. Definition of Done

- [ ] L'endpoint `/api/quizzes/courses/upload-text/` accepte les requêtes `POST` au format JSON.
- [ ] Les saisies de moins de 200 caractères sont rejetées avec une erreur 400.
- [ ] Le titre du cours prend une valeur par défaut cohérente s'il est vide ou absent du JSON.
- [ ] L'objet `Course` est persisté avec la source `"text"`.
- [ ] Retourne un code statut `201 CREATED` avec le sérialiseur complet du cours.

---

## 6. Pièges à éviter

1. **Compter les espaces** : Toujours appliquer `.strip()` avant de compter la longueur des caractères pour éviter que des utilisateurs ne contournent la validation en insérant uniquement des retours à la ligne ou des espaces blancs.
2. **Ne pas brider les gros textes** : Bien qu'il y ait un minimum (200 caractères), il n'y a pas de maximum strict dans la base (TextField de Postgres). Néanmoins, veiller à ce que l'API ne plante pas par manque de RAM pour des textes gigantesques.
