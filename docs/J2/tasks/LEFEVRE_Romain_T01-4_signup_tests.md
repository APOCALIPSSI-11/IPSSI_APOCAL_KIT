# T-01.4 — Tests unitaires et d'intégration de l'inscription

> **User Story** : US-01 — *En tant que Léa, je veux m'inscrire sur la plateforme afin de pouvoir sauvegarder mes cours et mes quiz.*
> **Sprint** : Sprint 1
> **Estimation** : 1h
> **Assigné** : Romain LEFEVRE
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'écrire des tests automatisés robustes pour l'inscription (signup) côté backend (Django avec pytest) et côté frontend (React avec Vitest et Testing Library). Ces tests garantissent qu'aucune régression ne sera introduite et valident les critères d'acceptation fonctionnels et de sécurité de l'inscription.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/tests.py](../../../backend/accounts/tests.py) | Fichier de tests pour l'app accounts backend | **OUI** |
| `frontend/src/test/SignupPage.test.tsx` | Tests unitaires du composant frontend | **OUI** (nouveau fichier) |

---

## 3. Spécifications techniques

### 3.1 Tests backend (pytest-django)
Nous devons tester plusieurs cas d'usage de l'inscription dans `backend/accounts/tests.py` :
1. **Création de compte valide** : Envoyer un email unique et un mot de passe robuste, vérifier que le code de retour est `201 CREATED`, que l'utilisateur est bien créé en base avec `username = email`, et que son mot de passe est haché.
2. **Adresse email manquante** : Envoyer uniquement le mot de passe, vérifier le code de retour `400 BAD REQUEST`.
3. **Mot de passe trop court** : Envoyer un mot de passe de moins de 8 caractères, vérifier le code de retour `400 BAD REQUEST`.
4. **Email doublon** : Tenter d'inscrire deux fois la même adresse email (sensibilité insensible à la casse), vérifier que la deuxième tentative renvoie une erreur `400 BAD REQUEST` avec un message d'erreur clair.

Exemple d'implémentation de tests backend :
```python
import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db

@pytest.fixture
def client() -> APIClient:
    return APIClient()

def test_signup_creates_user(client):
    response = client.post(
        "/api/accounts/signup/",
        {"email": "bob@test.com", "password": "motdepasse123"},
        format="json",
    )
    assert response.status_code == 201
    assert User.objects.filter(email="bob@test.com").exists()

def test_signup_requires_email(client):
    response = client.post(
        "/api/accounts/signup/",
        {"password": "motdepasse123"},
        format="json",
    )
    assert response.status_code == 400

def test_signup_duplicate_email(client):
    client.post(
        "/api/accounts/signup/",
        {"email": "bob@test.com", "password": "motdepasse123"},
        format="json",
    )
    response = client.post(
        "/api/accounts/signup/",
        {"email": "bob@test.com", "password": "autremotdepasse"},
        format="json",
    )
    assert response.status_code == 400
    assert "email" in response.data or "non_field_errors" in response.data
```

### 3.2 Tests frontend (Vitest + Testing Library)
Créer un fichier de test `frontend/src/test/SignupPage.test.tsx` pour tester le comportement d'interface de la page d'inscription.
1. **Rendu de la page** : S'assurer que le formulaire, les champs (email, prénom, nom, mot de passe) et le bouton de soumission s'affichent correctement.
2. **Soumission réussie** : Simuler la saisie de données correctes, le clic sur le bouton, le déclenchement de la fonction de création de compte, et la redirection vers `/upload`.
3. **Affichage d'erreur** : Simuler une réponse en erreur de l'API (ex: 400 doublon d'email) et vérifier que l'erreur s'affiche dans le bandeau d'alerte.

---

## 4. Étapes détaillées

### Étape 1 — Lancer et compléter les tests backend
1. Modifier [backend/accounts/tests.py](../../../backend/accounts/tests.py).
2. Lancer les tests depuis la racine :
   ```bash
   docker compose exec backend pytest accounts/
   ```

### Étape 2 — Écrire les tests du composant React
1. Créer le fichier `frontend/src/test/SignupPage.test.tsx`.
2. Utiliser `vi.mock` pour simuler le service `@/api/auth` et la navigation.
3. Exécuter les tests frontend depuis la racine :
   ```bash
   npm run test
   ```
   (ou via docker si configuré : `docker compose exec frontend npm run test`)

---

## 5. Definition of Done (DoD)

- [ ] Les tests backend couvrent les scénarios de succès, d'email manquant, de mot de passe invalide et de doublon d'email.
- [ ] Tous les tests pytest s'exécutent avec succès (`pytest accounts/` -> 100% OK).
- [ ] Les tests frontend couvrent le rendu, le succès d'inscription avec redirection, et l'affichage d'erreurs d'API.
- [ ] Tous les tests Vitest passent avec succès.

---

## 6. Pièges à éviter

1. **Ne pas mock les fonctions importantes au mauvais niveau** : Lors des tests Vitest, veiller à simuler la fonction API `signup` et non pas seulement `axios` directement, pour garder les tests du composant couplés à la logique du service d'API.
2. **Biais de base de données persistée en backend** : S'assurer que chaque test s'exécute dans une transaction isolée via `@pytest.mark.django_db`. Ne pas réutiliser les mêmes adresses email dans différents tests sans nettoyage si les fixtures ne réinitialisent pas la base.
