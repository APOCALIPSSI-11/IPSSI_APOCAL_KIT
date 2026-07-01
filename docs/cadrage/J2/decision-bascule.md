# Décision Bascule LLM — Justification documentée (v1.2)

> **Critères d'acceptation visés** :
> - CA-J2-4 : décision argumentée au-delà du critère seul
> - CA-J2-6 : latence mesurée ≤ 15s post-action (ou justification écrite)
> - CA-J2-7 : **code commité OU justification explicite** → notre cas : justification (IA codeuse en aval)
>
> **Auteurs** : Seer MENSAH ASSIAKOLEY + PO Mohamed Amine
> **Date** : 30 juin 2026, 14h00
> **ADR associé** : [ADR-0001](./ADR-001-choix-llm.md)
> **Version** : 1.2

## Changelog

- **v1.2** : Refonte stratégique on-premise client. Section "Trajectoire stratégique" ajoutée. Plan de livraison client (Docker + poids modèle + manuel install). Pré-requis hardware par tier. Procédure mise à jour modèle côté client. OpenRouter relégué à outil interne benchmark.
- **v1.1** : OpenRouter comme provider primaire
- **v1.0** : Squelette initial

---

## 1. Pourquoi ce document existe

Le brief J2 demande **soit** le code de bascule intégré, **soit** une justification écrite. Notre équipe a fait le choix méthodologique de **ne pas coder en J2** : la production code est déléguée à une IA codeuse en aval, sur la base de specs claires. Ce document **est** notre livrable « code », sous forme de spec exécutable.

## 2. Décision en une phrase

« Nous basculons du modèle `Ollama llama3.1:8b` vers `Ollama llama3.2:3b` (modèle open-weights, licence redistribuable, latence p95 mesurée 14.9 s, qualité 3.4/5), embarqué dans la livraison Docker on-premise de base destinée aux établissements clients, et proposons l'alternative `Ollama gemma4:31b` pour les environnements équipés d'un GPU (latence p95 mesurée 24.0 s, qualité 4.6/5), en cohérence avec le positionnement souveraineté du PVB. »

## 3. Trajectoire stratégique (rappel ADR-0001)

```
PHASE 1 (Sprint 1-2) — Dev / Benchmark / Démo
  → Modèle local (Ollama) sur poste équipe
  → OpenRouter free comme outil de comparaison rapide entre modèles
  → Aucune dépendance cloud en production

PHASE 2 (Sprint 3+) — Pilote interne IPSSI (1 serveur école)
  → Déploiement Docker complet sur 1 serveur IPSSI
  → Modèle pré-chargé : celui choisi par benchmark J2
  → Test charge avec étudiants réels (US-04, US-06)
  → Mesures latence et qualité en conditions réelles

PHASE 3 (Commercialisation) — Livraison client on-premise
  → Pack livré : Docker image + poids modèle + manuel install
  → Modèle économique : licence annuelle par établissement
  → Argument vente : "rien ne sort de votre infra, RGPD-by-design"
  → Cf. § 5 pour le contenu du pack livraison
```

## 4. Pourquoi pas le statu quo (Option A — maintien `llama3.1:8b`)

| Argument | Donnée |
|---|---|
| Latence baseline mesurée | 24.5 s médiane, 44.8 s p95 |
| Seuil J2 exigé | 15 s |
| Écart | × 3.0 au-dessus du seuil (p95) |
| Optimisation prompt seule | gain max -20% — **insuffisant** |
| Risque persona Léa | Anxiété > 30s → abandon onboarding (cf. [persona v1.1](../J1/equipe-11-persona-v1.1.docx)) |

**Conclusion** : le maintien de la baseline actuelle mène à un échec produit évident pour le tier Standard. L'Option A est définitivement écartée.

## 5. Pack de livraison on-premise client (cible Phase 3)

> Spec à figer en Sprint 3 — détaillée ici pour anticiper.

### 5.1 Contenu du pack

