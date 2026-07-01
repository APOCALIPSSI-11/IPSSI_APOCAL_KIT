# T-J3B-3 — Lettre de réponse SAR (Hugo Petit)

> **User Story** : US-J3B-3 — *Perturbation J3-bis (RGPD / SAR)*
> **Sprint** : Sprint 3
> **Estimation** : 1h
> **Assigné** : Hugo HAVET
> **Statut** : Todo

---

## 1. Objectif de la tâche

L'objectif de cette tâche est de rédiger la lettre de réponse officielle au Subject Access Request (SAR - droit d'accès aux données) de l'utilisateur fictif **Hugo Petit** (`hugo.petit@test.local`). Cette lettre doit respecter les formalités légales de communication avec un citoyen exerçant ses droits RGPD et fournir les éléments techniques requis pour valider l'intégrité de son export (lien et hash).

**Dépendances** : [T-J3B-2](MENSAH_ASSIAKOLEY_Seer_TJ3B-2_audit_trail_sar.md) (Seer MENSAH ASSIAKOLEY) pour obtenir le hash SHA-256 à mentionner dans la lettre.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [docs/J3/lettre-sar-hugo-petit.md](../../lettre-sar-hugo-petit.md) | Lettre de réponse à l'utilisateur Hugo Petit | **OUI** [NEW] |

---

## 3. Spécifications techniques et rédactionnelles

La lettre de réponse doit impérativement contenir les éléments suivants :
1. **Accusé de réception** de sa demande de droit d'accès (Art. 15 du RGPD).
2. **Lien de téléchargement sécurisé** (fictif) pour récupérer les données.
3. **Explication des données exportées** : Catégories incluses (profil, quiz, réponses, logs).
4. **Calcul d'intégrité (Hash SHA-256)** : Intégrer un placeholder clair pour le hash SHA-256 de son archive (qui est calculé en base par la tâche `T-J3B-2`).
5. **Rappel des droits de la personne concernée** : Droit de rectification (Art. 16), droit à l'effacement (Art. 17), droit à la limitation du traitement (Art. 18), droit à la portabilité (Art. 20).
6. **Coordonnées de contact du DPO fictif** de la plateforme EduTutor IA.

---

## 4. Étapes détaillées

### Étape 1 — Créer le fichier Markdown
Créer le fichier [docs/J3/lettre-sar-hugo-petit.md](../../lettre-sar-hugo-petit.md).

### Étape 2 — Rédiger le courrier
Rédiger la lettre en français, avec une mise en page formelle et un ton professionnel.

### Étape 3 — Renseigner le hash et valider
Dès que l'implémentation de `T-J3B-2` est finalisée, récupérer un exemple de hash ou documenter comment le hash réel est lié à la réponse.

---

## 5. Definition of Done

- [ ] La lettre est rédigée dans le fichier `docs/J3/lettre-sar-hugo-petit.md`.
- [ ] Le texte contient toutes les mentions obligatoires listées dans les spécifications.
- [ ] Le format d'intégrité SHA-256 est clairement documenté et mis en valeur.
- [ ] Le document est validé par le Scrum Master / PO.
