# ADR-0001 — Sérialiseur DRF et endpoint `POST /api/accounts/signup/`

**Tâche** : T-01.2 · **US** : US-01 · **Auteur** : Frederick TOUFIK  
**Date** : 2026-06-30

---

## Statut

Accepted

---

## Contexte et problème

L'application a besoin d'un mécanisme d'inscription. L'utilisateur doit pouvoir créer un compte en fournissant son email et un mot de passe. L'email sert d'identifiant unique (il n'y a pas de champ « pseudo » visible). Deux contraintes de validation sont imposées :

1. L'email doit être unique dans le système.
2. Le mot de passe doit faire au moins 8 caractères.

La question est : **comment implémenter la validation et la création du compte de façon fiable, sans dupliquer la logique de sécurité que Django fournit déjà ?**

---

## Decision Drivers

- Cohérence avec DRF : les erreurs de validation doivent retourner du JSON structuré par champ.
- Sécurité : le mot de passe ne doit jamais circuler en clair ni être stocké tel quel.
- Maintenabilité : éviter de ré-écrire ce que Django fournit nativement (validateurs de mot de passe, hachage).
- Simplicité : le modèle User standard de Django doit suffire sans customisation complexe.

---

## Options considérées

### Option A — Validation entièrement dans la vue

Écrire la logique de validation directement dans `SignupView.post()` : vérifier l'unicité, la longueur du mot de passe, puis créer l'utilisateur.

**Avantages :**
- Code concentré en un seul endroit.

**Inconvénients :**
- La vue grossit et mélange deux responsabilités (HTTP et métier).
- Impossible de réutiliser la validation dans un autre contexte (tests unitaires, CLI, etc.).
- Format d'erreur JSON à construire manuellement.

**Rejeté** : viole le principe de séparation des responsabilités et augmente la dette technique.

---

### Option B — `Serializer` simple avec validation manuelle

Utiliser `serializers.Serializer` (non lié à un modèle) et réécrire toutes les vérifications à la main : regex d'email, longueur du mot de passe, unicité.

**Avantages :**
- Contrôle total sur chaque règle.

**Inconvénients :**
- Duplication de logique déjà présente dans `django.contrib.auth.password_validation`.
- Risque d'oublier des cas (mots de passe trop simples, trop numériques, trop courants).
- La méthode `create()` doit être entièrement écrite à la main.

**Rejeté** : Django possède déjà des validateurs configurables via `AUTH_PASSWORD_VALIDATORS` ; les réécrire introduit un risque de régression sécurité.

---

### Option C — `ModelSerializer` + délégation aux validateurs Django *(choisi)*

Utiliser `serializers.ModelSerializer` lié au modèle `User`, avec :
- Un champ `password` en `write_only` avec `min_length=8`.
- Une méthode `validate_password` qui délègue à `django_validate_password`.
- Une méthode `validate_email` qui normalise (strip + lower) et vérifie l'unicité sur `email` **et** `username`.
- Une méthode `create` qui appelle `user.set_password()` pour hasher le mot de passe.

**Avantages :**
- `ModelSerializer` génère les champs automatiquement depuis le modèle : moins de code.
- `django_validate_password` applique tous les validateurs configurés (`AUTH_PASSWORD_VALIDATORS`) : longueur, mots courants, séquences numériques.
- `user.set_password()` garantit le hachage PBKDF2-SHA256 ; le mot de passe en clair n'est jamais persisté.
- Les erreurs de validation retournent du JSON structuré par champ automatiquement.

**Inconvénients :**
- L'architecture `username = email` oblige à vérifier l'unicité sur deux champs (`email` et `username`), légèrement plus verbeux.
- Si le projet migre vers un `AbstractUser` avec `USERNAME_FIELD = 'email'`, ce `create()` devra être adapté.

---

## Décision

**Nous retenons l'Option C** : `ModelSerializer` + délégation aux validateurs Django.

Implémentation dans `backend/accounts/serializers.py` :

```python
class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name"]
        extra_kwargs = {
            "email": {"required": True, "allow_blank": False},
        }

    def validate_email(self, value: str) -> str:
        value = value.strip().lower()
        if (
            User.objects.filter(email__iexact=value).exists()
            or User.objects.filter(username__iexact=value).exists()
        ):
            raise serializers.ValidationError(
                "Un compte existe déjà avec cet email."
            )
        return value

    def validate_password(self, value: str) -> str:
        try:
            django_validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")
        email = validated_data["email"]
        user = User(username=email, **validated_data)
        user.set_password(password)
        user.save()
        get_or_create_profile(user)
        return user
```

La vue `SignupView` dans `backend/accounts/views.py` expose l'endpoint :

```python
class SignupView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []     # évite le contrôle CSRF session sur endpoint public

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
```

La route est enregistrée dans `backend/accounts/urls.py` :

```python
path("signup/", SignupView.as_view(), name="signup"),
```

L'URL finale est `POST /api/accounts/signup/` (préfixe `api/accounts/` dans `apocal/urls.py`).

---

## Conséquences

### Positives

- La validation du mot de passe est centralisée dans `AUTH_PASSWORD_VALIDATORS` : ajouter ou modifier une règle ne touche que `settings.py`.
- `write_only=True` sur le champ `password` garantit qu'il n'apparaît jamais dans une réponse JSON, même en cas de bug dans la vue.
- `authentication_classes = []` sur la vue empêche le bug CSRF subtil lié à la `SessionAuthentication` de DRF quand un cookie de session résiduel est présent sans token CSRF.
- Le code de la vue reste court (5 lignes utiles) grâce à `raise_exception=True`.

### Négatives

- La double vérification `email__iexact` + `username__iexact` est une contrainte imposée par le choix `username = email` du projet. Si ce choix change, `validate_email` devra être mis à jour.
- `django_validate_password` ne prend pas le `user` en paramètre dans ce contexte (l'utilisateur n'existe pas encore), donc le validateur `UserAttributeSimilarityValidator` ne peut pas s'appliquer à l'inscription.

### Neutres

- L'endpoint retourne `201 Created` avec le `UserSerializer` (lecture seule), conforme à la sémantique REST.
- L'envoi de l'email de validation est déclenché par la vue en best-effort (ne bloque pas la création du compte).

---

## Liens

- Code : `backend/accounts/serializers.py` (lignes 41–87), `backend/accounts/views.py` (lignes 44–72)
- Modèle associé : `backend/accounts/models.py` — `Profile` + `get_or_create_profile`
- ADR connexe : `0002-endpoint-post-courses-validation-texte.md` (même pattern de validation par champ)
