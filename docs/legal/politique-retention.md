# Politique de rétention et de conservation des données - EduTutor IA

> **Document** : T-J3B-1 - Perturbation J3-bis (RGPD / SAR)
> **Périmètre** : application EduTutor IA (plateforme de génération de quiz pédagogiques)
> **Version** : 1.0 - 01/07/2026

---

## 1. Base légale du traitement (RGPD Art. 6)

Le traitement des données personnelles sur EduTutor IA repose sur trois fondements légaux distincts, selon la catégorie de donnée :

- **Consentement explicite** (Art. 6.1.a) : à l'inscription, l'utilisateur coche une case de consentement RGPD et accède aux liens vers les CGU et la politique de confidentialité avant de créer son compte (T-RGPD-02). C'est le fondement pour la collecte initiale (email, nom, prénom).
- **Exécution du contrat** (Art. 6.1.b) : la fourniture du service - génération de quiz à partir des cours importés, calcul des scores, tableau de bord de progression - nécessite le traitement des contenus soumis et des réponses de l'utilisateur ; sans ce traitement, le service ne peut être rendu.
- **Intérêt légitime** (Art. 6.1.f) : la journalisation des demandes SAR (export/suppression) dans l'audit trail (`RGPDRequestLog`) répond à l'intérêt légitime de l'éditeur à prouver sa conformité en cas de contrôle CNIL, et n'entre pas en conflit avec les droits et libertés de l'utilisateur concerné.

## 2. Durées de conservation par type de donnée

| Catégorie de données | Durée de conservation | Justification |
|---|---|---|
| Informations de compte (email, nom, prénom, rôle) | Conservées tant que le compte est actif ; suppression ou anonymisation après **2 ans d'inactivité** | Proportionnalité - au-delà, la donnée ne sert plus l'exécution du contrat |
| Cours importés par l'utilisateur (texte/PDF source) | Conservés tant que le compte est actif, **ou jusqu'à suppression manuelle** par l'utilisateur | Nécessaires à la régénération/consultation des quiz associés |
| Quiz générés et réponses des étudiants | Conservés pendant la durée de vie du compte, **ou supprimés à la demande** de l'utilisateur | Support du suivi de progression (dashboard, historique) |
| Logs de sécurité/RGPD (audit trail des demandes SAR) | **5 ans** | Prescription légale usuelle pour la preuve de conformité (traçabilité des demandes d'accès/suppression en cas de contrôle CNIL) |

## 3. Procédure de suppression effective (RGPD Art. 17 - Droit à l'oubli)

Lorsqu'un utilisateur exerce son droit à l'oubli via `DELETE /api/accounts/profile/` (après confirmation de son mot de passe) :

1. **Journalisation avant suppression** : un enregistrement `RGPDRequestLog` (`request_type="delete"`, `status="answered"`) est créé *avant* le hard delete, car il conserve l'email de l'utilisateur en texte brut plutôt qu'une clé étrangère - l'entrée d'audit doit rester lisible même après la disparition du compte.
2. **Invalidation de la session** : le token d'authentification est supprimé et la session est fermée immédiatement.
3. **Suppression physique en cascade** : le compte `User` est physiquement supprimé (`user.delete()`), ce qui entraîne la suppression en cascade (`on_delete=CASCADE`) de son `Profile`, de ses cours (`Course`), de ses quiz et questions (`Quiz`/`Question`).
4. **Exception à la suppression** : les entrées `RGPDRequestLog` (audit trail) ne sont **pas** supprimées - elles ne référencent l'utilisateur que par son email (texte) et sont conservées 5 ans (cf. section 2) pour la preuve de conformité.

Il s'agit donc d'une **suppression physique immédiate** (pas d'anonymisation différée) pour toutes les données métier, avec conservation strictement limitée de la trace d'audit à des fins probatoires.

---

*Document rédigé dans le cadre de la perturbation J3-bis (RGPD/SAR). Relecture Scrum Master / DPO d'équipe requise avant diffusion externe.*
