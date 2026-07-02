# Analyse de risques — Epic 14 : Internationalisation (i18n)

> **Équipe 11 · EduTutor IA** · Epic 14 — Internationalisation
> **Critères visés** : CA-J4-3 (risques en matrice probabilité × impact), CA-J4-4 (action préventive estimée par risque prioritaire)
> **Rédigé par** : Romain LEFEVRE + Frederick TOUFIK

---

## Méthode (barème officiel J4)

> **Exposition = Probabilité × Impact.** On traite d'abord les cases rouges (exposition ≥ 6).

| Probabilité (P) | | Impact (I) | |
|---|---|---|---|
| 1 | faible | 1 | mineur |
| 2 | moyenne | 2 | majeur |
| 3 | élevée | 3 | critique / bloquant |

| Exposition | Niveau | Traitement |
|---|---|---|
| 6 – 9 | 🔴 Critique | Action préventive prioritaire |
| 3 – 4 | 🟠 Modéré | Action planifiée / surveillance |
| 1 – 2 | 🟢 Faible | Accepté, surveillé |

---

## 1. Registre des risques i18n

| ID | Risque | Catégorie | P | I | **Expo** | Niveau | Responsable |
|----|--------|-----------|:-:|:-:|:--------:|--------|-------------|
| **R-I18N-01** | Interface mono-langue (FR codé en dur) → expansion européenne bloquée | i18n | 3 | 2 | **6** | 🔴 | Romain (QA) |
| **R-I18N-02** | Quiz généré dans une langue différente de celle du cours source | i18n / technique | 2 | 2 | **4** | 🟠 | Frederick (BE) |
| **R-I18N-03** | Traductions de l'interface de mauvaise qualité ou incohérentes entre les 3 langues | i18n / qualité | 2 | 1 | **2** | 🟢 | Romain (QA) |

## 2. Matrice de criticité (Probabilité × Impact)

```
 Impact ↑
 3 critique │
            │
 2 majeur   │              R-I18N-02 (4) 🟠   R-I18N-01 (6) 🔴
            │
 1 mineur   │              R-I18N-03 (2) 🟢
            └───────────────────────────────────────→ Probabilité
                1 faible      2 moyenne      3 élevée
```

🔴 **Case rouge (à traiter en priorité)** : R-I18N-01.

## 3. Du risque à l'action préventive

| Risque | Cause probable | Expo | Action préventive → item backlog (points) | Effet | US |
|--------|----------------|:----:|--------------------------------------------|:-----:|----|
| R-I18N-01 | Textes codés en dur dans les composants React et les templates Django, pas de lib i18n en place | 6 | « Externaliser les chaînes (i18next front + i18n Django back) + sélecteur de langue FR/EN/ES » · **8 pts · MUST** | P↓ | [US-I18N-01](user-stories-i18n.md#us-i18n-01) |
| R-I18N-02 | La langue du cours source n'est ni détectée ni forcée dans le prompt envoyé au LLM | 4 | « Détection de la langue du cours + prompt système imposant la langue cible + contrôle de validation de sortie » · **5 pts · SHOULD** | P↓ | [US-I18N-02](user-stories-i18n.md#us-i18n-02) |
| R-I18N-03 | Traduction manuelle ad hoc des 3 langues sans revue croisée ni glossaire commun | 2 | « Glossaire de termes métier FR/EN/ES + relecture croisée des fichiers de langue avant merge » · **2 pts · COULD** | I↓ | [US-I18N-03](user-stories-i18n.md#us-i18n-03) |

## 4. Synthèse et priorisation

| Priorité | Risques | Décision de pilotage |
|---|---|---|
| **P0 — case rouge** | R-I18N-01 | En tête de la Release 3 pour l'axe i18n ; bloquant pour toute annonce d'expansion européenne |
| **P1 — modéré à surveiller** | R-I18N-02 | Planifié en Release 3, dépend de la fiabilité de la détection de langue du cours |
| **P2 — faible** | R-I18N-03 | Accepté avec surveillance légère (relecture croisée), non bloquant |

**Total des actions préventives i18n descendues au backlog : 15 SP**, cohérent avec le total de l'Epic 14 (voir [user-stories-i18n.md](user-stories-i18n.md)) — confirme que l'axe i18n est traité comme un lot de Release 3 planifié, pas comme du code improvisé dans le Sprint 4.

## 5. Traçabilité

- Actions préventives → épic **EP-14 — Internationalisation**, à intégrer au Product Backlog v4.0 par le PO aux côtés des risques des axes scalabilité et RGAA.
- Décision d'architecture associée → [ADR-003 — Stratégie i18n](../../adr/ADR-003-strategie-i18n.md).
- Persona de référence → [persona-lucia.md](persona-lucia.md).
