# T-J3B-4 — Conformité format endpoint export (JSON structuré)

> **User Story** : US-J3B-4 — *Perturbation J3-bis (RGPD / SAR)*
> **Sprint** : Sprint 3
> **Estimation** : 1.5h
> **Assigné** : Frederick TOUFIK
> **Statut** : Todo

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'adapter l'endpoint d'export des données personnelles (`GET /api/accounts/export/`) pour qu'il puisse retourner une réponse JSON structurée directe, satisfaisant ainsi le critère d'acceptation **CA-J3B-1** de la perturbation J3-bis (RGPD Art. 15 droit d'accès).
Actuellement, l'endpoint renvoie uniquement un fichier binaire ZIP. L'adaptation doit permettre de renvoyer du JSON structuré si demandé (par exemple via un paramètre de requête `?format=json`), tout en conservant le fonctionnement actuel (téléchargement du ZIP) par défaut pour éviter de casser le frontend actuel.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/views.py](../../../backend/accounts/views.py) | Contient `ExportDataView` gérant l'export des données | **OUI** |

---

## 3. Spécifications techniques

### 3.1 Modification de `ExportDataView`

Dans la méthode `get()` de `ExportDataView` dans `backend/accounts/views.py` :
- Détecter le paramètre optionnel `format = request.query_params.get("format")`.
- Si `format == "json"`, au lieu d'assembler et de renvoyer le ZIP en réponse binaire, renvoyer directement un objet JSON structuré (dictionnaire contenant les catégories requises).
- Données structurées à renvoyer en JSON :
  - Profil utilisateur (`email`, `first_name`, `last_name`, `role`).
  - Quizz créés (liste des quiz avec titre, date, questions).
  - Réponses apportées (historique des réponses).
  - Logs de sécurité/RGPD (logs de l'utilisateur concerné).
- Si le paramètre `format` n'est pas fourni ou vaut autre chose, conserver le comportement existant (génération et envoi du fichier ZIP).

---

## 4. Étapes détaillées

### Étape 1 — Modifier `ExportDataView`
Ouvrir [backend/accounts/views.py](../../../backend/accounts/views.py) et modifier la classe `ExportDataView`.

Exemple de structure de code à implémenter :
```python
class ExportDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Récupération des données de l'utilisateur
        data = {
            "user": {
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.profile.role if hasattr(user, "profile") else "student"
            },
            "quizzes": list(Quiz.objects.filter(user=user).values()),
            "answers": list(UserAnswer.objects.filter(user=user).values()),
            "logs": list(RGPDRequestLog.objects.filter(user=user).values())
        }

        # Détection du format souhaité
        format_param = request.query_params.get("format", "").lower()
        if format_param == "json":
            return Response(data, status=status.HTTP_200_OK)
            
        # Comportement par défaut : génération du fichier ZIP
        # (Conserver la logique existante d'assemblage du ZIP et de retour de FileResponse)
        ...
```

### Étape 2 — Valider l'isolement utilisateur (Sécurité CNIL)
S'assurer qu'aucun appel de type `Model.objects.all()` n'est fait sans le filtre `user=request.user` ou `user=user`. C'est un point critique de sécurité RGPD.

---

## 5. Definition of Done

- [ ] L'appel `GET /api/accounts/export/?format=json` renvoie une réponse HTTP 200 avec le payload JSON structuré contenant les catégories de données de l'utilisateur.
- [ ] L'appel `GET /api/accounts/export/` sans paramètre continue de renvoyer le fichier ZIP sans erreur.
- [ ] L'isolation des données est garantie : un utilisateur authentifié ne peut exporter que ses propres données.
- [ ] Les données de "logs" d'audit de l'utilisateur sont incluses dans la structure JSON.

---

## 6. Pièges à éviter

1. **Brèche de sécurité (Leak de données)** : Ne jamais omettre le filtre par utilisateur connecté (`request.user`). Un pirate pourrait tenter d'appeler l'endpoint pour récupérer les données d'autres utilisateurs.
2. **Casser le frontend** : Le frontend actuel de l'application s'attend à recevoir un fichier binaire (ZIP) lors du clic sur le bouton d'export. La modification doit rester rétrocompatible et ne renvoyer du JSON que si le paramètre `?format=json` est explicitement fourni.
