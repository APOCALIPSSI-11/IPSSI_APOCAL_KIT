# T-T1.2 — Backend : endpoint `GET /api/dashboard-classe/`

> **User Story** : US-T1 — *Espace Enseignant / Suivi de Classe*
> **Sprint** : Sprint 3
> **Estimation** : 3h
> **Assigné** : Seer MENSAH ASSIAKOLEY (repris de Redouane ID SOUGOU)
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de créer l'endpoint `GET /api/dashboard-classe/` réservé aux enseignants. Cet endpoint doit calculer et renvoyer les statistiques globales de la ou des classes gérées par l'enseignant connecté. Ces données alimenteront l'interface frontend (`T-T1.3`).

**Dépendance bloquante** : [T-T1.1](MENSAH_ASSIAKOLEY_Seer_TT1-1_modele_classe.md) (Seer MENSAH ASSIAKOLEY) doit être terminée pour avoir accès au modèle `ClassGroup`.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/courses/views.py](../../../backend/courses/views.py) | Vues de l'application `courses` | **OUI** (créer `TeacherDashboardView`) |
| [backend/courses/urls.py](../../../backend/courses/urls.py) | Routes HTTP de l'application `courses` | **OUI** (enregistrer l'endpoint) |

---

## 3. Spécifications techniques

### 3.1 Permissions et Sécurité
- L'utilisateur doit être authentifié.
- L'utilisateur doit posséder le rôle `teacher` (vérifiable via `request.user.profile.role == "teacher"`). Si l'utilisateur n'est pas enseignant, renvoyer une erreur `403 FORBIDDEN`.

### 3.2 Calculs des KPIs et Structure de Réponse
L'endpoint doit agréger les données suivantes pour l'enseignant connecté :
1. **Statistiques globales de la classe** :
   - `total_students` : Nombre unique d'étudiants inscrits dans ses classes.
   - `average_score` : Score moyen général de tous les étudiants sur tous les quiz répondus.
   - `total_quizzes` : Nombre total de quiz terminés par les étudiants de la classe.
2. **Liste de progression des étudiants** (`students_progress`) :
   - `email` / `first_name` / `last_name` de l'étudiant.
   - `quizzes_completed` : Nombre de quiz répondus par cet étudiant.
   - `average_score` : Score moyen de cet étudiant (en pourcentage ou note).
   - `last_activity` : Date de la dernière réponse de l'étudiant.

Structure du JSON attendu :
```json
{
  "total_students": 15,
  "average_score": 74.5,
  "total_quizzes_completed": 42,
  "students_progress": [
    {
      "email": "student1@test.local",
      "first_name": "Jean",
      "last_name": "Dupont",
      "quizzes_completed": 5,
      "average_score": 80.0,
      "last_activity": "2026-07-01T12:00:00Z"
    }
  ]
}
```

---

## 4. Étapes détaillées

### Étape 1 — Créer la vue `TeacherDashboardView`
Dans `backend/courses/views.py`, implémenter la vue :
- Vérifier le rôle de l'utilisateur.
- Effectuer des requêtes SQL optimisées (utiliser `annotate`, `Avg` ou `Count` pour éviter les requêtes N+1 sur l'historique des quiz des étudiants).

Exemple de logique de calcul :
```python
from django.db.models import Avg, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import ClassGroup
# Importer le modèle de réponse ou de quiz nécessaire

class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, "profile") or request.user.profile.role != "teacher":
            return Response({"detail": "Accès réservé aux enseignants."}, status=status.HTTP_403_FORBIDDEN)
            
        classes = ClassGroup.objects.filter(teacher=request.user)
        # Extraire les étudiants inscrits dans ces classes
        students = ...
        
        # Calculer les métriques globales et de progression...
        
        return Response(data, status=status.HTTP_200_OK)
```

### Étape 2 — Configurer l'URL
Dans `backend/courses/urls.py`, enregistrer l'URL correspondante :
```python
path("dashboard-classe/", TeacherDashboardView.as_view(), name="teacher-dashboard"),
```

---

## 5. Definition of Done

- [x] L'endpoint `GET /api/dashboard-classe/` (physiquement sous `/api/courses/dashboard-classe/`) renvoie un statut `200 OK` avec les statistiques de classe attendues.
- [x] Les appels par des utilisateurs non connectés renvoient un statut `401 UNAUTHORIZED`.
- [x] Les appels par des étudiants connectés renvoient un statut `403 FORBIDDEN`.
- [x] Les calculs d'agrégation de score et d'activité sont corrects et validés.
- [x] Les requêtes SQL générées sont optimisées et évitent les boucles N+1.

---

## 6. Pièges à éviter

1. **Requêtes N+1** : Ne pas boucler sur les étudiants en faisant une requête pour chaque étudiant pour calculer son score moyen. Utiliser les annotations de Django (`Student.objects.filter(...).annotate(avg_score=Avg('useranswer__score'))`).
2. **Fuite de données d'autres classes** : S'assurer que seuls les étudiants faisant partie des classes de l'enseignant connecté sont renvoyés dans sa liste.
