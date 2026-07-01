# T-26.1 — Backend : champ `role` sur `User`/`Profile` + migration

> **User Story** : US-26 — *En tant qu'enseignante, je veux créer mon compte immédiatement sans validation manuelle, afin de tester l'outil sans délai.*
> **Sprint** : Sprint 3
> **Estimation** : 2h
> **Assigné** : Frederick TOUFIK (repris d'Azeddine AMARI)
> **Statut** : Todo

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'ajouter un champ `role` sur le modèle de profil de l'utilisateur (`Profile`) afin de distinguer les enseignants (`teacher`) des étudiants (`student`). Ce champ permettra de restreindre l'accès à certaines fonctionnalités (comme la création et le suivi de classes).

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/models.py](../../../backend/accounts/models.py) | Modèle `Profile` étendant l'utilisateur Django | **OUI** |
| [backend/accounts/migrations/](../../../backend/accounts/migrations/) | Migrations de l'application `accounts` | **OUI** (générer la migration) |

---

## 3. Spécifications techniques

### 3.1 Modification du modèle `Profile`

Ajouter un champ `role` sur le modèle `Profile` dans `backend/accounts/models.py` :
- Utiliser un type `CharField` avec des choix (choices).
- Les choix possibles sont : `"student"` (Étudiant) et `"teacher"` (Enseignant).
- La valeur par défaut doit être `"student"`.
- Utiliser un `max_length=10`.
- Ajouter un `help_text` explicatif.

Exemple :
```python
class Profile(models.Model):
    class Role(models.TextChoices):
        STUDENT = "student", "Étudiant"
        TEACHER = "teacher", "Enseignant"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    # ... autres champs ...
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
        help_text="Rôle de l'utilisateur sur la plateforme."
    )
```

---

## 4. Étapes détaillées

### Étape 1 — Modifier le modèle
Ajouter le champ `role` et la classe `Role` dans `backend/accounts/models.py`.

### Étape 2 — Générer la migration
Exécuter la commande pour créer le fichier de migration :
```bash
python manage.py makemigrations accounts
```

### Étape 3 — Appliquer la migration
Exécuter la commande pour appliquer la migration en base de données :
```bash
python manage.py migrate accounts
```

---

## 5. Definition of Done

- [ ] Le champ `role` est défini sur le modèle `Profile` avec les choix et la valeur par défaut spécifiés.
- [ ] La migration correspondante est générée et appliquée sans erreur.
- [ ] Par défaut, un nouvel utilisateur créé via le processus standard (étudiant) a le rôle `student`.
- [ ] Les tests existants de l'application `accounts` s'exécutent avec succès.

---

## 6. Pièges à éviter

1. **Pas de valeur par défaut** : Si vous oubliez la valeur par défaut `"student"`, les profils existants en base lèveront des erreurs lors de l'application de la migration si Django demande une valeur pour les lignes existantes.
2. **Héritage direct de User** : Ne pas modifier directement le modèle `User` intégré de Django ; utiliser le modèle `Profile` qui lui est lié par une relation OneToOne.
