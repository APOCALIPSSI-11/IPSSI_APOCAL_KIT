# T-26.1 - Backend : champ role sur User (student/teacher) + migration

> **User Story** : US-26 - En tant qu'etudiant ou enseignant, je veux que mon role soit explicite dans le systeme afin d'activer les parcours et permissions adaptes.
> **Sprint** : Sprint 3
> **Estimation** : 2h
> **Assigne** : NGUYEN Thi Van Anh
> **Statut** : Done

---

## 1. Objectif de la tache

Ajouter la notion de role metier (`student` / `teacher`) cote backend, avec migration de base de donnees, sans casser le modele d'authentification Django existant.

---

## 2. Contexte du code actuel

Le projet utilise le modele `User` standard Django (pas de custom user model). Les donnees metier utilisateur sont deja portees par `Profile` (relation 1-1 avec `User`).

| Fichier | Role | A modifier ? |
|---|---|---|
| [backend/accounts/models.py](../../../backend/accounts/models.py) | Modele Profile associe a User | **OUI** |
| [backend/accounts/serializers.py](../../../backend/accounts/serializers.py) | Payload user renvoye au frontend | **OUI** |
| [backend/accounts/migrations/0002_profile_role.py](../../../backend/accounts/migrations/0002_profile_role.py) | Migration SQL pour le nouveau champ | **AJOUT** |

---

## 3. Specifications techniques

### 3.1 Modelisation
- Ajouter un champ `role` dans `Profile`.
- Valeurs autorisees : `student`, `teacher`.
- Valeur par defaut : `student` (compatibilite avec les comptes existants).

### 3.2 Migration
- Creer une migration `accounts` ajoutant la colonne `role` sur la table `Profile`.
- Migration non destructive (pas de suppression/renommage de colonnes existantes).

### 3.3 Exposition API
- Ajouter `role` dans `UserSerializer` pour que le frontend puisse lire le role apres login / refresh.

---

## 4. Etapes detaillees

1. Modifier `Profile` avec constantes de role + `role = models.CharField(...)`.
2. Ajouter migration `0002_profile_role.py`.
3. Mettre a jour `UserSerializer` avec `SerializerMethodField` pour retourner `profile.role`.
4. Verifier les migrations (`makemigrations --check --dry-run`).
5. Lancer les tests `accounts`.

### 4.1 Commandes migration (obligatoire)

Apres pull des changements backend, executer la migration avant tout test API:

```bash
docker compose exec backend python manage.py migrate accounts
```

Verification rapide:

```bash
docker compose exec backend python manage.py showmigrations accounts
```

Le resultat attendu doit contenir:

```text
[X] 0002_profile_role
```

Si cette migration n'est pas appliquee, l'endpoint `/api/accounts/signup/` peut echouer avec l'erreur SQL:
`column accounts_profile.role does not exist`.

---

## 5. Definition of Done

- [x] Le champ `role` existe dans le backend avec valeurs `student|teacher`.
- [x] Une migration ajoute proprement le champ en base.
- [x] Les payloads user exposes par l'API contiennent `role`.
- [x] Les tests backend accounts passent apres changement.

---

## 6. Impact sur le reste du code

### Ce que la tache impacte directement
- **Auth payload** : le frontend recoit un attribut supplementaire `role` sur l'utilisateur courant.
- **Base de donnees** : ajout d'une colonne non bloquante sur `Profile`.

### Ce que la tache n'impacte pas encore
- Aucun changement de routes frontend/backend a ce stade.
- Aucun changement des permissions runtime (on reste sur `is_staff` pour l'admin).
- Aucune rupture de compatibilite login/signup actuel.

### Dependances aval
Cette tache est une base pour :
- `T-26.2` (`/api/accounts/signup-enseignant/`),
- `T-26.3` (route frontend `/signup-enseignant`),
- `US-T1` (dashboard enseignant base sur role).
