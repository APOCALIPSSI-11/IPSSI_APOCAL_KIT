# T-02.2 — Endpoint `POST /api/courses` (PDF upload ≤ 5 Mo) + extraction texte (`pypdf`)

> **User Story** : US-02 — *En tant que Léa, je veux uploader un PDF ≤ 5 Mo ou saisir un texte > 200 caractères afin de fournir ma matière de révision sans ressaisie manuelle.*
> **Sprint** : Sprint 1
> **Estimation** : 3h
> **Assigné** : Redouane ID SOUGOU
> **Statut** : Done

---

## 1. Objectif de la tâche

Créer l'endpoint `POST /api/quizzes/courses/` (ou `/api/courses/` selon les routes définies) acceptant un fichier PDF multipart/form-data. L'endpoint doit valider que la taille du fichier est inférieure ou égale à 5 Mo, en extraire le contenu textuel brut à l'aide de la bibliothèque `pypdf` (dépendance `pypdf==5.1.0`), et l'enregistrer sous forme d'un objet `Course` en base de données.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/quizzes/serializers.py](../../../../backend/quizzes/serializers.py) | Sérialiseurs DRF | **OUI** (créer `CourseSerializer`) |
| [backend/quizzes/views.py](../../../../backend/quizzes/views.py) | Endpoints d'API | **OUI** (créer `CourseUploadView`) |
| [backend/quizzes/urls.py](../../../../backend/quizzes/urls.py) | Routage des requêtes HTTP | **OUI** |
| `backend/requirements.txt` | Dépendances backend | Non (contient déjà `pypdf==5.1.0`) |

---

## 3. Spécifications techniques

### 3.1 Validation du fichier PDF
- L'API attend une requête `multipart/form-data` contenant une clé `file` représentant le fichier PDF.
- **Taille maximale** : 5 * 1024 * 1024 octets (5 Mo). Si le fichier dépasse ce seuil, retourner `400 BAD REQUEST` avec un message d'erreur explicite.
- **Type de fichier** : Vérifier que le fichier se termine par `.pdf` ou que son Content-Type est `application/pdf`.

### 3.2 Extraction de texte avec `pypdf`
Utiliser la classe `PdfReader` de `pypdf` pour parcourir toutes les pages du fichier et en concaténer le texte.
```python
from pypdf import PdfReader
import io

def extract_text_from_pdf(pdf_file) -> str:
    # pdf_file est un objet InMemoryUploadedFile ou TemporaryUploadedFile de Django
    pdf_reader = PdfReader(io.BytesIO(pdf_file.read()))
    text_content = []
    for page in pdf_reader.pages:
        extracted = page.extract_text()
        if extracted:
            text_content.append(extracted)
    return "\n".join(text_content).strip()
```

### 3.3 Persistance
Enregistrer un enregistrement dans la table `Course` :
- `user` : Utilisateur authentifié (`self.request.user`).
- `title` : Nom du fichier original (ex: `cours_algo.pdf`).
- `content` : Texte extrait du PDF.
- `source` : `"pdf"`.

---

## 4. Étapes détaillées

### Étape 1 — Créer le sérialiseur de cours
Dans `backend/quizzes/serializers.py` :
```python
from .models import Course

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "title", "content", "source", "created_at"]
        read_only_fields = ["id", "title", "content", "source", "created_at"]
```

### Étape 2 — Implémenter la vue d'upload
Dans `backend/quizzes/views.py`, ajouter la classe `CourseUploadView` :
```python
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import CourseSerializer
from .models import Course
from pypdf import PdfReader
import io

class CourseUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if "file" not in request.FILES:
            return Response({"file": ["Aucun fichier n'a été fourni."]}, status=status.HTTP_400_BAD_REQUEST)
        
        pdf_file = request.FILES["file"]
        
        # Validation taille (5 Mo)
        if pdf_file.size > 5 * 1024 * 1024:
            return Response({"file": ["Le fichier dépasse la taille maximale autorisée de 5 Mo."]}, status=status.HTTP_400_BAD_REQUEST)
            
        # Validation type
        if not pdf_file.name.lower().endswith('.pdf'):
            return Response({"file": ["Seuls les fichiers PDF sont acceptés."]}, status=status.HTTP_400_BAD_REQUEST)

        # Extraction de texte
        try:
            text_content = []
            pdf_reader = PdfReader(io.BytesIO(pdf_file.read()))
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_content.append(extracted)
            
            content_str = "\n".join(text_content).strip()
            
            if len(content_str) < 10:
                return Response({"file": ["Le PDF ne contient pas assez de texte extractible (PDF scanné sans OCR ?)."]}, status=status.HTTP_400_BAD_REQUEST)
                
            # Création du cours
            course = Course.objects.create(
                user=request.user,
                title=pdf_file.name,
                content=content_str,
                source=Course.Source.PDF
            )
            
            return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"detail": f"Erreur lors de l'extraction : {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

### Étape 3 — Configurer les URL
Dans `backend/quizzes/urls.py` :
```python
from django.urls import path
from .views import CourseUploadView

urlpatterns = [
    # ... autres urls
    path("courses/upload-pdf/", CourseUploadView.as_view(), name="course-upload-pdf"),
]
```

---

## 5. Definition of Done

- [ ] L'endpoint `/api/quizzes/courses/upload-pdf/` accepte les requêtes `POST` en `multipart/form-data`.
- [ ] Les fichiers de taille > 5 Mo sont rejetés avec une erreur 400.
- [ ] Les fichiers non-PDF sont rejetés avec une erreur 400.
- [ ] Le texte brut est correctement extrait du document PDF et stocké dans le champ `content`.
- [ ] L'utilisateur connecté est assigné comme propriétaire de l'objet `Course`.
- [ ] Retourne un code statut `201 CREATED` avec les métadonnées du cours enregistré.

---

## 6. Pièges à éviter

1. **PDFs scannés (Images)** : `pypdf` ne fait pas d'OCR (Reconnaissance Optique de Caractères). Si un PDF contient uniquement des images, le texte extrait sera vide. L'API doit retourner une erreur 400 indiquant que le PDF ne contient pas de texte extractible plutôt que d'enregistrer un cours vide.
2. **Fuites mémoire** : Ne pas stocker de gros fichiers PDF temporaires sur le disque dur sans nettoyage ; privilégier le traitement en mémoire via `io.BytesIO`.
3. **Double lecture** : `pdf_file.read()` vide le curseur de lecture. Si vous devez lire à nouveau, faites `pdf_file.seek(0)`.
