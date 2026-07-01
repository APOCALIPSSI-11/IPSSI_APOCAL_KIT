# T-J3B-5 — Tests QA export + audit trail (isolation utilisateur)

> **User Story** : US-J3B-5 — *Perturbation J3-bis (RGPD / SAR)*
> **Sprint** : Sprint 3
> **Estimation** : 1.5h
> **Assigné** : Romain LEFEVRE
> **Statut** : Todo

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de concevoir et d'implémenter des tests unitaires et d'intégration automatisés pour valider la conformité de l'export RGPD et de son audit trail SAR. Les tests doivent garantir que le format JSON structuré est correct et, surtout, que **l'isolation des données par utilisateur** est respectée à 100% (anti-pattern CNIL de fuite de données : un utilisateur ne doit en aucun cas pouvoir exporter les données de ses pairs).

**Dépendances** : [T-J3B-4](TOUFIK_Frederick_TJ3B-4_export_json.md) (Frederick TOUFIK) et [T-J3B-2](MENSAH_ASSIAKOLEY_Seer_TJ3B-2_audit_trail_sar.md) (Seer MENSAH ASSIAKOLEY).

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/tests.py](../../../backend/accounts/tests.py) | Tests de l'application `accounts` | **OUI** |

---

## 3. Spécifications techniques des tests

Créer les cas de test suivants dans `backend/accounts/tests.py` :

### 3.1 Test de l'endpoint d'export au format JSON
- Authentifier un utilisateur de test `user_A`.
- Appeler `GET /api/accounts/export/?format=json`.
- Vérifier que le statut de réponse est `200 OK`.
- Valider que le contenu retourné est du JSON contenant les clés attendues (`user`, `quizzes`, `answers`, `logs`).

### 3.2 Test de l'isolation utilisateur (Sécurité critique)
- Créer un second utilisateur `user_B` qui possède des quiz et des réponses en base.
- Authentifier `user_A`.
- Appeler `GET /api/accounts/export/?format=json`.
- Valider que la liste `quizzes` et `answers` de la réponse JSON ne contient **aucun** élément appartenant à `user_B`.
- Le test doit échouer si une requête `Model.objects.all()` sans filtre par utilisateur a été malencontreusement utilisée par le développeur dans la vue.

### 3.3 Test de l'audit trail SAR
- Après l'appel de l'endpoint d'export par `user_A` :
  - Vérifier qu'une ligne `RGPDRequestLog` a bien été créée en base.
  - Vérifier que `request_type` vaut `"export"`.
  - Vérifier que `status` vaut `"answered"`.
  - Vérifier que `file_hash` n'est pas vide et contient une chaîne hexadécimale de 64 caractères (SHA-256).

---

## 4. Étapes détaillées

### Étape 1 — Écrire les méthodes de test
Ouvrir [backend/accounts/tests.py](../../../backend/accounts/tests.py) et ajouter une classe ou des méthodes de test :
```python
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from accounts.models import RGPDRequestLog

User = get_user_model()

class RGPDExportTests(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(email="user_a@test.local", password="password123", username="user_a@test.local")
        self.user_b = User.objects.create_user(email="user_b@test.local", password="password123", username="user_b@test.local")
        # Créer des données associées à user_b...
        
    def test_export_json_format_and_isolation(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get("/api/accounts/export/?format=json")
        self.assertEqual(response.status_code, 200)
        # Vérifications d'isolation et d'existence du log...
        ...
```

### Étape 2 — Lancer la CI / Suite de tests
Exécuter les tests locaux pour s'assurer qu'ils passent :
```bash
pytest backend/accounts/tests.py
```

---

## 5. Definition of Done

- [ ] La suite de tests unitaires pour l'export JSON est écrite et intégrée dans `backend/accounts/tests.py`.
- [ ] Le test d'isolation utilisateur (non-leak) est implémenté et passe avec succès.
- [ ] Le test de validation de la création de l'audit log (avec hash et statut correct) est fonctionnel.
- [ ] Tous les tests du projet passent sans erreur (`pytest` global au vert).
