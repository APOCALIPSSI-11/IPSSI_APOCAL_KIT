# Déclaration d'accessibilité — EduTutor IA

> **Équipe 11 · EduTutor IA** · Perturbation J4 — volet **Accessibilité** (US-J4-08)
> **Binôme accessibilité (Van Anh & Seer)** : Thi Van Anh NGUYEN + Seer MENSAH ASSIAKOLEY
> **Statut** : **brouillon** (à publier en Release 3, après exécution de l'audit et des corrections)
> **Fondé sur** : [audit-rgaa-final.md](audit-rgaa-final.md) · modèle officiel de déclaration RGAA 4.1

---

## Déclaration d'accessibilité

**[Nom de l'entité responsable]** s'engage à rendre son service **EduTutor IA** accessible, conformément à l'article 47 de la loi n° 2005-102 du 11 février 2005.

Cette déclaration d'accessibilité s'applique à **l'application web EduTutor IA** (`https://edututor.[domaine]`).

### État de conformité

EduTutor IA est **non conforme** (état baseline au 02/07/2026) car un nombre significatif de critères du RGAA ne sont pas encore respectés. La mise en conformité est **planifiée en Release 3** ; la cible de premier déploiement est **partiellement conforme (≥ 85 %)** avec **zéro anomalie bloquante**.

> *À la publication (Release 3), remplacer par le résultat du contre-audit : « partiellement conforme » ou « totalement conforme » + taux.*

### Résultats des tests

L'audit de conformité réalisé en interne (méthode 2 passes : automatique **axe-core / Lighthouse / WAVE** + manuelle **clavier / NVDA / zoom 200 % / contrastes**) révèle un **taux de conformité baseline de ≈ 63 %** au référentiel **RGAA 4.1**.

- Détail : [audit-rgaa-final.md](audit-rgaa-final.md) — 14 anomalies (3 bloquantes, 9 majeures, 2 mineures).

### Contenus non accessibles

**Non-conformités connues** (baseline, en cours de correction — cf. audit) :

- Navigation clavier incomplète sur le passage de quiz (QCM) — *US-J4-06*.
- Contenu dynamique (génération de quiz) non annoncé aux lecteurs d'écran — *US-J4-06*.
- Champs de formulaire sans étiquette associée et messages d'erreur non reliés — *US-J4-06*.
- Contrastes insuffisants sur le thème sombre ; information portée par la couleur seule — *US-J4-07*.
- Focus clavier peu visible, absence de lien d'évitement, langue de page non déclarée — *US-J4-06*.

**Dérogations pour charge disproportionnée** : néant à ce stade.

**Contenus non soumis à l'obligation d'accessibilité** : néant.

### Établissement de cette déclaration

Cette déclaration a été établie le **02/07/2026** (baseline).

Technologies utilisées : HTML5, CSS3, JavaScript (React), avec API back-end Django.

Agents utilisateurs / technologies d'assistance utilisés pour les tests :
- **NVDA** (dernière version) + **Firefox / Chrome** sous Windows ;
- Navigation clavier seule ; zoom navigateur 200 % ;
- **axe-core** (Axe DevTools), **Lighthouse**, **WAVE** pour la passe automatique.

### Retour d'information et contact

Si vous ne parvenez pas à accéder à un contenu ou à un service, vous pouvez contacter le responsable d'EduTutor IA pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme :

- **E-mail** : accessibilite@edututor.[domaine]
- **Formulaire de contact** : `https://edututor.[domaine]/contact`

### Voies de recours

Cette procédure est à utiliser dans le cas suivant : vous avez signalé au responsable du site un défaut d'accessibilité qui vous empêche d'accéder à un contenu ou à un service, et vous n'avez pas obtenu de réponse satisfaisante.

- Écrire un message au **Défenseur des droits** : <https://formulaire.defenseurdesdroits.fr/>
- Contacter le **délégué du Défenseur des droits** dans votre région : <https://www.defenseurdesdroits.fr/saisir/delegues>
- Envoyer un courrier par la poste (gratuit, sans affranchissement) :
  Défenseur des droits — Libre réponse 71120 — 75342 Paris CEDEX 07.

---

## Notes internes (non publiées)

- Cette déclaration est un **brouillon** produit en J4 pour matérialiser l'obligation légale (US-J4-08, risque R2).
- Les champs entre crochets `[…]` et l'état de conformité sont à **finaliser en Release 3** après le contre-audit.
- La publication doit rendre la page « Accessibilité » **elle-même accessible** et **accessible depuis toutes les pages** (pied de page).
- Rattachement : épic **EP-13** · risque **R2** (exposition 9) · [audit RGAA](audit-rgaa-final.md).
