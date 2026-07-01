# T-02.5 — Tests unitaires et d'intégration de l'import de cours

> **User Story** : US-02 — *En tant que Léa, je veux uploader un PDF ≤ 5 Mo ou saisir un texte > 200 caractères afin de fournir ma matière de révision sans ressaisie manuelle.*
> **Sprint** : Sprint 1
> **Estimation** : 1h
> **Assigné** : Romain LEFEVRE
> **Statut** : Done

---

## 1. Objectif de la tâche

Écrire les tests backend et frontend pour la fonctionnalité d'importation de cours (US-02) :
- **Backend** : Tester la création de `Course` via PDF (avec mock de la structure du fichier) et via saisie directe de texte (vérification des seuils et de la persistance).
- **Frontend** : Tester le composant `UploadPage` pour valider que les messages d'erreur s'affichent correctement en cas de non-respect des critères (taille de PDF, nombre de caractères).

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| `backend/quizzes/tests/test_courses.py` | Tests des cours côté backend | **OUI** (nouveau fichier ou enrichissement) |
| `frontend/src/test/UploadPage.test.tsx` | Tests unitaires du composant React d'upload | **OUI** (nouveau fichier) |

---

## 3. Spécifications techniques

### 3.1 Tests backend (pytest)
Nous devons couvrir :
1. **Upload PDF valide** : Simuler l'envoi d'un fichier PDF mocké contenant du texte, vérifier que l'API renvoie `201 CREATED`, extrait le texte et crée le modèle `Course` en base.
2. **Upload PDF > 5 Mo** : Créer un fichier mocké volumineux et s'assurer que l'API renvoie `400 BAD REQUEST`.
3. **Upload fichier incorrect** : Envoyer un fichier `.txt` ou `.png` et vérifier qu'il est rejeté avec un code `400`.
4. **Import texte court (< 200 caractères)** : Envoyer une chaîne courte, vérifier le rejet `400`.
5. **Import texte valide (≥ 200 caractères)** : Envoyer un long texte, vérifier la création et l'association avec l'utilisateur authentifié.

Exemple de test d'upload PDF mocké en Django :
```python
from django.core.files.uploadedfile import SimpleUploadedFile
import pytest

@pytest.mark.django_db
def test_upload_pdf_success(client, authenticated_user):
    pdf_content = b"%PDF-1.4 ... (contenu PDF minimal avec texte extractible) ..."
    pdf_file = SimpleUploadedFile("cours.pdf", pdf_content, content_type="application/pdf")
    
    response = client.post(
        "/api/quizzes/courses/upload-pdf/",
        {"file": pdf_file},
        format="multipart"
    )
    assert response.status_code == 201
```

### 3.2 Tests frontend (Vitest)
Vérifier l'interface utilisateur de la page d'upload :
1. **Validation client de taille de fichier** : Charger un fichier factice de 6 Mo, vérifier que le formulaire affiche une erreur et bloque le bouton submit.
2. **Validation client de texte** : Saisir 150 caractères, vérifier que le compteur affiche un avertissement et que le bouton est désactivé. Saisir 210 caractères, vérifier que le bouton devient cliquable.

---

## 4. Étapes détaillées

### Étape 1 — Implémenter les tests backend
Créer ou compléter `backend/quizzes/tests/test_courses.py` avec les cas décrits.
Lancer les tests :
```bash
docker compose exec backend pytest quizzes/
```

### Étape 2 — Implémenter les tests frontend
Créer le fichier `frontend/src/test/UploadPage.test.tsx`.
Lancer les tests du frontend :
```bash
npm run test
```

---

## 5. Definition of Done

- [ ] L'ensemble des cas d'erreurs (PDF volumineux, non-PDF, texte court) et de succès sont couverts par les tests unitaires backend.
- [ ] La validation côté client pour la taille de fichier et le nombre de caractères est testée et validée dans le frontend.
- [ ] Tous les tests écrits passent au vert sans régression.

---

## 6. Pièges à éviter

1. **Extraction PDF en test** : Les fichiers PDF de tests binaires complexes peuvent être difficiles à mocker pour que `pypdf` y trouve du texte. Utilisez un fichier PDF minimal valide contenant un texte connu, ou mockez la fonction d'extraction du PDF dans le test pour tester uniquement la tuyauterie de la vue Django.
2. **Fuite de fichiers dans les répertoires de test** : S'assurer que les fichiers temporaires créés lors des tests unitaires sont automatiquement nettoyés ou stockés uniquement en mémoire.
