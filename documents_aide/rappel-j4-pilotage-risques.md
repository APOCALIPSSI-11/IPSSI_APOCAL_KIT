# Rappel J4 — Pilotage & Gestion des Risques

> **Équipe 11 · EduTutor IA** · Sprint 4
> **Source** : [Rappel J4 — mohamedelafrit.com](https://mohamedelafrit.com/teaching/APOCALIPSSI/pages/rappels/j4.php)
> **Voir aussi** : [Perturbation J4 (brief)](README.md) · [Analyse de risques](analyse-risques-j4.md)

---

## Objectif du jour

> Savoir **identifier et analyser les risques** (matrice probabilité × impact), puis **alimenter le backlog** en actions préventives, et **piloter avec des faits** via burndown / burnup.

## 1. Les 4 réflexes J4

| # | Réflexe | Application chez nous |
|---|---------|-----------------------|
| 1 | **Le succès génère de nouveaux risques à l'échelle** | Le succès national d'EduTutor crée des risques de charge, de conformité (RGAA), et d'i18n |
| 2 | **L'anticipation prime sur la réaction** | On planifie les 3 axes en Release 3, on ne code pas dans la panique |
| 3 | **Piloter avec des données, pas des impressions** | Burndown Sprint 4 + burnup projet chiffrés, pas de « ça avance » |
| 4 | **Le backlog absorbe toutes les exigences ET les actions préventives** | Chaque risque produit une US ou une tâche estimée dans le Product Backlog v4.0 |

## 2. La gestion des risques en 3 temps

```
1. IDENTIFIER  →  2. ANALYSER  →  3. TRAITER
   par catégorie    matrice          actions préventives
                    proba × impact   estimées au backlog
                    = exposition
```

### Temps 1 — Identifier par catégorie

Catégories à couvrir : **technique**, **conformité**, **i18n**, **humain**, **externe**.

### Temps 2 — Analyser (matrice probabilité × impact)

**Exposition = Probabilité × Impact.** Barème officiel J4 : probabilité (1 faible / 2 moyenne / 3 élevée) × impact (1 mineur / 2 majeur / 3 critique). On **traite d'abord les cases rouges (exposition ≥ 6)**.

| Exposition | Interprétation | Traitement |
|---|---|---|
| 6 – 9 | 🔴 Critique | Action préventive prioritaire |
| 3 – 4 | 🟠 Modéré | Surveillance + action planifiée |
| 1 – 2 | 🟢 Faible | Accepté / surveillé |

### Temps 3 — Traiter

Pour chaque risque significatif : **une action préventive**, **estimée** (en SP ou h) et **priorisée**, ajoutée au backlog. → voir [analyse-risques-j4.md](analyse-risques-j4.md).

## 3. Les indicateurs de pilotage

### Burndown (santé du sprint)

> Le **reste à faire** du sprint descend vers zéro en ligne droite.

- Compare la **courbe réelle** (reste à faire par jour) à la **droite idéale**.
- Au-dessus de l'idéal = on prend du retard ; en dessous = on est en avance.
- Feuille *Burndown Sprint 4* du Sprint Backlog.

### Burnup (santé du projet)

> Visualise le **réalisé cumulé** vs le **périmètre total** — et **montre l'impact des perturbations**.

- Deux courbes : **scope total** (peut monter quand une perturbation ajoute du travail) et **réalisé cumulé**.
- **Intérêt J4** : quand la perturbation J4 ajoute les US des 3 axes, la courbe de scope **monte visiblement** — c'est la preuve que le backlog a absorbé l'exigence.
- Feuille *Burnup global* du Release Planning.

## 4. Livrables attendus (rappel J4)

- [x] Matrice de risques complétée avec actions préventives → [analyse-risques-j4.md](analyse-risques-j4.md)
- [ ] Burndown du sprint actuel (Sprint 4) → Sprint Backlog v4.0
- [ ] Burnup du projet avec perturbations tracées → Release Planning v4.0
- [ ] Artefacts mis à jour intégrant les 3 axes (RGAA, i18n, scalabilité) → artefacts v4.0
- [ ] Bonus technique optionnel (PoC sur un axe)

## 5. Fil rouge de la semaine (les 5 perturbations)

| Perturbation | Nature | Réponse Scrum |
|---|---|---|
| J1 — produit (Mme Lefèvre / enseignant) | Nouveau besoin | US enseignant ajoutées au backlog |
| J2 — technique (benchmark LLM) | Contrainte technique | ADR-001 (choix LLM) |
| J3 — sécurité LLM + RGPD | Conformité | ADR-002, US-SEC-*, US-RGPD-* |
| J3-bis — SAR (Hugo Petit) | Conformité (droit d'accès) | US-J3B-1..5, `docs/legal/` |
| **J4 — passage à l'échelle** | **Succès / montée en charge** | **Matrice de risques + US 3 axes + artefacts v4.0** |

👉 J4 est la **synthèse de pilotage** : c'est là qu'on prouve au jury qu'on sait **anticiper** et **piloter par les faits**, pas seulement réagir.
