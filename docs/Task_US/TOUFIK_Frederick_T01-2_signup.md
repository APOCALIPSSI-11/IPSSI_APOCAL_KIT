# T-01.2 — Sérialiseur DRF + endpoint `POST /api/accounts/signup/`

> **Développeur** : Frederick TOUFIK · **US** : US-01 — Inscription d'un utilisateur  
> **Complexité** : 2 pts | **Priorité** : 2

### Ce que la tâche demande

Créer le sérialiseur DRF qui valide les données d'inscription (email unique, mot de passe ≥ 8 caractères), puis exposer un endpoint `POST /api/accounts/signup/` accessible sans authentification qui crée le compte et retourne les infos de l'utilisateur créé.

---

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `backend/accounts/serializers.py` | Créer `SignupSerializer` |
| `backend/accounts/views.py` | Créer `SignupView` |
| `backend/accounts/urls.py` | Enregistrer la route `signup/` |

---

### 1. `accounts/serializers.py` — Le sérialiseur `SignupSerializer`

C'est le cœur de la tâche : c'est ici que toute la **validation** est faite avant que le compte ne soit créé.

```python
# backend/accounts/serializers.py  (lignes 41–87 dans le projet)

class SignupSerializer(serializers.ModelSerializer):
    """Inscription par EMAIL (identifiant). Le username interne = email."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,                       # contrainte ≥ 8 caractères
        style={"input_type": "password"},
        help_text="Au moins 8 caractères.",
    )

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name"]
        extra_kwargs = {
            "email": {"required": True, "allow_blank": False},
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate_email(self, value: str) -> str:
        value = value.strip().lower()   # normalisation avant stockage
        if (
            User.objects.filter(email__iexact=value).exists()
            or User.objects.filter(username__iexact=value).exists()
        ):
            raise serializers.ValidationError(
                "Un compte existe déjà avec cet email. Connectez-vous, ou "
                "utilisez « mot de passe oublié » pour le réinitialiser."
            )
        return value

    def validate_password(self, value: str) -> str:
        try:
            django_validate_password(value)     # validateurs Django natifs
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")
        email = validated_data["email"]
        user = User(username=email, **validated_data)   # username = email
        user.set_password(password)                     # hachage bcrypt
        user.save()
        get_or_create_profile(user)                     # Profile.email_verified=False
        return user
```

#### Explication détaillée des choix

**Champ `password` en `write_only`**

Le mot de passe doit être accepté en entrée mais ne jamais ressortir dans la réponse JSON. `write_only=True` garantit que DRF l'exclut automatiquement de la sérialisation de sortie. Le paramètre `min_length=8` est une première barrière côté DRF (le message d'erreur est immédiat, avant même d'appeler `validate_password`).

**`validate_email` — double unicité**

Le modèle `User` de Django stocke deux champs distincts : `email` et `username`. Dans ce projet, le choix d'architecture est d'utiliser l'email comme identifiant de connexion, donc `username = email`. Il faut donc vérifier l'unicité sur les **deux** champs pour éviter tout conflit :

```python
User.objects.filter(email__iexact=value).exists()
or User.objects.filter(username__iexact=value).exists()
```

Le `__iexact` (insensible à la casse) évite qu'un utilisateur s'inscrive avec `Test@Gmail.com` si `test@gmail.com` existe déjà. Le `.strip().lower()` en amont normalise la valeur avant stockage.

**`validate_password` — délégation aux validateurs Django**

Plutôt que de ré-écrire la logique de validation du mot de passe, on s'appuie sur `django.contrib.auth.password_validation.validate_password` qui applique tous les validateurs configurés dans `AUTH_PASSWORD_VALIDATORS` du `settings.py`. Par défaut Django vérifie : longueur ≥ 8, non-inclusion dans la liste des mots de passe courants, non entièrement numérique. On convertit l'exception Django (`DjangoValidationError`) en exception DRF (`serializers.ValidationError`) pour que le format de réponse reste cohérent.

**`create` — `user.set_password()` et non assignation directe**

`user.set_password(password)` applique le hachage (PBKDF2-SHA256 par défaut dans Django). Si on écrivait `user.password = password`, le mot de passe serait stocké en clair en base de données — faille de sécurité critique.

**`username = email`**

C'est le choix d'architecture du projet (documenté dans `accounts/models.py` lignes 8–13). On évite ainsi d'avoir à écrire un backend d'authentification personnalisé (`AUTHENTICATION_BACKENDS`). Le `LoginSerializer` peut ensuite retrouver l'utilisateur par `email` et authentifier via `username`.

---

### 2. `accounts/views.py` — La vue `SignupView`

