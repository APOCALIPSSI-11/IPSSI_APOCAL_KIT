# T-01.2 — Sérialiseur DRF + endpoint `POST /api/accounts/signup/`

> **User Story** : US-01 — *En tant que Léa, je veux créer un compte avec mon email et un mot de passe afin d'accéder à la plateforme.*
> **Sprint** : Sprint 1
> **Estimation** : 2h
> **Assigné** : Frederick TOUFIK
> **Statut** : Done

---

## 1. Objectif de la tâche

Créer le sérialiseur DRF qui valide les données d'inscription (email unique, mot de passe ≥ 8 caractères), puis exposer un endpoint `POST /api/accounts/signup/` accessible sans authentification qui crée le compte et retourne les infos de l'utilisateur créé.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/serializers.py](../../../backend/accounts/serializers.py) | Sérialiseurs de validation des données d'inscription | **OUI** (créer `SignupSerializer`) |
| [backend/accounts/views.py](../../../backend/accounts/views.py) | Vues d'authentification | **OUI** (créer `SignupView`) |
| [backend/accounts/urls.py](../../../backend/accounts/urls.py) | Routage HTTP des comptes | **OUI** (enregistrer la route `signup/`) |

---

## 3. Spécifications techniques

### 3.1 Sérialiseur d'inscription (`SignupSerializer`)

- **Champ `password`** : `write_only=True`, `min_length=8` — première barrière de validation côté DRF.
- **`validate_email`** : Double unicité (sur `email` ET `username`), insensible à la casse (`__iexact`), normalisation `.strip().lower()` avant stockage. En interne le projet utilise `username = email` comme identifiant.
- **`validate_password`** : Délégation à `django.contrib.auth.password_validation.validate_password` qui applique tous les validateurs de `AUTH_PASSWORD_VALIDATORS` (longueur, liste noire, non-numérique).
- **`create`** : Utilisation de `user.set_password()` (hachage PBKDF2-SHA256). Création du profil lié via `get_or_create_profile(user)` (`email_verified = False`).

### 3.2 Vue d'inscription (`SignupView`)

- `permission_classes = [AllowAny]` et `authentication_classes = []` : endpoint public pré-authentification.
- `authentication_classes = []` évite le rejet CSRF de `SessionAuthentication` quand un cookie de session résiduel est présent (le frontend s'authentifie par token, pas par session).
- Vérification de `SiteConfig.load().allow_signups` avant création (Lot 8 — l'admin peut fermer les inscriptions).
- Envoi de l'email de validation en mode **best-effort** : un échec SMTP loggue un warning mais ne bloque pas l'inscription.
- Retourne `HTTP 201 CREATED` avec les données `UserSerializer`.

---

## 4. Étapes détaillées

### Étape 1 — Créer le sérialiseur
Dans `backend/accounts/serializers.py`, implémenter `SignupSerializer` avec les méthodes `validate_email`, `validate_password` et `create`.

### Étape 2 — Créer la vue
Dans `backend/accounts/views.py`, créer `SignupView` héritant de `APIView` :
```python
class SignupView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(request=SignupSerializer, responses={201: UserSerializer})
    def post(self, request):
        ...
```

### Étape 3 — Enregistrer la route
Dans `backend/accounts/urls.py` :
```python
path("signup/", SignupView.as_view(), name="signup"),
```

---

## 5. Definition of Done

- [ ] L'endpoint `POST /api/accounts/signup/` est fonctionnel et accessible sans authentification.
- [ ] La soumission d'un email déjà pris retourne un code `400 BAD REQUEST` avec un message explicite.
- [ ] La soumission d'un mot de passe trop court (< 8 caractères) retourne un code `400 BAD REQUEST`.
- [ ] Le compte créé retourne un code `201 CREATED` avec les données utilisateur via `UserSerializer`.
- [ ] Le mot de passe est stocké haché en base de données (jamais en clair).
- [ ] Un email de validation est envoyé en best-effort après la création du compte.

---

## 6. Pièges à éviter

1. **Mot de passe en clair** : Ne jamais assigner `user.password = password` directement — toujours utiliser `user.set_password()` pour déclencher le hachage PBKDF2-SHA256.
2. **Double unicité email/username** : L'architecture du projet utilise `username = email`. Il faut vérifier l'unicité sur les **deux** champs pour éviter tout conflit de doublon lors d'une inscription avec un email déjà présent comme username.
3. **Bug CSRF avec SessionAuthentication** : Sans `authentication_classes = []`, un cookie de session résiduel dans le navigateur peut entraîner un rejet CSRF sur cet endpoint public. Les vider garantit un comportement cohérent pour un frontend token-only.
