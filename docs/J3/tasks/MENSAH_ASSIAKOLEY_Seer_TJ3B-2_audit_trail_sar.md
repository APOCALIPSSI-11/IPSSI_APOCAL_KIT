# T-J3B-2 — Audit trail SAR complet (export loggué + statut + hash)

> **User Story** : US-J3B-2 — *Perturbation J3-bis (RGPD / SAR)*
> **Sprint** : Sprint 3
> **Estimation** : 2h
> **Assigné** : Seer MENSAH ASSIAKOLEY
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est d'enrichir le modèle d'audit trail `RGPDRequestLog` afin de logger systématiquement toutes les demandes d'accès/export de données (SAR), et d'inclure des informations détaillées telles que le statut de traitement de la demande (`received`/`processing`/`answered`) et l'empreinte SHA-256 (`file_hash`) de l'archive ou du JSON d'export généré. Cela permettra d'assurer une traçabilité totale en cas de contrôle de la CNIL.

**Dépendances** : [T-J3B-4](TOUFIK_Frederick_TJ3B-4_export_json.md) (Frederick TOUFIK) pour la structure d'export.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/models.py](../../../backend/accounts/models.py) | Déclaration du modèle `RGPDRequestLog` | **OUI** |
| [backend/accounts/views.py](../../../backend/accounts/views.py) | Vue `ExportDataView` où l'export est traité | **OUI** |
| [backend/accounts/migrations/](../../../backend/accounts/migrations/) | Fichiers de migration | **OUI** (générer la migration) |

---

## 3. Spécifications techniques

### 3.1 Modification de `RGPDRequestLog`

Ajouter les champs suivants dans `backend/accounts/models.py` :
- `status` : `CharField(max_length=15, choices=STATUS_CHOICES, default="received")`.
  - Les choix possibles sont : `"received"`, `"processing"`, `"answered"`.
- `file_hash` : `CharField(max_length=64, blank=True, null=True)` — Stocke l'empreinte SHA-256 du fichier ZIP ou du payload JSON renvoyé à l'utilisateur pour authentifier l'intégrité de la réponse SAR envoyée.

```python
class RGPDRequestLog(models.Model):
    class RequestType(models.TextChoices):
        EXPORT = "export", "Export de données"
        DELETE = "delete", "Suppression de compte"
        
    class Status(models.TextChoices):
        RECEIVED = "received", "Reçue"
        PROCESSING = "processing", "En cours"
        ANSWERED = "answered", "Répondue"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="rgpd_logs")
    request_type = models.CharField(max_length=10, choices=RequestType.choices)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.RECEIVED)
    file_hash = models.CharField(max_length=64, blank=True, null=True, help_text="SHA-256 du document exporté.")
    created_at = models.DateTimeField(auto_now_add=True)
```

### 3.2 Journalisation dans la vue `ExportDataView`

Dans la méthode `get()` de `ExportDataView` (après génération de l'export ZIP ou JSON) :
- Créer un enregistrement `RGPDRequestLog` avec le `request_type = "export"`.
- Calculer le hash SHA-256 du contenu de l'export.
- Définir le `status` à `"answered"`.
- Enregistrer le hash dans le champ `file_hash`.

```python
import hashlib

# Exemple de calcul de SHA-256 sur le payload ou fichier généré
file_hash = hashlib.sha256(content_bytes).hexdigest()

RGPDRequestLog.objects.create(
    user=user,
    request_type=RGPDRequestLog.RequestType.EXPORT,
    status=RGPDRequestLog.Status.ANSWERED,
    file_hash=file_hash
)
```

---

## 4. Étapes détaillées

### Étape 1 — Modifier le modèle `RGPDRequestLog`
Ajouter les champs et les choix dans `backend/accounts/models.py`.

### Étape 2 — Créer et appliquer la migration
```bash
python manage.py makemigrations accounts
python manage.py migrate accounts
```

### Étape 3 — Intégrer le logging d'export dans la vue
Éditer `backend/accounts/views.py` pour ajouter l'écriture du log et le calcul du hash SHA-256 sur les données binaires ou textuelles d'export.

---

## 5. Definition of Done

- [x] Les nouveaux champs `status` et `file_hash` sont ajoutés avec succès en base de données.
- [x] Chaque export de données génère un log d'audit dans `RGPDRequestLog` avec `request_type = 'export'` et `status = 'answered'`.
- [x] Le champ `file_hash` contient l'empreinte SHA-256 correcte de l'export généré.
- [x] Les logs d'audit sont strictement isolés par utilisateur.

---

## 6. Pièges à éviter

1. **Pas d'isolation utilisateur** : Ne jamais logger ou associer un log à un autre utilisateur que celui authentifié (`request.user`).
2. **Calcul de hash erroné** : S'assurer de calculer le hash sur la donnée brute finale envoyée à l'utilisateur (le ZIP ou le flux JSON sérialisé), et de le décoder en chaîne hexadécimale de 64 caractères pour éviter les débordements de taille de champ.
