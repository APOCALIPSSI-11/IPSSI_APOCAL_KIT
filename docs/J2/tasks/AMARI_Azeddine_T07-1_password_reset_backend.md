# T-07.1 — Backend `PasswordReset` (demande et confirmation) + tokens sécurisés

> **User Story** : US-07 — *En tant que Léa, je veux réinitialiser mon mot de passe si je l'ai oublié afin de pouvoir me reconnecter à mon compte.*
> **Sprint** : Sprint 1
> **Estimation** : 2h
> **Assigné** : Azeddine AMARI
> **Statut** : Done

---

## 1. Objectif de la tâche

Créer les endpoints backend permettant à un utilisateur ayant perdu son mot de passe de le réinitialiser de manière sécurisée en recevant un lien par email.
- **Endpoint 1** (`POST /api/accounts/password-reset/`) : Demander une réinitialisation en fournissant l'email.
- **Endpoint 2** (`POST /api/accounts/password-reset/confirm/`) : Confirmer et définir le nouveau mot de passe à l'aide d'un jeton temporaire à usage unique.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/views.py](../../../backend/accounts/views.py) | Contrôleurs de requêtes HTTP | **OUI** |
| [backend/accounts/serializers.py](../../../backend/accounts/serializers.py) | Validation des structures JSON | **OUI** |
| [backend/accounts/tokens.py](../../../backend/accounts/tokens.py) | Génération et lecture de tokens signés | **OUI** (déjà existant) |
| [backend/accounts/emails.py](../../../backend/accounts/emails.py) | Service d'envoi de mails par SMTP | Non (déjà existant) |

---

## 3. Spécifications techniques

### 3.1 Sécurisation contre l'énumération de comptes
Pour l'endpoint de demande (`PasswordResetRequestView`), l'API doit renvoyer la **même réponse de succès générique** que l'e-mail saisi existe en base de données ou non :
*« Si un compte existe pour cet email, un lien de réinitialisation vient d'être envoyé. »*
Cela empêche les attaquants de deviner si un utilisateur possède ou non un compte sur le service.

### 3.2 Utilisation de tokens à usage unique
Django fournit un mécanisme natif de génération de jeton de reset : `django.contrib.auth.tokens.default_token_generator`.
Le jeton de confirmation transmis dans le lien se compose de :
- L'identifiant de l'utilisateur codé en base64 (`uid`).
- Un jeton cryptographique (`token`) lié au mot de passe actuel de l'utilisateur. Dès que le mot de passe est modifié, le token devient instantanément invalide (garantie d'usage unique).

### 3.3 Confirmation du mot de passe
L'endpoint de confirmation (`PasswordResetConfirmView`) doit :
1. Décoder `uid` pour retrouver l'utilisateur.
2. Vérifier la validité du `token` pour cet utilisateur spécifique.
3. Si le token est valide, valider la robustesse du nouveau mot de passe (`new_password`), hacher le nouveau mot de passe et sauvegarder l'utilisateur.

---

## 4. Étapes détaillées

### Étape 1 — Définir les sérialiseurs
Dans `backend/accounts/serializers.py` :
```python
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
```

### Étape 2 — Implémenter la vue de demande
Dans `backend/accounts/views.py`, ajouter la classe `PasswordResetRequestView`. Récupérer l'utilisateur correspondant à l'email fourni (insensible à la casse), générer le jeton et envoyer l'e-mail (en cas d'erreur SMTP, logger l'erreur mais ne pas faire échouer l'API).

### Étape 3 — Implémenter la vue de confirmation
Dans `backend/accounts/views.py`, ajouter la classe `PasswordResetConfirmView`. Utiliser une fonction utilitaire pour décoder l'uid et valider le token. Si valide, exécuter `user.set_password` et sauvegarder.

---

## 5. Definition of Done

- [ ] L'endpoint de demande `/api/accounts/password-reset/` renvoie un statut `200 OK` contenant le message anti-énumération.
- [ ] L'e-mail de réinitialisation est envoyé (et tracé dans la console en développement).
- [ ] L'endpoint `/api/accounts/password-reset/confirm/` valide correctement le token.
- [ ] La définition du nouveau mot de passe réinitialise l'accès et invalide immédiatement le token de reset utilisé.

---

## 6. Pièges à éviter

1. **Révélation d'informations** : Ne jamais retourner un code d'erreur 404 de type `"Aucun utilisateur trouvé avec cet e-mail"` sur l'endpoint de demande.
2. **Durée de vie des tokens** : Configurer une durée de vie appropriée des jetons de réinitialisation dans `settings.py` (ex: `PASSWORD_RESET_TIMEOUT = 3600` pour 1 heure).
3. **Usage unique contourné** : Ne pas utiliser de signature de token basée sur des données statiques de l'utilisateur (comme son identifiant seul). Le token doit inclure le timestamp du dernier mot de passe ou de la dernière connexion pour expirer automatiquement dès que le mot de passe est mis à jour.
