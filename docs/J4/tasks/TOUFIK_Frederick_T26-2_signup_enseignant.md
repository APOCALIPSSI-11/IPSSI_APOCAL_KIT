# T-26.2 — Backend : endpoint `POST /api/accounts/signup-enseignant/`

> **User Story** : US-26 — *En tant qu'enseignante, je veux créer mon compte immédiatement sans validation manuelle, afin de tester l'outil sans délai.*
> **Sprint** : Sprint 3
> **Estimation** : 2h
> **Assigné** : Frederick TOUFIK
> **Statut** : Todo

---

## 1. Objectif de la tâche

Créer un endpoint `POST /api/accounts/signup-enseignant/` public qui enregistre un compte avec le rôle `teacher` sans exiger de validation manuelle ni de vérification d'email préalable. L'objectif est d'éliminer le moment de décrochage identifié sur le parcours de Mme Lefèvre (étape 2) : un enseignant qui découvre l'outil doit pouvoir démarrer immédiatement.

**Dépendance bloquante** : T-26.1 (Azeddine AMARI) doit être terminée avant de démarrer cette tâche — le champ `role` sur le modèle `User`/`Profile` doit exister en base.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/serializers.py](../../../backend/accounts/serializers.py) | Sérialiseurs d'authentification (`SignupSerializer` existant) | **OUI** (créer `TeacherSignupSerializer`) |
| [backend/accounts/views.py](../../../backend/accounts/views.py) | Vues d'authentification (`SignupView` existant) | **OUI** (créer `TeacherSignupView`) |
| [backend/accounts/urls.py](../../../backend/accounts/urls.py) | Routage HTTP des comptes | **OUI** (enregistrer la route `signup-enseignant/`) |

---

## 3. Spécifications techniques

### 3.1 Sérialiseur `TeacherSignupSerializer`

Hérite ou réutilise la logique de `SignupSerializer` avec les adaptations suivantes :
- Champs requis : `email`, `password`, `first_name` (optionnel), `last_name` (optionnel).
- `validate_email` : même logique d'unicité sur `email` et `username` que `SignupSerializer`.
- `validate_password` : délégation à `django_validate_password` (≥ 8 caractères, liste noire Django).
- `create` : après `user.save()`, assigner `profile.role = "teacher"` sur le `Profile` lié (champ ajouté par T-26.1). Appeler `get_or_create_profile(user)` puis mettre à jour le rôle.

```python
class TeacherSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name"]
        extra_kwargs = {
            "email": {"required": True, "allow_blank": False},
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate_email(self, value: str) -> str:
        # Même logique que SignupSerializer
        ...

    def validate_password(self, value: str) -> str:
        # Même logique que SignupSerializer
        ...

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")
        email = validated_data["email"]
        user = User(username=email, **validated_data)
        user.set_password(password)
        user.save()
        profile = get_or_create_profile(user)
        profile.role = "teacher"           # rôle assigné directement, sans validation
        profile.email_verified = True      # pas de vérification email requise
        profile.save(update_fields=["role", "email_verified"])
        return user
```

### 3.2 Vue `TeacherSignupView`

- `permission_classes = [AllowAny]` et `authentication_classes = []` (même raison que `SignupView` : endpoint pré-authentification, évite le bug CSRF session).
- **Pas d'envoi d'email de vérification** : `email_verified = True` est positionné à `True` directement dans le sérialiseur — le compte enseignant est opérationnel immédiatement après inscription.
- Retourne `HTTP 201 CREATED` avec les données `UserSerializer`.
- Respecter le même pattern que `SignupView` pour la cohérence de la base de code.

### 3.3 Route

```python
path("signup-enseignant/", TeacherSignupView.as_view(), name="signup-enseignant"),
```

---

## 4. Étapes détaillées

### Étape 0 — Vérifier que T-26.1 est terminée
S'assurer que le champ `role` est bien présent sur le modèle `Profile` (migration appliquée). Sans ce champ, `profile.role = "teacher"` lèvera une `AttributeError`.

### Étape 1 — Créer le sérialiseur
Dans `backend/accounts/serializers.py`, ajouter `TeacherSignupSerializer` après `SignupSerializer`. Factoriser si possible la logique commune (`validate_email`, `validate_password`) via une classe de base ou un mixin.

### Étape 2 — Créer la vue
Dans `backend/accounts/views.py`, ajouter `TeacherSignupView` après `SignupView` :
```python
class TeacherSignupView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(request=TeacherSignupSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = TeacherSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
```

### Étape 3 — Enregistrer la route
Dans `backend/accounts/urls.py`, importer et déclarer :
```python
from .views import ..., TeacherSignupView

path("signup-enseignant/", TeacherSignupView.as_view(), name="signup-enseignant"),
```

---

## 5. Definition of Done

- [ ] L'endpoint `POST /api/accounts/signup-enseignant/` est fonctionnel et accessible sans authentification.
- [ ] Le compte créé possède `profile.role = "teacher"`.
- [ ] Le compte est immédiatement opérationnel (`email_verified = True`, aucune étape manuelle requise).
- [ ] La soumission d'un email déjà pris retourne un `400 BAD REQUEST` avec message explicite.
- [ ] La soumission d'un mot de passe invalide (< 8 caractères) retourne un `400 BAD REQUEST`.
- [ ] La réponse en succès est `201 CREATED` avec les données `UserSerializer`.
- [ ] Le mot de passe est stocké haché (jamais en clair).

---

## 6. Pièges à éviter

1. **Dépendance T-26.1 non vérifiée** : Si `profile.role` n'existe pas encore en base (T-26.1 non appliquée), l'assignation lèvera une erreur silencieuse ou une `AttributeError`. Toujours confirmer que la migration T-26.1 a été appliquée (`python manage.py migrate`) avant de tester.
2. **Email de vérification non inhibé** : Ne pas appeler `send_verification_email()` pour un compte enseignant — cela ajouterait une friction manuelle que l'US-26 cherche précisément à supprimer. Positionner `email_verified = True` dans `create()` du sérialiseur.
3. **Injection de rôle par le client** : Ne jamais exposer le champ `role` dans les `fields` du sérialiseur. Le rôle `teacher` doit être assigné exclusivement côté serveur dans `create()`, pour empêcher un utilisateur ordinaire de s'attribuer des droits enseignant via le payload JSON.
