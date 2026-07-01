# T-01.1 — Modèle User Django (extension AbstractUser) + migration

> **User Story** : US-01 — *En tant que Léa, je veux m'inscrire sur la plateforme afin de pouvoir sauvegarder mes cours et mes quiz.*
> **Sprint** : Sprint 1
> **Estimation** : 1h
> **Assigné** : Azeddine AMARI
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de définir le modèle d'utilisateur personnalisé (User) pour le projet. Django fournit par défaut un modèle `User` standard, mais il est recommandé par la documentation officielle d'étendre ce modèle dès le début du projet en héritant de `AbstractUser`. Cela permet d'ajouter des champs personnalisés ultérieurement sans perturber la base de données.

*Note de conception réelle dans EduTutor IA* : L'équipe a choisi de conserver le modèle `User` standard de Django et d'y adjoindre un modèle `Profile` en relation un-à-un (OneToOneField) pour les informations métier (telles que le champ `email_verified`). Ce document décrit comment implémenter l'extension directe d'AbstractUser (approche classique recommandée) tout en documentant la solution retenue d'un profil OneToOne.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/models.py](../../../backend/accounts/models.py) | Définition des modèles de compte utilisateur | **OUI** |
| [backend/apocal/settings.py](../../../backend/apocal/settings.py) | Configuration globale de Django | **OUI** (si AbstractUser direct) |
| [backend/accounts/admin.py](../../../backend/accounts/admin.py) | Enregistrement dans l'admin Django | **OUI** |

---

## 3. Spécifications techniques

### Option 1 : Extension directe via `AbstractUser` (Recommandé par Django)

Dans `backend/accounts/models.py` :
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Ajout d'un champ personnalisé
    email_verified = models.BooleanField(
        default=False,
        help_text="L'utilisateur a-t-il validé son adresse email ?"
    )
    
    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return self.email or self.username
```

Dans `backend/apocal/settings.py` :
```python
AUTH_USER_MODEL = "accounts.User"
```

### Option 2 : Modèle Profile OneToOne (Solution appliquée pour éviter les migrations complexes)

Puisque le projet utilisait déjà le User Django classique, la solution OneToOne a été appliquée pour isoler les extensions sans réécrire la table standard.

Dans `backend/accounts/models.py` :
```python
from django.conf import settings
from django.db import models

class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Profile<{self.user.email or self.user.username}>"
```

---

## 4. Étapes détaillées (Option 2 - Profil)

### Étape 1 — Création du modèle Profile
Ajouter la classe `Profile` et la fonction `get_or_create_profile` dans [backend/accounts/models.py](../../../backend/accounts/models.py).

### Étape 2 — Génération des migrations
Générer le fichier de migration :
```bash
docker compose exec backend python manage.py makemigrations accounts
```

### Étape 3 — Application de la migration
Appliquer la migration sur la base de données PostgreSQL :
```bash
docker compose exec backend python manage.py migrate accounts
```

### Étape 4 — Enregistrement dans l'admin Django
Dans `backend/accounts/admin.py` :
```python
from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "email_verified", "created_at"]
    list_filter = ["email_verified"]
    search_fields = ["user__email", "user__username"]
```

---

## 5. Definition of Done (DoD)

- [ ] Le modèle `Profile` (ou `User` personnalisé) est défini dans `accounts/models.py`.
- [ ] Le champ `email_verified` est inclus avec une valeur par défaut à `False`.
- [ ] Le script de migration a été généré et exécuté avec succès.
- [ ] Le modèle est éditable et visible via l'admin Django `/admin/`.
- [ ] La relation de cascade `on_delete=models.CASCADE` est active (RGPD : suppression du User -> suppression du Profile).

---

## 6. Pièges à éviter

1. **Oublier les comptes existants** : Si des utilisateurs existent déjà en base sans profil, l'accès à `user.profile` lèvera une exception `DoesNotExist`. C'est pourquoi la fonction utilitaire `get_or_create_profile` est cruciale.
2. **AbstractUser trop tard** : Changer `AUTH_USER_MODEL` après avoir déjà appliqué des migrations de base de données est extrêmement complexe dans Django. Si la base est déjà initialisée, préférer l'approche OneToOne.
