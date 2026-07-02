# User Stories J4 — Passage à l'échelle (Release 3)

> **Équipe 11 · EduTutor IA** · Sprint 4 (02/07/2026)
> **Livrable perturbation J4** : nouvelles US intégrant les 3 axes (scalabilité, RGAA, i18n), ajoutées au Product Backlog.
> **Voir aussi** : [Brief J4](README.md) · [Analyse de risques](analyse-risques-j4.md) · [Impact sur l'existant](impact-us-existantes.md) · Product Backlog v4.0
> **Format critères** : **Given / When / Then** = *Arrange / Act / Assert* (même structure que le board de l'équipe). Given = état de départ · When = action · Then = résultat vérifiable.

---

## 1. Nouveaux épics (Product Backlog v4.0)

| ID | Epic | Activité | Axe J4 | Stories |
|----|------|----------|--------|---------|
| **EP-12** | Passage à l'échelle | Exploiter à l'échelle nationale | Scalabilité | US-J4-01..05 |
| **EP-13** | Accessibilité | Utiliser sans barrière | RGAA | US-J4-06..09, 13 |
| **EP-14** | Internationalisation | Utiliser dans sa langue | i18n | US-J4-10..12 |

## 2. Nouveaux personas (élargissement J4)

| Persona | Description | Besoin clé |
|---------|-------------|------------|
| **Malik, étudiant en situation de handicap** | Lecteur d'écran (NVDA), navigation clavier, parfois commande vocale | Passer/exporter un quiz sans souris |
| **Sofia, étudiante Erasmus** | Espagnole, cours parfois en anglais | Interface et quiz dans sa langue |
| **Nadia, SRE / Admin plateforme** | Exploitation du service public national | Tenir la charge, détecter les pannes, maîtriser les coûts |

---

## 3. Release 3 — Axe Scalabilité (EP-12)

### US-J4-01
**En tant que** Nadia (SRE), **je veux** que la génération de quiz passe par une file d'attente asynchrone, **afin d'**absorber les pics de charge nationale sans effondrer le serveur.
`Admin/SRE · MUST · 8 SP · ★★★★★ · R3 · Risque R1`
- **Given** : des centaines de demandes de génération arrivent simultanément
- **When** : chaque demande est mise en file (Celery + Redis) et traitée par un worker
- **Then** : l'API répond immédiatement (202 + id de tâche), aucune requête n'est perdue, l'avancement est suivi par polling

### US-J4-02
**En tant que** Nadia (SRE), **je veux** mettre en cache les quiz générés pour un même contenu, **afin de** réduire la charge LLM et servir instantanément les demandes redondantes.
`Admin/SRE · SHOULD · 5 SP · ★★★★ · R3 · Risque R5`
- **Given** : un cours déjà traité (même empreinte de contenu) a un quiz en cache
- **When** : un utilisateur redemande un quiz pour ce même contenu
- **Then** : le quiz est servi depuis le cache (TTL configurable) sans nouvel appel LLM, et le cache-hit est journalisé

### US-J4-03
**En tant que** Nadia (SRE), **je veux** des tests de charge automatisés simulant N utilisateurs simultanés, **afin de** connaître le point de rupture avant le lancement national.
`Admin/SRE · MUST · 5 SP · ★★★★★ · R3 · Risque R3`
- **Given** : un environnement de recette représentatif
- **When** : un scénario k6/Locust monte progressivement à 1 000 utilisateurs
- **Then** : un rapport chiffre le débit max, la latence p95 et le seuil de dégradation

### US-J4-04
**En tant que** Nadia (SRE), **je veux** répartir la génération sur un pool d'instances LLM (scaling horizontal), **afin de** tenir la charge nationale sans dégrader les temps de réponse.
`Admin/SRE · SHOULD · 8 SP · ★★★★ · R3 · Risque R5`
- **Given** : plusieurs backends Ollama enregistrés derrière un répartiteur
- **When** : la charge augmente et une instance supplémentaire est ajoutée
- **Then** : le débit de génération augmente quasi linéairement et aucune requête n'échoue

### US-J4-05
**En tant que** Nadia (SRE), **je veux** des métriques et des alertes de production, **afin de** détecter une panne ou une saturation avant les utilisateurs.
`Admin/SRE · SHOULD · 5 SP · ★★★★ · R3 · Risque R6`
- **Given** : l'application tourne en production
- **When** : un indicateur dépasse son seuil (latence, taux d'erreur, profondeur de file, CPU/RAM)
- **Then** : une alerte est déclenchée et l'incident est visible sur un dashboard

## 4. Release 3 — Axe Accessibilité RGAA (EP-13)

### US-J4-06
**En tant que** Malik, **je veux** naviguer et passer un quiz entièrement au clavier avec un lecteur d'écran, **afin d'**utiliser EduTutor sans souris ni vue.
`Handicap · MUST · 5 SP · ★★★★★ · R3 · Risque R2`
- **Given** : /quiz ouvert avec NVDA activé
- **When** : je navigue uniquement au clavier (Tab, flèches, Entrée)
- **Then** : tous les éléments interactifs sont focusables et étiquetés (ARIA), l'ordre de tabulation est logique, je peux répondre et soumettre (RGAA 7.x/10.x)

### US-J4-07
**En tant qu'**utilisateur en situation de handicap visuel, **je veux** des contrastes conformes et un texte redimensionnable, **afin de** lire confortablement l'interface.
`Handicap · MUST · 3 SP · ★★★★ · R3 · Risque R2`
- **Given** : n'importe quelle page de l'app
- **When** : on mesure les contrastes et on zoome le texte à 200 %
- **Then** : le ratio est ≥ 4.5:1 (texte normal) et aucun contenu n'est tronqué à 200 % (RGAA 3.x/10.4)

### US-J4-08
**En tant que** responsable d'un service public, **je veux** publier une déclaration d'accessibilité RGAA, **afin de** respecter l'obligation légale.
`Établissement · SHOULD · 2 SP · ★★★ · R3`
- **Given** : l'audit RGAA a produit un taux de conformité
- **When** : on publie la page « Accessibilité »
- **Then** : la page affiche le taux, les dérogations, la date, un contact et la voie de recours (Défenseur des droits)

### US-J4-09
**En tant que** développeur, **je veux** un audit d'accessibilité automatisé en CI, **afin de** prévenir les régressions RGAA.
`Équipe technique · SHOULD · 3 SP · ★★★ · R3 · Risque R2`
- **Given** : la CI exécute axe-core sur les pages critiques
- **When** : un commit introduit une violation d'accessibilité critique
- **Then** : la CI échoue et bloque le merge

### US-J4-13
**En tant que** Malik, **je veux** déclencher les actions clés (générer / exporter un quiz) par **commande vocale**, **afin d'**utiliser EduTutor sans interaction fine à la souris ou au clavier.
`Handicap · COULD · 5 SP · ★★★ · R3+ · Risque R2`
*(inspiré du board de l'équipe : commande vocale « Eddix, exporte-moi un quiz en PDF »)*
- **Given** : je suis connecté avec les options d'accessibilité activées
- **When** : je fais une commande vocale (« exporte-moi un quiz en PDF »)
- **Then** : la commande est reconnue, l'action correspondante est exécutée, et un retour vocal/visuel confirme le résultat

## 5. Release 3 — Axe Internationalisation i18n (EP-14)

> **Approche i18n de l'équipe** (board) : (1) **interface** via une lib i18n (i18next côté React, framework i18n côté Django) avec **chaînes externalisées** ; (2) **contenu généré** via **prompt système dédié** imposant la langue + **modèle de validation des traductions**.

### US-J4-10
**En tant que** Sofia, **je veux** basculer la langue de l'interface (FR/EN/ES) via une lib i18n, **afin d'**utiliser EduTutor dans ma langue.
`International · MUST · 8 SP · ★★★★★ · R3 · Risque R4`
- **Given** : l'UI utilise une lib i18n (i18next front, i18n framework back), toutes les chaînes externalisées (aucune codée en dur)
- **When** : Sofia choisit une langue dans le sélecteur (FR/EN/ES)
- **Then** : toute l'UI bascule dans cette langue et le choix est persistant (profil + cookie)

### US-J4-11
**En tant que** Sofia, **je veux** que le quiz soit généré dans la langue de mon cours, **afin de** réviser dans la langue où j'ai appris.
`International · SHOULD · 5 SP · ★★★★ · R3 · Risque R7`
- **Given** : un cours dont la langue est détectée ou choisie (ex. EN) et les options i18n actives
- **When** : l'utilisateur génère un quiz
- **Then** : le **prompt système** impose la langue cible, le quiz est produit dans cette langue, et un **contrôle de validation** vérifie la langue de sortie avant enregistrement

### US-J4-12
**En tant qu'**utilisateur international, **je veux** des formats de dates et de nombres localisés, **afin de** lire les informations selon les conventions de mon pays.
`International · COULD · 2 SP · ★★ · R3+`
- **Given** : la locale active est es-ES
- **When** : une date, un score ou un nombre est affiché
- **Then** : le format respecte la convention de la locale (séparateurs, ordre jj/mm)

---

## 6. Release 2 — clarification du périmètre (rappel)

La Release 2 se **clôture dans le Sprint 4** ; pas de nouvelle US, périmètre confirmé :

| US | Intitulé | Statut R2 |
|----|----------|-----------|
| US-26 | Inscription enseignant self-service | ✅ Done (S3) |
| US-T1 | Tableau de bord de classe | 🟡 Clôture DoD en S4 (T-T1.4) |
| US-07 | Reset password par email | ✅ Done (bonus S1) |
| US-T2 / US-T3 | Filtres / conseils enseignant | ⏸️ Stretch non engagé → basculent en R3 |

➡️ Clôture R2 : tag `v1.1.0` + notes de release.

---

## 7. Récapitulatif pour intégration Product Backlog v4.0

| ID | Epic | Persona | MoSCoW | SP | Release | Risque |
|----|------|---------|--------|----|---------|--------|
| US-J4-01 | EP-12 | Admin/SRE | MUST | 8 | R3 | R1 |
| US-J4-02 | EP-12 | Admin/SRE | SHOULD | 5 | R3 | R5 |
| US-J4-03 | EP-12 | Admin/SRE | MUST | 5 | R3 | R3 |
| US-J4-04 | EP-12 | Admin/SRE | SHOULD | 8 | R3 | R5 |
| US-J4-05 | EP-12 | Admin/SRE | SHOULD | 5 | R3 | R6 |
| US-J4-06 | EP-13 | Handicap | MUST | 5 | R3 | R2 |
| US-J4-07 | EP-13 | Handicap | MUST | 3 | R3 | R2 |
| US-J4-08 | EP-13 | Établissement | SHOULD | 2 | R3 | — |
| US-J4-09 | EP-13 | Équipe tech | SHOULD | 3 | R3 | R2 |
| US-J4-13 | EP-13 | Handicap | COULD | 5 | R3+ | R2 |
| US-J4-10 | EP-14 | International | MUST | 8 | R3 | R4 |
| US-J4-11 | EP-14 | International | SHOULD | 5 | R3 | R7 |
| US-J4-12 | EP-14 | International | COULD | 2 | R3+ | — |

**Total : 13 nouvelles US · 64 SP** (dont 4 MUST « cases rouges » = 29 SP en tête de Release 3).
Aucune n'est engagée dans le Sprint 4 (directive PO : « pas de code bricolé »). Elles matérialisent l'**absorption de J4 par le backlog** et alimentent le **burnup** (hausse visible du scope). Impact sur l'existant : voir [impact-us-existantes.md](impact-us-existantes.md).
