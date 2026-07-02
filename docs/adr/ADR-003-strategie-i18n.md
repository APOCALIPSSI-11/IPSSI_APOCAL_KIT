# ADR-0003 : Stratégie d'internationalisation — interface et contenu généré par le LLM (Epic 14, perturbation J4)

> **Format** : [MADR](https://blog.stephane-robert.info/docs/documenter/concevoir/adr/) — Markdown Any Decision Records
> **Date** : 2 juillet 2026
> **Auteurs** :
Romain LEFEVRE,
Frederick TOUFIK
> **Version** : 1.0
> **Périmètre** : Epic 14 — Internationalisation (axe i18n de la perturbation J4, distinct des axes scalabilité et RGAA)

## Statut

**Proposed** — décision d'architecture documentée pour la Release 3, non implémentée dans le Sprint 4 (directive PO : « pas de code bricolé »).

## Contexte et problème

EduTutor IA est aujourd'hui **mono-langue** :
- côté frontend React, aucune librairie i18n n'est en place, les chaînes sont écrites directement en français dans les composants (`frontend/src/pages`, `frontend/src/components`) ;
- côté backend Django, `LANGUAGE_CODE = "fr"` est figé dans `backend/apocal/settings.py`, `USE_I18N` est activé mais aucun fichier de traduction n'existe ;
- côté génération de quiz, le LLM (`backend/llm/services/quiz_prompt.py`, `ollama_client.py`) ne reçoit aucune consigne de langue explicite : il déduit implicitement la langue de sortie à partir du texte du cours, sans garantie ni contrôle.

La levée de fonds de J4 ouvre une expansion européenne ([persona Alberta Aravindan](../pilotage/internationalisation/persona-alberta.md)). Il faut choisir une architecture pour **(1)** rendre l'interface multilingue et **(2)** garantir que le contenu généré par le LLM est produit dans la langue attendue.

## Decision Drivers

1. Ne pas dépendre d'un service tiers de traduction — cohérent avec la contrainte de souveraineté déjà actée en [ADR-0001](./ADR-001-choix-llm.md) (LLM on-premise).
2. Réutiliser l'architecture existante plutôt que la remplacer : séparation `system`/`user` déjà en place côté LLM depuis T-SEC-01r ([ADR-0002](./ADR-002-securisation-llm-rgpd-j3a.md)).
3. Aucune chaîne codée en dur ne doit subsister (exigence de la DoD étendue J4) : ajouter une langue plus tard ne doit pas nécessiter de retoucher le code des composants.
4. Le contrôle de la langue de sortie du LLM doit être vérifiable automatiquement, pas laissé à l'appréciation de l'utilisateur.

## Options considérées — internationalisation de l'interface

**A. Dupliquer les pages/composants par langue** — rejeté : coût de maintenance qui explose à chaque évolution, risque de divergence entre versions.

**B. Librairie i18n dédiée avec chaînes externalisées** (i18next + react-i18next côté React, framework i18n Django côté back pour les messages serveur/emails) — retenue.

**C. Traduction à la volée de l'UI via une API de traduction tierce** — rejeté : dépendance externe, latence perçue, coût par requête, contredit la contrainte de souveraineté de l'ADR-0001.

## Options considérées — langue du contenu généré par le LLM

**A. Laisser le LLM déduire implicitement la langue du texte source** — rejeté : c'est le comportement actuel, cause directe du risque R-I18N-02 (aucune garantie).

**B. Prompt système imposant explicitement la langue cible + contrôle de validation de la sortie avant enregistrement** — retenue. La langue cible (détectée à l'upload ou choisie par l'utilisateur) est injectée dans `SYSTEM_PROMPT` ; une détection de langue est exécutée sur la sortie JSON avant `save()` ; en cas de désaccord, régénération automatique (avec plafond de tentatives) plutôt qu'enregistrement d'un quiz dans la mauvaise langue.

**C. Traduire a posteriori la sortie du LLM via un service de traduction tiers** — rejeté : dépendance externe supplémentaire, risque de perte de nuance pédagogique (une traduction mot à mot peut casser un distracteur de QCM), contredit à nouveau la contrainte de souveraineté.

## Décision

**Interface** : Option B — `i18next` + `react-i18next` côté frontend (fichiers de langue `frontend/src/locales/{fr,en,es}.json`), framework i18n Django (`gettext`/`.po`) côté messages serveur, complétés par un sélecteur de langue persistant (profil utilisateur + cookie).

**Contenu LLM** : Option B — la langue cible est ajoutée aux paramètres de `build_user_prompt()` et injectée explicitement dans `SYSTEM_PROMPT` (`backend/llm/services/quiz_prompt.py`) ; `parse_and_validate_quiz()` est étendu d'un contrôle de langue de sortie avant tout enregistrement, réutilisant la séparation `system`/`user` déjà en place sur `/api/chat` (héritée de T-SEC-01r).

## Conséquences

### Positives
- Aucune dépendance externe ajoutée pour la traduction de contenu (cohérent avec ADR-0001) ni pour l'interface.
- Le contrôle de langue de sortie du LLM réutilise la même architecture de défense en profondeur que la sécurité prompt injection (ADR-0002) : c'est une couche de validation supplémentaire sur un pipeline déjà éprouvé, pas une architecture parallèle.
- Ajouter une nouvelle langue d'interface devient un ajout de fichier de traduction, sans toucher au code des composants.

### Négatives
- Charge de traduction humaine des fichiers de langue (FR/EN/ES) non automatisée par cette décision — nécessite une relecture croisée (voir [R-I18N-03](../pilotage/internationalisation/analyse-risques-i18n.md)).
- La détection de langue du cours source à l'upload n'est pas garantie fiable à 100 % (textes courts, mélange de langues) : un mécanisme de correction manuelle par l'utilisateur reste nécessaire en complément.
- Le plafond de tentatives de régénération en cas de langue incorrecte introduit une latence supplémentaire potentielle pour l'utilisateur, à mesurer lors de l'implémentation.

### Neutres
- L'implémentation technique (intégration i18next, extension de `quiz_prompt.py`) est planifiée en Release 3 et n'est pas engagée dans le Sprint 4 ; seul le PoC bonus optionnel du brief J4 pourrait en couvrir un fragment si le temps le permet.

## Liens

- Epic 14 — dossier i18n complet : [docs/pilotage/internationalisation/README.md](../pilotage/internationalisation/README.md)
- Persona Alberta Aravindan : [docs/pilotage/internationalisation/persona-alberta.md](../pilotage/internationalisation/persona-alberta.md)
- User stories i18n : [docs/pilotage/internationalisation/user-stories-i18n.md](../pilotage/internationalisation/user-stories-i18n.md)
- Analyse de risques i18n : [docs/pilotage/internationalisation/analyse-risques-i18n.md](../pilotage/internationalisation/analyse-risques-i18n.md)
- ADR-0001 (contrainte de souveraineté / architecture LLM) : [ADR-001-choix-llm.md](./ADR-001-choix-llm.md)
- ADR-0002 (séparation system/user déjà en place sur l'appel LLM) : [ADR-002-securisation-llm-rgpd-j3a.md](./ADR-002-securisation-llm-rgpd-j3a.md)
- Template MADR : https://blog.stephane-robert.info/docs/documenter/concevoir/adr/