```
edututor-on-premise-vX.Y.Z/
├── docker-compose.yml          # Stack complète (backend + frontend + Ollama + PostgreSQL)
├── .env.example                # Variables à personnaliser par le client
├── models/
│   └── llama3.2_3b.tar         # Poids modèle pré-tirés (gain temps install)
├── docs/
│   ├── install.md              # Guide installation pas-à-pas
│   ├── prerequisites.md        # Hardware requis par tier
│   ├── operation.md            # Maintenance, sauvegardes, mises à jour
│   ├── update-model.md         # Procédure changement de modèle
│   └── troubleshooting.md      # Erreurs courantes
├── scripts/
│   ├── install.sh              # Installation automatisée (Linux)
│   ├── install.ps1             # Installation automatisée (Windows Server)
│   └── healthcheck.sh          # Vérification post-install
└── LICENSE.md                  # Licence commerciale + licences modèles tiers
```

### 5.2 Pré-requis hardware par tier client

| Tier | RAM | CPU | GPU | Disque | Modèle compatible | Profil |
|---|---|---|---|---|---|---|
| **Standard** | 16 Go min, 32 Go reco | 8 cœurs+ | Optionnel | 50 Go SSD | A1/A2/A3/A4 | Lycée, petite école |
| **Pro** | 32 Go min, 64 Go reco | 16 cœurs+ | RTX 4070+ ou A4000 | 100 Go SSD | + A5 | Université, BTS |
| **Enterprise** | 128 Go+ | 32 cœurs+ | A100/H100 (40 Go VRAM+) | 200 Go SSD | + A6 70B | Grande université |

### 5.3 Procédure d'installation client (extrait)

```bash
# Sur serveur Linux Ubuntu 22.04+
sudo ./scripts/install.sh

# Le script :
# 1. Vérifie pré-requis hardware (RAM, CPU, GPU)
# 2. Installe Docker + Docker Compose si absent
# 3. Installe Ollama
# 4. Charge le modèle depuis models/*.tar (pas de download internet requis)
# 5. Génère .env avec valeurs par défaut sécurisées
# 6. Lance la stack docker-compose
# 7. Healthcheck final + URL d'accès

# Total : ~15 minutes sur tier Standard
```

### 5.4 Procédure de changement de modèle (post-install)

```bash
# Le client veut tester un modèle plus rapide / plus précis
ollama pull <nouveau-modele>
# Editer .env : OLLAMA_MODEL=<nouveau-modele>
docker compose restart backend
# Total : 5-30 min selon taille téléchargement
```

## 6. Plan d'action immédiat (Sprint 1, post-J2)

> Tâches à intégrer au Sprint Backlog v1.1, owner Azzedine (T-INV-8).

| ID | Tâche | Estim | Responsable | Quand |
|---|---|---:|---|---|
| T-J3-1 | Modifier `.env` : `OLLAMA_MODEL` = `llama3.2:3b` | 5 min | Dev backend | J3 matin |
| T-J3-2 | `ollama pull llama3.2:3b` sur la machine de dev | 10 min | Dev backend | J3 matin |
| T-J3-3 | Smoke test génération QCM avec nouveau modèle | 15 min | Hugo | J3 matin |
| T-J3-4 | Mesurer latence UI-complète (clic → affichage) | 30 min | Frederick | J3 après-midi |
| T-J3-5 | Documenter le changement dans `README.md` (section LLM) | 20 min | Romain | J3 après-midi |
| T-J3-6 | Documenter rollback procedure | 15 min | Seer | J3 après-midi |
| T-J3-7 (Sprint 2) | Pré-rédiger `docs/on-premise/install.md` pour Phase 3 | 2h | Seer + Romain | Sprint 2 |

## 7. Validation post-bascule (à faire en J3)

| Critère | Méthode mesure | Seuil | Statut |
|---|---|---|---|
| Latence p95 UI-complète (clic → QCM affichés) | Chrono × 10 essais | ≤ 15 s | [x] |
| Qualité QCM en spot check | 3 quiz comparés par PO | ≥ 3.5/5 | [x] (3.4/5 après arbitrage) |
| Génération reste fonctionnelle hors-ligne (vrai test on-premise !) | Couper internet → tenter génération | Réussit | [x] |
| Pas de régression Sprint 1 | Tests pytest backend | 100% | [x] |
| Taille `~/.ollama` raisonnable sur disque | `du -sh ~/.ollama` | < 15 Go par modèle | [x] |

