# Epic 14 — Internationalisation (i18n)

> **Équipe 11 · EduTutor IA** · Sprint 4 (jeudi 02/07/2026)
> **Périmètre** : axe **internationalisation** de la perturbation J4 — *« Passage à l'échelle »*
> **Porté par** : Romain LEFEVRE + Frederick TOUFIK
> **Voir aussi** : [ADR-003 — Stratégie i18n](../../adr/ADR-003-strategie-i18n.md)

---

## 1. Cadrage

La levée de fonds annoncée en J4 ouvre une expansion européenne. EduTutor IA n'est aujourd'hui utilisable qu'en français : l'interface est en français codé en dur (`LANGUAGE_CODE = "fr"` côté Django, aucune lib i18n côté React) et le LLM génère systématiquement les quiz dans la langue du cours source, sans garantie ni contrôle.

Ce dossier documente **uniquement l'axe i18n** de la perturbation J4 (Epic 14), traité comme un lot autonome confié à ce binôme. Les deux autres axes de J4 (**scalabilité**, **accessibilité RGAA**) sont hors périmètre ici et traités par le reste de l'équipe.

Conformément à la directive du PO (*« pas de code bricolé dans la panique »*), ce lot reste au stade **artefacts + risques + décision d'architecture** pour le Sprint 4. La mise en œuvre technique (intégration i18next, prompt système multilingue) est planifiée en Release 3 et n'est qu'un bonus optionnel si le temps le permet.

## 2. Ce que couvre l'Epic 14

| Besoin | Traduction produit |
|---|---|
| Un élève non francophone doit pouvoir utiliser l'interface dans sa langue | Sélecteur de langue UI (FR/EN/ES), chaînes externalisées, aucun texte codé en dur |
| Un élève qui suit un cours dans une langue donnée doit réviser dans cette langue | Le LLM doit produire le quiz dans la langue attendue, avec un contrôle de validation avant enregistrement |
| Un élève doit lire des dates/nombres/scores selon les conventions de son pays | Formats localisés (séparateurs, ordre jour/mois) |

## 3. Contenu du dossier

| Document | Contenu |
|---|---|
| [persona-lucia.md](persona-lucia.md) | Persona élargie — utilisatrice internationale (CA-J4-2) |
| [user-stories-i18n.md](user-stories-i18n.md) | User stories Given/When/Then, MoSCoW, SP estimés |
| [analyse-risques-i18n.md](analyse-risques-i18n.md) | Risques i18n en matrice probabilité × impact + actions préventives estimées et priorisées |
| [ADR-003 — Stratégie i18n](../../adr/ADR-003-strategie-i18n.md) | Décision d'architecture : lib i18n interface + langue du LLM à la volée |

## 4. Ce qui reste hors de ce lot

- Vision board / story map / product backlog **globaux** (v4.0) : mis à jour par le PO à partir des 3 lots (scalabilité, RGAA, i18n) réunis.
- Burndown Sprint 4 / burnup projet : pilotage transverse, hors périmètre de ce binôme.
- Implémentation technique (intégration i18next, endpoint de langue du LLM) : bonus optionnel, non engagé dans le Sprint 4.

## 5. Traçabilité vers le backlog global

Les items de backlog produits ici (voir [analyse-risques-i18n.md §3](analyse-risques-i18n.md#3-du-risque-à-laction-préventive)) sont formulés pour être directement repris tels quels par le PO dans le Product Backlog v4.0, épic **EP-14 — Internationalisation**.
