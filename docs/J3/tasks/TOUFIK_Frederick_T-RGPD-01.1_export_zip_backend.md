# T-RGPD-01.1 — Backend : endpoint `GET /api/accounts/export/` + génération ZIP

> **User Story** : US-RGPD-01 — *En tant qu'utilisateur·trice, je veux exporter toutes mes données personnelles en ZIP, afin d'exercer mon droit d'accès et de portabilité (Art. 15 & Art. 20 RGPD).*
> **Sprint** : Sprint 2
> **Estimation** : 3h
> **Assigné** : Frederick TOUFIK
> **Statut** : To Do

---

## 1. Objectif de la tâche

Créer un endpoint `GET /api/accounts/export/` (authentifié) qui agrège l'ensemble des données personnelles de l'utilisateur connecté et les retourne sous forme d'une archive ZIP téléchargeable. L'archive contient deux fichiers :

- **`profil_et_quizz.json`** : profil utilisateur + liste complète des quizzes avec leurs questions.
- **`reponses_tentatives.csv`** : détail tabulaire de chaque réponse soumise (question par question, pour toutes les tentatives).

Un commentaire `TODO` dans `backend/accounts/views.py` (ligne 271) identifie déjà cet emplacement comme futur point d'export RGPD.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/views.py](../../../backend/accounts/views.py) | Vues d'authentification (contient le TODO ligne 271) | **OUI** (ajouter `ExportDataView`) |
| [backend/accounts/urls.py](../../../backend/accounts/urls.py) | Routage HTTP des comptes | **OUI** (enregistrer la route `export/`) |
| [backend/quizzes/models.py](../../../backend/quizzes/models.py) | Modèles `Quiz`, `Question`, `Course` | **Non** (lecture seule) |
| [backend/accounts/models.py](../../../backend/accounts/models.py) | Modèles `User`, `Profile` | **Non** (lecture seule) |

---

## 3. Spécifications techniques

### 3.1 Structure de l'archive ZIP

```
export_<user_id>_<YYYYMMDD>.zip
├── profil_et_quizz.json
└── reponses_tentatives.csv
```

#### `profil_et_quizz.json`

```json
{
  "profil": {
    "email": "lea@exemple.fr",
    "first_name": "Léa",
    "last_name": "Martin",
    "date_joined": "2026-06-30T20:00:00Z",
    "email_verified": true
  },
  "quizzes": [
    {
      "id": 1,
      "title": "Révolution française",
      "score": 8,
      "created_at": "2026-07-01T10:00:00Z",
      "questions": [
        {
          "index": 1,
          "prompt": "En quelle année débuta la Révolution ?",
          "options": ["1787", "1789", "1792", "1799"],
          "correct_index": 1,
          "selected_index": 1
        }
      ]
    }
  ]
}
```

#### `reponses_tentatives.csv`

```
quiz_id,quiz_titre,question_index,enonce,reponse_choisie,reponse_correcte,correct
1,Révolution française,1,En quelle année débuta la Révolution ?,1789,1789,True
```