```python
# backend/accounts/views.py  (lignes 44–72 dans le projet)

class SignupView(APIView):
    """Inscription par email. Envoie l'email de validation (best-effort)."""

    permission_classes = [AllowAny]
    authentication_classes = []     # endpoint public, pas de CSRF session

    @extend_schema(request=SignupSerializer, responses={201: UserSerializer})
    def post(self, request):
        # Lot 8 : fermeture des inscriptions depuis l'interface admin
        from administration.models import SiteConfig
        if not SiteConfig.load().allow_signups:
            return Response(
                {"detail": "Les inscriptions sont actuellement fermées."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Envoi de l'email de validation (best-effort : ne bloque pas l'inscription)
        try:
            send_verification_email(user)
        except EmailError as exc:
            logger.warning("Email de validation non envoyé pour %s : %s", user.email, exc)

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
```

#### Explication détaillée des choix

**`permission_classes = [AllowAny]` et `authentication_classes = []`**

L'inscription est un endpoint public par définition — l'utilisateur n'a pas encore de compte. `AllowAny` permet l'accès sans token. On vide également `authentication_classes` pour éviter un bug subtil : si un cookie de session résiduel est présent dans le navigateur, DRF `SessionAuthentication` impose un contrôle CSRF et rejette la requête avec `CSRF Failed: CSRF token missing`. Puisque le frontend s'authentifie par token (pas par session), il n'envoie pas de jeton CSRF, d'où le contournement.

**`serializer.is_valid(raise_exception=True)`**

Sans `raise_exception=True`, il faudrait écrire :
```python
if not serializer.is_valid():
    return Response(serializer.errors, status=400)
```
Avec le flag, DRF lève automatiquement une `ValidationError` qui est interceptée par le gestionnaire d'exception global et retourne un 400 avec les erreurs — code plus concis.

**`status.HTTP_201_CREATED`**

La sémantique REST impose un `201 Created` (et non `200 OK`) quand une ressource vient d'être créée. C'est la convention DRF.

**Validation SOFT de l'email**

L'email de validation est envoyé en best-effort : si l'envoi échoue (clé SMTP expirée, quota dépassé), on loggue un warning mais le compte est quand même créé. Cela évite de bloquer l'inscription à cause d'une dépendance externe. L'utilisateur peut toujours redemander l'email via `POST /api/accounts/resend-verification/`.

---

### 3. `accounts/urls.py` — Enregistrement de la route

```python
# backend/accounts/urls.py  (ligne 18 dans le projet)

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    # ...
]
```

La route `signup/` est préfixée par `api/accounts/` dans `apocal/urls.py` :
```python
path("api/accounts/", include("accounts.urls")),
```

L'URL finale est donc : **`POST /api/accounts/signup/`**

---

### Flux complet de l'inscription

```
Client                     SignupView                   SignupSerializer             Base de données
  │                             │                              │                          │
  │  POST /api/accounts/signup/ │                              │                          │
  │  { email, password, ... }   │                              │                          │
  │────────────────────────────>│                              │                          │
  │                             │ SignupSerializer(data=...)   │                          │
  │                             │─────────────────────────────>│                          │
  │                             │                              │ validate_email()          │
  │                             │                              │ → strip/lower            │
  │                             │                              │ → unicité email+username  │
  │                             │                              │                          │
  │                             │                              │ validate_password()       │
  │                             │                              │ → django_validate_password│
  │                             │                              │ → ≥8 chars, non-commun   │
  │                             │                              │                          │
  │                             │                              │ create()                  │
  │                             │                              │ → user.set_password()    │
  │                             │                              │ → user.save()────────────>│
  │                             │                              │ → get_or_create_profile() │
  │                             │                              │                          │
  │                             │ send_verification_email()   │                          │
  │                             │ (best-effort)               │                          │
  │                             │                              │                          │
  │  201 + UserSerializer       │                              │                          │
  │<────────────────────────────│                              │                          │
```

---

### Réponse type de l'API

**Requête :**
```json
POST /api/accounts/signup/
Content-Type: application/json

{
  "email": "frederik@example.com",
  "password": "MonMotDePasse123",
  "first_name": "Frederick",
  "last_name": "Toufik"
}
```

**Réponse 201 :**
```json
{
  "id": 42,
  "username": "frederik@example.com",
  "email": "frederik@example.com",
  "first_name": "Frederick",
  "last_name": "Toufik",
  "date_joined": "2026-06-30T10:00:00Z",
  "email_verified": false,
  "is_staff": false
}
```

**Réponse 400 — email déjà pris :**
```json
{
  "email": [
    "Un compte existe déjà avec cet email. Connectez-vous, ou utilisez « mot de passe oublié » pour le réinitialiser."
  ]
}
```

**Réponse 400 — mot de passe trop court :**
```json
{
  "password": [
    "Assurez-vous que ce champ comporte au moins 8 caractères."
  ]
}
```
