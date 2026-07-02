# Étude d'accessibilité (RGAA) — EduTutor IA

> **Équipe 11 · EduTutor IA** · Perturbation J4 — volet **Accessibilité**
> **Binôme accessibilité (Van Anh & Seer)** : Thi Van Anh NGUYEN + Seer MENSAH ASSIAKOLEY
> **Nature** : étude de fond (pédagogique + appliquée au projet) · **Référentiel** : RGAA 4.1 (WCAG 2.1 niveau AA)
> **Objectif** : comprendre l'accessibilité numérique et cadrer sa mise en œuvre pour un déploiement d'EduTutor **en service public national** (traitement du risque **R2**, exposition 9 🔴).
> **Documents liés** : [audit-rgaa-final.md](audit-rgaa-final.md) · [declaration-accessibilite.md](declaration-accessibilite.md) · [README du dossier](README.md)

---

## 1. Qu'est-ce que le RGAA ?

Le **RGAA** (*Référentiel Général d'Amélioration de l'Accessibilité*) est la **méthode officielle française** pour vérifier et attester qu'un site ou une application web est **accessible aux personnes en situation de handicap**.

- Il ne réinvente pas les règles : il **opérationnalise les WCAG 2.1** (*Web Content Accessibility Guidelines*, standard international du W3C) au **niveau AA**, en fournissant des **tests concrets** et une **méthode de contrôle** reproductible.
- Version en vigueur : **RGAA 4.1** — **106 critères** répartis en **13 thématiques** (≈ 257 tests unitaires).
- Chaque critère est **vérifiable** (conforme / non conforme / non applicable), ce qui permet de calculer un **taux de conformité** objectif.

> En résumé : **WCAG = le « quoi »** (les objectifs d'accessibilité), **RGAA = le « comment on le vérifie en France »** (la grille de contrôle et l'obligation légale).

## 2. Pourquoi c'est un enjeu **bloquant** pour EduTutor

EduTutor est, dans le scénario J4, **adopté par l'État** → il devient un **service de communication publique en ligne**. Il tombe donc sous l'obligation légale d'accessibilité :

