# T-J3B-1 — Politique de rétention RGPD

> **User Story** : US-J3B-1 — *Perturbation J3-bis (RGPD / SAR)*
> **Sprint** : Sprint 3
> **Estimation** : 1.5h
> **Assigné** : Hugo HAVET
> **Statut** : Done

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de rédiger la politique officielle de rétention et de conservation des données de la plateforme EduTutor IA. Ce document d'une page au maximum doit définir clairement la base légale de traitement, la durée de conservation pour chaque catégorie de données, et la procédure de suppression effective (Droit à l'oubli).

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [docs/J3/politique-retention.md](../../politique-retention.md) | Document de politique de rétention | **OUI** [NEW] |

---

## 3. Spécifications techniques et rédactionnelles

Le document doit comporter au moins les 3 sections suivantes :
1. **Base légale du traitement (RGPD Art. 6)** : Explication des fondements légaux (consentement explicite pour l'inscription, intérêt légitime pour l'amélioration du service, exécution du contrat).
2. **Tableau des durées de conservation par type de données** :
   - Informations de compte (email, nom, prénom) : conservation tant que le compte est actif ; suppression ou anonymisation après 2 ans d'inactivité.
   - Cours importés par les utilisateurs : conservation tant que le compte est actif ou jusqu'à suppression manuelle.
   - Quiz générés et réponses des étudiants : conservés pendant la durée de vie du compte ou supprimés à la demande.
   - Logs de sécurité/RGPD (audit trail) : conservés 5 ans (prescription légale pour la preuve de conformité).
3. **Procédure de suppression (RGPD Art. 17)** : Description des étapes techniques lors de l'appel à la suppression de compte (anonymisation ou suppression physique en base de données).

---

## 4. Étapes détaillées

### Étape 1 — Créer le fichier Markdown
Créer le fichier [docs/J3/politique-retention.md](../../politique-retention.md).

### Étape 2 — Rédiger le contenu
Écrire les sections selon les critères RGPD officiels. Utiliser un ton professionnel, juridique mais accessible.

### Étape 3 — Soumettre pour validation
Présenter le document au Scrum Master / DPO de l'équipe pour relecture.

---

## 5. Definition of Done

- [x] Le fichier `docs/J3/politique-retention.md` existe et contient les trois sections obligatoires.
- [x] Le contenu est clair, synthétique (tient sur 1 page) et rédigé en français.
- [x] La base légale de l'article 6 du RGPD est explicitement mentionnée.
- [x] La procédure d'exercice du droit à l'oubli (Art. 17) est documentée.
- [ ] Le document est validé par le reste de l'équipe.
