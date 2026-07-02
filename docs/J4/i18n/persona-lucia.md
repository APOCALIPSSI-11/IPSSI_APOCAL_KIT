# Persona élargie — Lucia (utilisatrice internationale)

> **Équipe 11 · EduTutor IA** · Epic 14 — Internationalisation
> **Critère visé** : CA-J4-2 — Persona élargie (utilisateur international)
> **Rédigé par** : Romain LEFEVRE + Frederick TOUFIK

---

## Fiche persona

| Champ | Détail |
|---|---|
| **Nom** | Lucia Fernández |
| **Âge** | 17 ans |
| **Statut** | Élève en terminale, lycée français à l'étranger (section internationale, Madrid) — suit une partie de ses cours en espagnol, une partie en français |
| **Langue maternelle** | Espagnol (es-ES) |
| **Niveau de français** | B1 — suffisant pour suivre les cours, insuffisant pour naviguer confortablement dans une interface entièrement en français |
| **Équipement** | Smartphone Android + ordinateur portable partagé en famille |
| **Contexte d'usage** | Révise le soir, seule, souvent en dehors de la présence d'un enseignant francophone pour l'aider si l'interface la bloque |

## Objectifs

- Comprendre immédiatement l'interface (menus, boutons, messages d'erreur) sans dictionnaire.
- Réviser un cours donné en espagnol avec un quiz généré **dans la même langue**, pour ne pas mélanger l'apprentissage de la matière et l'apprentissage du français.
- Lire ses résultats et son historique avec des dates et des scores affichés selon les conventions espagnoles (`dd/mm/aaaa`, virgule décimale).

## Besoins fonctionnels (mappés Epic 14)

| Besoin | User story associée |
|---|---|
| Choisir la langue de l'interface (ES) et que ce choix soit mémorisé | [US-I18N-01](user-stories-i18n.md#us-i18n-01) |
| Obtenir un quiz généré dans la langue du cours source, pas systématiquement en français | [US-I18N-02](user-stories-i18n.md#us-i18n-02) |
| Voir les dates, scores et nombres au format local | [US-I18N-03](user-stories-i18n.md#us-i18n-03) |

## Frustration actuelle (état des lieux avant Epic 14)

> *« L'application a l'air bien faite, mais tout est en français : les boutons, les messages d'erreur, même le quiz généré à partir de mon cours en espagnol ressort parfois en français. Je passe plus de temps à traduire l'interface qu'à réviser. Si l'appli devient la référence dans mon lycée, elle doit d'abord me parler dans ma langue. »*

## Ce que ce persona n'adresse PAS

Lucia n'a pas de situation de handicap et ce persona ne couvre **pas** l'axe accessibilité RGAA (persona dédié traité par ailleurs, ex. Malik). L'objectif est de garder une séparation nette entre les deux axes J4 pour ne pas diluer les besoins spécifiques à l'internationalisation.

## Impact produit

Lucia matérialise le risque **R-I18N-01** (interface mono-langue bloquant l'expansion) et **R-I18N-02** (quiz généré dans la mauvaise langue) — voir [analyse-risques-i18n.md](analyse-risques-i18n.md). Elle est la persona de référence pour arbitrer les priorités MoSCoW de l'Epic 14 : tout ce qui la bloque concrètement (sélecteur de langue, langue du quiz) est **Must**, tout ce qui améliore son confort (formats localisés) est **Could**.
