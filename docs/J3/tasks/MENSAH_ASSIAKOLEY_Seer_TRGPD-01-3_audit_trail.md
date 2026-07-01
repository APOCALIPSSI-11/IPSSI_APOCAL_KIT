# TRGPD-01.3 — Journalisation de conformité RGPD (Audit Trail)

> **User Story** : US-RGPD-01 — *En tant que DPO (Data Protection Officer) ou administrateur d'EduTutor IA, je veux disposer d'un historique inaltérable des demandes d'accès (SAR) et d'effacement de données, afin de prouver la conformité RGPD de l'application en cas d'audit.*
> **Sprint** : Sprint 2
> **Estimation** : 2h
> **Assigné** : Seer MENSAH-ASSIAKOLEY
> **Statut** : In Progress (partiel — voir §5, log "export" bloqué par T-RGPD-01.1 non fait)

---

## 1. Objectif de la tâche

Mettre en place un mécanisme d'**Audit Trail** pour journaliser chaque requête d'export de données (droit d'accès - Art. 15) et chaque demande de suppression de compte (droit à l'oubli - Art. 17). Cette journalisation est une exigence forte pour prouver la conformité légale et le respect des délais (consulter les données dans un délai de 30 jours maximum).

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/accounts/models.py](../../../backend/accounts/models.py) | Modèles de données de comptes | **OUI** — ajouter le modèle `RGPDRequestLog` |
| [backend/accounts/views.py](../../../backend/accounts/views.py) | Endpoints d'export et de suppression | **OUI** — écrire les logs en base |
| [backend/accounts/admin.py](../../../backend/accounts/admin.py) | Administration Django | **OUI** — exposer l'Audit Trail pour l'admin |

---

## 3. Spécifications techniques

### 3.1 Modèle `RGPDRequestLog`
Créer un modèle Django représentant les logs de requêtes SAR RGPD :
* `user_email` : `EmailField` (on stocke l'email en texte, car si l'utilisateur supprime son compte, la FK vers `User` sera nulle ou supprimée, or nous devons conserver le log d'audit de suppression !).
* `request_type` : `CharField` avec choix `"export"` ou `"delete"`.
* `timestamp` : `DateTimeField` automatique (`auto_now_add=True`).
* `ip_address` : `GenericIPAddressField` (facultatif, pour tracer l'origine de la demande).

### 3.2 Intégration
* Lors du traitement de l'export de données dans `ExportUserDataView`, créer un log d'audit : `RGPDRequestLog.objects.create(user_email=request.user.email, request_type="export")`.
* Lors de la suppression de compte dans `ProfileView.delete`, créer également le log d'audit *avant* d'effacer définitivement l'utilisateur : `RGPDRequestLog.objects.create(user_email=request.user.email, request_type="delete")`.

---

## 4. Étapes détaillées

1. Ouvrir `backend/accounts/models.py`.
2. Déclarer le modèle `RGPDRequestLog` avec ses contraintes (champs en lecture seule dans l'admin pour empêcher toute altération des logs).
3. Générer et appliquer les migrations Django :
   ```bash
   docker compose exec backend python manage.py makemigrations accounts
   docker compose exec backend python manage.py migrate accounts
   ```
4. Modifier `backend/accounts/views.py` :
   - Dans la méthode `get` de `ExportUserDataView`, ajouter l'enregistrement du log.
   - Dans la méthode `delete` de `ProfileView` (ou de la vue de suppression correspondante), enregistrer le log juste avant d'appeler `request.user.delete()`.
5. Enregistrer le modèle `RGPDRequestLog` dans `backend/accounts/admin.py` en mode lecture seule (`readonly_fields`).

---

## 5. Definition of Done

- [x] Modèle `RGPDRequestLog` créé et migrations appliquées (`accounts/migrations/0002_rgpdrequestlog.py`).
- [ ] Les demandes d'exportation de données créent une entrée avec type `"export"`. **BLOQUÉ** : `ExportUserDataView` n'existe pas encore (dépendance T-RGPD-01.1, Frederick TOUFIK, statut réel "To Do" au 01/07). TODO explicite laissé dans `views.py` juste après `ProfileView` pour brancher le log dès que la vue existera.
- [x] Les demandes de suppression de compte créent une entrée avec type `"delete"` (et l'email de l'utilisateur supprimé reste bien lisible dans la table d'audit) — branché dans `ProfileView.delete`, testé (`test_account_deletion_creates_rgpd_audit_log`).
- [x] L'Audit Trail est visible dans l'admin Django en lecture seule (`RGPDRequestLogAdmin`, ajout/modification/suppression désactivés).

---

## 🤖 Prompt pour l'IA de codage (Claude Code / Antigravity)

Copiez-collez le prompt suivant dans votre agent IA de codage pour réaliser la tâche de manière autonome :

```text
Tu es Antigravity, un agent de codage expert Django/Python. Ta tâche est d'implémenter le mécanisme d'Audit Trail RGPD (tâche TRGPD-01.3).

Voici les instructions à suivre :
1. Ouvre backend/accounts/models.py. Crée un modèle RGPDRequestLog avec les spécifications suivantes :
   - user_email = models.EmailField(help_text="Email de l'utilisateur ayant formulé la demande")
   - request_type = models.CharField(max_length=10, choices=[("export", "Export de données"), ("delete", "Suppression de compte")])
   - timestamp = models.DateTimeField(auto_now_add=True)
   - ip_address = models.GenericIPAddressField(null=True, blank=True)
   - Meta : ordering = ['-timestamp'], verbose_name = "Log Audit RGPD", verbose_name_plural = "Logs Audit RGPD"
2. Lance 'docker exec apocalipssi-2026-backend python manage.py makemigrations accounts' puis 'docker exec apocalipssi-2026-backend python manage.py migrate accounts' (ou commandes Windows équivalentes) pour appliquer les changements en DB.
3. Ouvre backend/accounts/views.py.
   - Importe le modèle RGPDRequestLog.
   - Dans ExportUserDataView.get, ajoute : RGPDRequestLog.objects.create(user_email=request.user.email, request_type="export", ip_address=request.META.get('REMOTE_ADDR'))
   - Dans ProfileView.delete (ou la vue gérant la suppression définitive du compte, recherche 'delete' dans les views de accounts), insère l'enregistrement du log : RGPDRequestLog.objects.create(user_email=request.user.email, request_type="delete", ip_address=request.META.get('REMOTE_ADDR')) juste avant d'appeler request.user.delete() ou de supprimer l'utilisateur.
4. Ouvre backend/accounts/admin.py. Enregistre le modèle RGPDRequestLog pour l'admin Django. Configure list_display = ["user_email", "request_type", "timestamp", "ip_address"]. Rends tous les champs read-only en définissant readonly_fields = ["user_email", "request_type", "timestamp", "ip_address"] pour garantir l'inaltérabilité de l'audit.
5. Écris un test dans backend/accounts/tests.py pour vérifier qu'un export de données crée bien un enregistrement RGPDRequestLog.
```
