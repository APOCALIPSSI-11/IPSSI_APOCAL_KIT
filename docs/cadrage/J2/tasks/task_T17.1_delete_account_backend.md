# T-17.1 — Backend `ProfileView.delete` : suppression définitive (RGPD)

> **User Story** : US-17 — *En tant que Léa, je veux pouvoir supprimer définitivement mon compte et toutes mes données associées afin de faire valoir mon droit à l'oubli.*
> **Sprint** : Sprint 1
> **Estimation** : 1h
> **Assigné** : Frederick TOUFIK
> **Statut** : Done

---

## 1. Objectif de la tâche

Mettre en œuvre la suppression définitive du compte de l'utilisateur (droit à l'oubli RGPD). La tâche consiste à implémenter la méthode `delete` de la vue de profil (`ProfileView`) pour effectuer un nettoyage complet (hard delete) de l'utilisateur et de toutes ses données associées (profil, cours importés, tentatives de quiz) après validation de son mot de passe actuel.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/views.py](../../../../backend/accounts/views.py) | Vues de profil et gestion de compte | **OUI** |
| [backend/accounts/serializers.py](../../../../backend/accounts/serializers.py) | Sérialiseurs DRF | **OUI** (créer `DeleteAccountSerializer`) |

---

## 3. Spécifications techniques

### 3.1 Validation du mot de passe (`DeleteAccountSerializer`)
Pour s'assurer que la suppression est initiée par le véritable propriétaire du compte, l'utilisateur doit soumettre son mot de passe actuel.
Le sérialiseur doit :
- Valider la clé `password`.
- Vérifier si `user.check_password(password)` est vrai. Si non, lever un `ValidationError` ("Mot de passe incorrect").

```python
class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user
        if not user.check_password(attrs["password"]):
            raise serializers.ValidationError({"password": "Le mot de passe saisi est incorrect."})
        return attrs
```

### 3.2 Processus de suppression de compte
Dans la méthode `delete` de `ProfileView` :
1. Valider le mot de passe actuel via `DeleteAccountSerializer`.
2. Supprimer tous les jetons DRF de l'utilisateur (`Token.objects.filter(user=user).delete()`) pour révoquer immédiatement ses sessions d'API.
3. Déconnecter l'utilisateur de sa session de navigation Django (`django_logout(request)`).
4. Appeler `user.delete()`. Grâce aux relations de clé étrangère configurées avec `on_delete=models.CASCADE` (sur `Profile`, `Course`, et `Quiz`), Django supprime automatiquement l'ensemble des données associées en cascade.
5. Retourner un code statut `204 NO CONTENT`.

---

## 4. Étapes détaillées

### Étape 1 — Définir le sérialiseur
Ajouter `DeleteAccountSerializer` dans `backend/accounts/serializers.py`.

### Étape 2 — Implémenter la vue de suppression
Dans [backend/accounts/views.py](../../../../backend/accounts/views.py), implémenter la méthode `delete(self, request)` de la classe `ProfileView`.

---

## 5. Definition of Done

- [ ] L'endpoint `DELETE /api/accounts/profile/` accepte les demandes de suppression.
- [ ] La soumission d'un mot de passe incorrect retourne un code `400 BAD REQUEST`.
- [ ] La soumission d'un mot de passe correct détruit le compte de l'utilisateur et l'ensemble de ses données liées (profil, cours, quiz).
- [ ] Le token d'authentification de l'utilisateur est révoqué.
- [ ] L'endpoint retourne un code `204 NO CONTENT`.

---

## 6. Pièges à éviter

1. **Suppression non confirmée** : Ne jamais supprimer un compte uniquement sur simple appel d'URL GET ou DELETE sans validation du mot de passe.
2. **Cascade d'intégrité manquante** : S'assurer que tous les modèles pointant vers User (comme `Course` ou `Quiz`) sont paramétrés avec `on_delete=models.CASCADE` ou `SET_NULL` si des traces anonymisées doivent subsister (ce qui n'est pas le cas ici pour le droit à l'oubli).
3. **Session fantôme** : Toujours appeler `django_logout(request)` pour purger les cookies de session côté serveur, évitant ainsi les reliquats de connexion.
