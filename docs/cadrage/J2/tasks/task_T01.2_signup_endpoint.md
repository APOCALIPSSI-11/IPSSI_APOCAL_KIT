# T-01.2 — Sérialiseur DRF + endpoint POST `/api/accounts/signup/`

> **User Story** : US-01 — *En tant que Léa, je veux m'inscrire sur la plateforme afin de pouvoir sauvegarder mes cours et mes quiz.*
> **Sprint** : Sprint 1
> **Estimation** : 2h
> **Assigné** : Frederick TOUFIK
> **Statut** : Done

---

## 1. Objectif de la tâche

Cette tâche consiste à créer le sérialiseur `SignupSerializer` à l'aide de Django REST Framework (DRF) et l'endpoint API `POST /api/accounts/signup/` pour permettre aux utilisateurs de s'inscrire en spécifiant un e-mail unique et un mot de passe robuste (≥ 8 caractères). 

L'inscription utilise l'e-mail comme identifiant principal. Le `username` interne de Django sera alimenté par cette valeur d'e-mail.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/serializers.py](../../../../backend/accounts/serializers.py) | Définition des sérialiseurs de l'application | **OUI** |
| [backend/accounts/views.py](../../../../backend/accounts/views.py) | Définition des vues API | **OUI** |
| [backend/accounts/urls.py](../../../../backend/accounts/urls.py) | Routage des requêtes HTTP | **OUI** |

---

## 3. Spécifications techniques

### 3.1 SignupSerializer

Le sérialiseur doit hériter de `serializers.ModelSerializer` lié au modèle `User` de Django.
- **Champ `email`** : Obligatoire, insensible à la casse lors de la validation. Doit être unique dans la base de données.
- **Champ `password`** : En écriture seule (`write_only=True`), avec une longueur minimale de 8 caractères.
- **Validation du mot de passe** : Doit déléguer la vérification aux validateurs par défaut de Django via `django.contrib.auth.password_validation.validate_password`.
- **Méthode `create`** :
  1. Extraire le mot de passe.
  2. Initialiser l'objet `User` avec `username = email.lower()`.
  3. Appliquer `user.set_password(password)` pour hacher le mot de passe.
  4. Sauvegarder l'utilisateur.
  5. Créer son profil associé.

Exemple d'implémentation :
```python
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password as django_validate_password
from django.core.exceptions import DjangoValidationError
from rest_framework import serializers

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name"]

    def validate_email(self, value: str) -> str:
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Un compte existe déjà avec cet email.")
        return value

    def validate_password(self, value: str) -> str:
        try:
            django_validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")
        email = validated_data["email"]
        user = User(username=email, **validated_data)
        user.set_password(password)
        user.save()
        return user
```

### 3.2 SignupView

Une vue `APIView` dédiée gérant le verbe `POST` :
- Doit être accessible publiquement : `permission_classes = [AllowAny]`.
- Désactive l'authentification de session pour éviter les échecs de jeton CSRF lors de l'appel public : `authentication_classes = []`.
- Appelle le `SignupSerializer` avec les données reçues, valide et sauvegarde l'utilisateur.
- Envoie optionnellement un e-mail de validation (Soft validation : ne pas bloquer la réponse HTTP si l'envoi de l'e-mail échoue).
- Retourne les données de l'utilisateur créé via `UserSerializer` avec un statut `201 CREATED`.

---

## 4. Étapes détaillées

### Étape 1 — Ajouter le sérialiseur
Modifier [backend/accounts/serializers.py](../../../../backend/accounts/serializers.py) et ajouter la classe `SignupSerializer`.

### Étape 2 — Ajouter la vue API
Modifier [backend/accounts/views.py](../../../../backend/accounts/views.py) et ajouter la classe `SignupView`.

### Étape 3 — Enregistrer la route URL
Modifier [backend/accounts/urls.py](../../../../backend/accounts/urls.py) et ajouter le pattern de route correspondant :
```python
from django.urls import path
from .views import SignupView

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
]
```

---

## 5. Definition of Done (DoD)

- [ ] L'endpoint `/api/accounts/signup/` accepte les requêtes `POST`.
- [ ] L'email est validé pour s'assurer qu'il n'existe aucun doublon en base (insensibilité à la casse).
- [ ] Le mot de passe fait au moins 8 caractères et passe les validateurs standard de Django.
- [ ] Le mot de passe est enregistré de manière sécurisée (hachage PBKDF2 ou équivalent).
- [ ] L'endpoint retourne un code statut `201 CREATED` avec les métadonnées de l'utilisateur (sans le mot de passe).

---

## 6. Pièges à éviter

1. **Ne pas stocker le mot de passe en clair** : Toujours utiliser `user.set_password(password)`. Ne jamais faire `user.password = password`.
2. **Pas de mot de passe en sortie** : S'assurer que le champ `password` est bien marqué en `write_only=True` dans le sérialiseur.
3. **Cas d'erreurs d'email** : Si la base de données lève une contrainte d'unicité, l'API ne doit pas renvoyer une erreur 500. Le validateur `validate_email` doit l'intercepter et lever un `ValidationError` propre (HTTP 400).