Colonnes : `quiz_id`, `quiz_titre`, `question_index`, `enonce`, `reponse_choisie` (texte de l'option choisie ou vide si non répondu), `reponse_correcte` (texte de la bonne option), `correct` (True/False).

### 3.2 Vue `ExportDataView`

```python
import io, json, csv, zipfile
from django.http import HttpResponse
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from quizzes.models import Quiz

class ExportDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile

        # --- Agrégation JSON ---
        quizzes_data = []
        for quiz in Quiz.objects.filter(user=user).prefetch_related("questions"):
            quizzes_data.append({
                "id": quiz.id,
                "title": quiz.title,
                "score": quiz.score,
                "created_at": quiz.created_at.isoformat(),
                "questions": [
                    {
                        "index": q.index,
                        "prompt": q.prompt,
                        "options": q.options,
                        "correct_index": q.correct_index,
                        "selected_index": q.selected_index,
                    }
                    for q in quiz.questions.all()
                ],
            })

        payload = {
            "profil": {
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "date_joined": user.date_joined.isoformat(),
                "email_verified": profile.email_verified,
            },
            "quizzes": quizzes_data,
        }

        # --- Agrégation CSV ---
        csv_buffer = io.StringIO()
        writer = csv.writer(csv_buffer)
        writer.writerow(["quiz_id", "quiz_titre", "question_index", "enonce",
                          "reponse_choisie", "reponse_correcte", "correct"])
        for quiz in Quiz.objects.filter(user=user).prefetch_related("questions"):
            for q in quiz.questions.all():
                chosen = q.options[q.selected_index] if q.selected_index is not None else ""
                correct = q.options[q.correct_index]
                is_correct = q.selected_index == q.correct_index if q.selected_index is not None else False
                writer.writerow([quiz.id, quiz.title, q.index, q.prompt,
                                  chosen, correct, is_correct])

        # --- Construction ZIP en mémoire ---
        zip_buffer = io.BytesIO()
        date_str = now().strftime("%Y%m%d")
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("profil_et_quizz.json",
                        json.dumps(payload, ensure_ascii=False, indent=2))
            zf.writestr("reponses_tentatives.csv",
                        csv_buffer.getvalue())

        zip_buffer.seek(0)
        filename = f"export_{user.id}_{date_str}.zip"
        response = HttpResponse(zip_buffer.read(), content_type="application/zip")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response
```

### 3.3 Route

```python
path("export/", ExportDataView.as_view(), name="export-data"),
```

---

## 4. Étapes détaillées

### Étape 1 — Créer la vue `ExportDataView`
Dans `backend/accounts/views.py`, ajouter `ExportDataView` après `ChangePasswordView`. Importer `io`, `json`, `csv`, `zipfile` en tête de fichier.

### Étape 2 — Enregistrer la route
Dans `backend/accounts/urls.py`, importer `ExportDataView` et ajouter :
```python
path("export/", ExportDataView.as_view(), name="export-data"),
```

### Étape 3 — Vérifier l'accès au `Profile`
S'assurer que `user.profile` existe pour les comptes de test (`get_or_create_profile(user)` si nécessaire). Un compte créé avant l'ajout du modèle `Profile` peut ne pas avoir de profil lié.

---

## 5. Definition of Done

- [ ] `GET /api/accounts/export/` retourne un fichier ZIP (Content-Type `application/zip`) pour tout utilisateur authentifié.
- [ ] L'archive contient exactement `profil_et_quizz.json` et `reponses_tentatives.csv`.
- [ ] Le JSON contient les données du profil et la liste de tous les quizzes avec leurs questions.
- [ ] Le CSV liste toutes les réponses soumises (une ligne par question tentée), avec texte lisible (pas d'index brut).
- [ ] Une requête sans token retourne `401 UNAUTHORIZED`.
- [ ] Un utilisateur ne peut exporter que ses propres données (filtre `user=request.user` systématique).
- [ ] L'archive est générée en mémoire (pas d'écriture disque) : utiliser `io.BytesIO` et `io.StringIO`.

---

## 6. Pièges à éviter

1. **Écriture disque** : Ne pas utiliser `open()` ou un chemin de fichier temporaire. Tout doit passer par `io.BytesIO` (ZIP) et `io.StringIO` (CSV) pour éviter les collisions entre utilisateurs concurrents et les résidus de fichiers sur le serveur.
2. **Index bruts dans le CSV** : Exporter `q.options[q.selected_index]` (le texte) plutôt que l'index entier — un export RGPD doit être lisible par un non-technicien.
3. **`selected_index` null** : Certaines questions peuvent ne pas avoir été répondues (`selected_index = None`). Toujours protéger l'accès avec `if q.selected_index is not None` avant d'indexer `q.options`.
4. **Double requête N+1** : Sans `prefetch_related("questions")`, chaque quiz déclenche une requête SQL séparée pour charger ses questions. Utiliser `Quiz.objects.filter(user=user).prefetch_related("questions")` pour charger tout en 2 requêtes.