| Texte | Ce qu'il impose |
|-------|-----------------|
| **Loi n° 2005-102 du 11 février 2005** (art. 47) | Principe : les services publics numériques doivent être accessibles à tous. |
| **Décret n° 2019-768 du 24 juillet 2019** | Rend le **RGAA opposable** : audit, **déclaration d'accessibilité**, schéma pluriannuel, plan annuel. |
| **Directive UE 2016/2102** | Cadre européen (harmonise l'accessibilité des organismes publics). |

**Concrètement, la loi exige 3 livrables publics :**
1. Une **mention de conformité** visible dès la page d'accueil (« Accessibilité : non / partiellement / totalement conforme »).
2. Une **déclaration d'accessibilité** détaillée (→ [notre brouillon](declaration-accessibilite.md)).
3. Un **schéma pluriannuel** de mise en accessibilité (3 ans) + un **plan d'action annuel**.

**Sanction** : jusqu'à **20 000 € par service** en cas de manquement (absence de déclaration/schéma), sanction **renouvelable**. Et surtout : **pas de mise en service public possible** sans engagement de conformité. → c'est exactement le **risque R2** (P3 × I3 = **9**, rouge).

> **Le message de gestion** : l'accessibilité n'est pas un « bonus UX », c'est un **prérequis légal de déploiement**. Sans elle, tout le reste (scalabilité, i18n) ne sert à rien puisque l'État ne peut pas ouvrir le service.

## 3. Le socle : les 4 principes POUR (WCAG)

Toute l'accessibilité tient en 4 principes. Un contenu doit être **P.O.U.R.** :

| Principe | Signification | Exemple d'exigence pour EduTutor |
|----------|---------------|----------------------------------|
| **P — Perceptible** | L'information doit pouvoir être perçue (vue, ouïe, toucher). | Alternatives textuelles aux icônes ; contrastes suffisants ; sous-titres si vidéo de démo. |
| **O — Utilisable** (*Operable*) | L'interface doit pouvoir être manipulée par tous. | Tout est **utilisable au clavier** ; pas de piège au clavier ; focus visible. |
| **U — Compréhensible** | Le contenu et le fonctionnement doivent être clairs. | Libellés explicites ; messages d'erreur compréhensibles ; langue déclarée (`lang="fr"`). |
| **R — Robuste** | Compatible avec les technologies d'assistance, présentes et futures. | HTML valide + **ARIA** correct, lisible par NVDA / JAWS / VoiceOver. |

## 4. Les 13 thématiques du RGAA (et leur pertinence pour EduTutor)

| # | Thématique | Ce qu'elle vérifie | Pertinence EduTutor |
|---|------------|--------------------|:-------------------:|
| 1 | **Images** | Alternatives textuelles (`alt`), images décoratives neutralisées | 🟠 icônes d'action (upload, supprimer), graphiques du dashboard |
| 2 | **Cadres** | `<iframe>` titrés | 🟢 peu / pas d'iframe |
| 3 | **Couleurs** | Contrastes ≥ 4.5:1, information jamais portée par la couleur seule | 🔴 thème sombre + correction « vert/rouge » des réponses |
| 4 | **Multimédia** | Sous-titres, transcriptions, audiodescription | 🟡 uniquement la vidéo de démo |
| 5 | **Tableaux** | En-têtes associés, tableaux de données structurés | 🟠 historique, dashboard de classe |
| 6 | **Liens** | Intitulés explicites, pas de « cliquez ici » | 🟠 navigation générale |
| 7 | **Scripts** | Composants riches accessibles au clavier + restitués aux lecteurs d'écran | 🔴 **QCM, modales, spinner de génération** |
| 8 | **Éléments obligatoires** | `DOCTYPE`, `lang`, titre de page pertinent, code valide | 🔴 `lang="fr"`, titres de page par route |
| 9 | **Structuration** | Hiérarchie des titres (`h1→h2→h3`), listes, landmarks | 🟠 pages quiz / résultats |
| 10 | **Présentation** | CSS, zoom 200 %, focus visible, pas de perte d'info | 🔴 zoom 200 %, focus, responsive |
| 11 | **Formulaires** | `<label>` associés, regroupements, erreurs reliées au champ | 🔴 **login, signup, upload** |
| 12 | **Navigation** | Menu, plan du site, **lien d'évitement**, ordre de tabulation cohérent | 🔴 skip-link, ordre de tabulation du quiz |
| 13 | **Consultation** | Documents bureautiques accessibles, limites de temps configurables | 🟠 export PDF, mode timer du quiz |

🔴 critique · 🟠 concerné · 🟡 marginal · 🟢 peu concerné.

> **Constat** : les thématiques les plus critiques pour EduTutor sont **7 (scripts), 8 (éléments obligatoires), 10 (présentation), 11 (formulaires) et 12 (navigation)** — logique pour une **SPA React interactive** centrée sur des formulaires et un composant de quiz dynamique.

## 5. Comprendre les utilisateurs : handicaps et technologies d'assistance

L'accessibilité ne se pense pas « en abstrait » mais **par type de handicap** et **par technologie d'assistance**. En France, ~**12 millions** de personnes vivent avec un handicap, dont ~**1,7 million** avec une déficience visuelle.

| Type de handicap | Obstacles typiques | Technologie d'assistance | Ce que ça impose à EduTutor |
|------------------|--------------------|--------------------------|------------------------------|
| **Visuel** (cécité, malvoyance) | Ne voit pas / mal l'écran | **Lecteur d'écran** (NVDA, JAWS, VoiceOver), plage braille, loupe | ARIA + navigation clavier + contrastes + zoom (**persona Lucia**) |
| **Daltonisme** | Ne distingue pas certaines couleurs | — | Ne jamais coder une info par la **couleur seule** (réponses correctes) |
| **Moteur** | Ne peut pas utiliser la souris | Clavier seul, contacteur, contrôle oculaire, **reconnaissance vocale** (Dragon) | Tout au clavier + zones cliquables suffisantes + **commande vocale** (US-J4-13) |
| **Auditif** | N'entend pas | Sous-titres, LSF | Sous-titrer la vidéo de démo |
| **Cognitif / psychique** | Surcharge, mémoire, attention | Simplification, aide | Libellés clairs, messages d'erreur explicites, pas de limite de temps imposée |

**Notre persona porteur** : **Lucia Bernal** (malvoyant, NVDA + clavier + parfois commande vocale) — voir le persona v3.1. Il rend le risque R2 **incarné et testable**.

## 6. Niveaux de conformité et taux

### Niveaux WCAG (repris par le RGAA)
- **A** : niveau minimal (barrières majeures levées).
- **AA** : niveau **exigé pour les services publics** ← **notre cible**.
- **AAA** : niveau renforcé (rarement exigible sur tout un service).

### Le taux de conformité RGAA

```
Taux de conformité (%) =  (critères conformes) / (critères applicables) × 100
```

### Les 3 états déclarables (mention légale obligatoire)

| État | Condition | Signification |
|------|-----------|---------------|
| **Non conforme** | taux < 50 % (ou aucune vérification) | Barrières importantes subsistent |
| **Partiellement conforme** | taux ≥ 50 % | Une partie des critères est respectée |
| **Totalement conforme** | taux = 100 % | Tous les critères applicables respectés |

> **Notre position (baseline audit)** : **≈ 63 %** → *partiellement conforme*, mais avec **3 anomalies bloquantes** encore présentes. **Cible de premier déploiement** fixée avec le PO : **≥ 85 % et 0 anomalie bloquante** + plan daté pour le reste. **Objectif final** : viser **100 %** (service public).

## 7. Méthode d'audit appliquée à EduTutor (rappel)

L'audit se fait en **2 passes complémentaires** (une seule ne suffit jamais) :

- **Passe automatique (~30 % des critères)** : `axe-core` (Axe DevTools), `Lighthouse`, `WAVE`. Rapide, détecte contrastes / labels manquants / ARIA / structure. Automatisable **en CI** (US-J4-09).
- **Passe manuelle (~70 %)** : navigation **clavier seul**, **lecteur d'écran NVDA**, **zoom 200 %**, mesure des **contrastes**, vérification des **formulaires** et des **contenus dynamiques** (`aria-live`).

Périmètre : **7 écrans** représentatifs (signup/login, upload, quiz, résultats, historique, dashboard classe, composants transverses). Détail et grille d'anomalies → **[audit-rgaa-final.md](audit-rgaa-final.md)**.

## 8. Analyse par fonctionnalité d'EduTutor

Application concrète : ce que « être accessible » veut dire pour chaque brique du produit.

| Parcours | Enjeu d'accessibilité principal | Critères RGAA clés | US |
|----------|-------------------------------|--------------------|----|
| **Inscription / connexion** | Formulaires étiquetés, erreurs annoncées | 11.1, 11.10, 11.11 | US-J4-06 |
| **Upload d'un cours** | Champ de dépôt utilisable au clavier, état annoncé, icônes alternées | 7.x, 1.1, 11.x | US-J4-06 |
| **Génération de quiz** | **Spinner / progression annoncé** au lecteur d'écran (`aria-live`) — sinon « app plantée » | 7.4 | US-J4-06 |
| **Passage du quiz (QCM)** | **Navigation clavier complète** + rôles ARIA (`radiogroup`), ordre de tabulation logique | 7.1, 7.3, 12.8 | US-J4-06 |
| **Résultats / correction** | Bonnes/mauvaises réponses **pas uniquement en couleur** (icône + texte), contrastes | 3.1, 3.2, 3.3 | US-J4-07 |
| **Historique** | Tableau de données structuré, lisible à 200 % | 5.x, 10.4 | US-J4-07 |
| **Dashboard classe** | Graphiques KPI avec **équivalent textuel** (résumé + tableau) | 1.1, 5.x | US-J4-07 |
| **Transverse** | `lang="fr"`, lien d'évitement, focus visible, modales fermables au clavier | 8.3, 12.1, 10.7, 7.x | US-J4-06 |

## 9. Recommandations techniques (patrons d'accessibilité React)

*(Second plan — le module est noté sur la gestion ; ces patrons cadrent la Release 3 et l'éventuel incrément de démo T-A11Y.5.)*

- **Formulaires** : `<label for>` explicite ; erreurs via `aria-describedby` + `aria-invalid` + `role="alert"`.
- **Contenu dynamique** : `aria-live="polite"` + `role="status"` sur la barre de progression (`ProgressBar.tsx`).
- **QCM** : `role="radiogroup"` / `role="radio"`, gestion des flèches + Entrée, `aria-checked`.
- **Focus** : style `:focus-visible` contrasté (≥ 2 px) ; jamais `outline: none` sans remplacement.
- **Modale** : piège de focus, fermeture Échap, restitution du focus au déclencheur, `aria-modal="true"`.
- **Navigation** : lien d'évitement « Aller au contenu » en tête de `Layout.tsx` ; `lang="fr"` sur `<html>`.
- **Couleurs** : palette `ThemeContext.tsx` recalculée pour ≥ 4.5:1 ; état des réponses = **icône + texte**, pas la couleur seule.
- **Garde-fou** : `@axe-core/playwright` en CI qui **bloque le merge** sur toute violation critique (US-J4-09).

## 10. Traçabilité vers la gestion de projet (l'essentiel pour le jury)

L'étude ne reste pas théorique : elle **descend dans les artefacts Scrum** (règle d'or J4).

| Élément de gestion | Où | Contenu accessibilité |
|--------------------|----|------------------------|
| **Épic EP-13** | Product Backlog v3.1 | 5 US (US-J4-06/07/08/09/13) = **18 SP** |
| **Risque R2** | Registre des risques v3.1 | P3 × I3 = **9** 🔴 → action préventive **13 pts** priorisée |
| **Persona Lucia** | Persona v3.1 | Utilisateur malvoyant, incarne le besoin |
| **DoD étendue** | Backlog, feuille *DoR & DoD* | Clavier / ARIA / contraste / `aria-live` / axe-core |
| **Burnup** | Release Planning v3.1 | Scope 71 → **89 SP** (perturbation absorbée, visible) |
| **Porte de sortie R3** | Release Planning v3.1 | « Taux RGAA cible atteint » = condition de déploiement |
| **Audit + déclaration** | 2 docs md | Preuve de méthode + obligation légale |

> **La phrase à retenir** : *« Un risque identifié sans action préventive dans le backlog n'est qu'une inquiétude ; un risque traduit en item estimé et priorisé devient du pilotage. »* → R2 (accessibilité) est devenu du **pilotage**.

## 11. Glossaire

- **RGAA** : Référentiel Général d'Amélioration de l'Accessibilité (méthode française).
- **WCAG** : Web Content Accessibility Guidelines (standard W3C, niveaux A / AA / AAA).
- **ARIA** : Accessible Rich Internet Applications (attributs enrichissant le HTML pour les technologies d'assistance).
- **Lecteur d'écran** : logiciel restituant l'interface en voix ou braille (NVDA gratuit, JAWS, VoiceOver).
- **Technologie d'assistance** : tout outil compensant un handicap (lecteur d'écran, loupe, contacteur, reconnaissance vocale).
- **Taux de conformité** : critères conformes / critères applicables.
- **Déclaration d'accessibilité** : document légal public décrivant l'état de conformité, les dérogations, le contact et les voies de recours.
- **Schéma pluriannuel** : plan sur 3 ans de mise en accessibilité d'un organisme public.

## 12. Références

- RGAA 4.1 (référentiel officiel) : <https://accessibilite.numerique.gouv.fr/>
- WCAG 2.1 (W3C, FR) : <https://www.w3.org/Translations/WCAG21-fr/>
- Loi n° 2005-102 (art. 47) · Décret n° 2019-768 · Directive UE 2016/2102
- NVDA (lecteur d'écran libre) : <https://www.nvaccess.org/>
- Axe-core / Axe DevTools : <https://www.deque.com/axe/>
- WebAIM (ressources d'accessibilité) : <https://webaim.org/>
- Défenseur des droits (voie de recours) : <https://www.defenseurdesdroits.fr/>

---

*Étude produite en Sprint 4 (perturbation J4) par le binôme accessibilité. Elle sert de socle de connaissances au volet RGAA et de support de soutenance. Volet Vision Board / Persona / Customer Journey / Story Map traité par Van Anh ; volet Backlog / Release / Sprint / Risques / Audit / Déclaration par Seer.*