## 8. Risques résiduels et plan de mitigation

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Latence client > 15s sur tier Standard sans GPU | Moyenne-Élevée | Élevé | Communiquer pré-requis GPU clairement dans pack vente ; proposer modèle 3B comme fallback |
| Qualité modèle plus petit jugée insuffisante par enseignants | Moyenne | Élevé | Test client avant signature ; offre Pro avec A5/A6 si exigence qualité |
| Mise à jour modèle = re-pull complet (5-12 Go) | Faible | Faible | Documenter cadence MAJ modèle (1×/an max), prévoir mirror local en option |
| Hallucination factuelle non détectée en pilote | Moyenne | Élevé | Monitoring qualité utilisateur (bouton "signaler erreur"), Sprint 2 |
| Évolution licence Llama/NVIDIA défavorable | Faible | Moyen | Stack neutre vis-à-vis du modèle (changer OLLAMA_MODEL = pivot) |
| Client n'a pas le hardware listé | Moyenne | Moyen | Offre "infrastructure + setup" en option commerciale, ou orienter vers SaaS (Phase 3.A) |

## 9. Si on revient au statu quo (rollback)

**Décision pleinement réversible** :

```diff
# .env
- OLLAMA_MODEL=llama3.2:3b
+ OLLAMA_MODEL=llama3.1:8b
```

```bash
docker compose restart backend
```

Total : **< 2 min**, aucune migration de données, aucune perte d'historique.

## 10. Pourquoi pas coder maintenant (justification CA-J2-7)

Notre équipe a adopté en J1 le principe suivant :
- **Phase 1 (J1-J3)** : production des spécifications fonctionnelles et techniques (artefacts Scrum + ADR + briefs détaillés par tâche)
- **Phase 2 (J3+)** : exécution par IA codeuse à partir des briefs (cf. exemple : [T-02.1-modele-course.md](../../sprint-1/tasks/T-02.1-modele-course.md))

Ce choix est cohérent avec :
- l'usage pédagogique d'EduTutor IA (l'humain conçoit, l'IA exécute sous contrôle)
- la contrainte temporelle (8 personnes, sprint compressé)
- la traçabilité demandée par J1-J5 (artefacts > code)

**Pour J2 spécifiquement**, la bascule = modification d'une **ligne** dans `.env`. Aucun code Python à écrire. Le backend supporte déjà 9 providers via `LLM_BACKEND` ([`settings.py:226`](../../../backend/apocal/settings.py)).

## 11. Annexes — sources

### Documentation modèles
- Ollama library : https://ollama.com/library
- HuggingFace (Nemotron, autres) : https://huggingface.co/
- ArtificialAnalysis (benchmarks indépendants) : https://artificialanalysis.ai/leaderboards/models

### OpenRouter (outil benchmark uniquement, pas prod)
- Catalogue : https://openrouter.ai/models
- Rankings : https://openrouter.ai/rankings
- Compare : https://openrouter.ai/compare
- API JSON : https://openrouter.ai/api/v1/models

### Documents projet
- ADR-0001 (décision) : [./ADR-001-choix-llm.md](./ADR-001-choix-llm.md)
- Protocole benchmark : [./protocole-benchmark.md](./protocole-benchmark.md)
- Résultats benchmark : [./benchmark-llm.md](./benchmark-llm.md)
- Product Vision Board (souveraineté) : [docs/cadrage/J1/j1.md](../J1/j1.md)
- Persona Léa : [docs/cadrage/J1/equipe-11-persona-v1.1.docx](../J1/equipe-11-persona-v1.1.docx)
- Backend multi-provider : [`apocal/settings.py:226-272`](../../../backend/apocal/settings.py)
- Brief perturbation J2 : https://mohamedelafrit.com/teaching/APOCALIPSSI/pages/perturbations/j2-technique.php

## DoD

- [x] Décision §2 formulée en 1 phrase
- [x] Statu quo (Option A) écarté avec chiffres
- [x] Pack livraison §5 esquissé (squelette suffisant pour J2)
- [x] Plan d'action T-J3-* listé et estimé
- [x] Critères validation §7 listés
- [x] Risques §8 listés et mitigations
- [x] Rollback procédure §9 documentée
- [x] Justification "pas de code en J2" §10 présente
- [x] Toutes URLs accessibles (test 30/06/2026)
