# Prérequis matériels — installation on-premise EduTutor IA

> **Tâche** : [TJ2.4](../J2/tasks/TOUFIK_Frederick_MENSAH-ASSIAKOLEY_Seer_NGUYEN_Thi_Van_Anh_TJ2-4_on_premise_doc.md)
> **Décision modèles** : [ADR-0001](../adr/ADR-001-choix-llm.md)
> **Mesures** : [benchmark-llm.md](../pertubations/j2/Etude_benchmarks/benchmark-llm.md)

Ce document liste, pour chaque tier de licence on-premise, le matériel
minimum requis chez le client et le modèle LLM Ollama associé. Les chiffres
de latence/qualité/RAM proviennent des mesures réelles du benchmark J2 — ce
document ne les reproduit pas intégralement, il ne donne que la synthèse
opérationnelle nécessaire au dimensionnement serveur.

## Synthèse par tier

| Tier | Modèle Ollama | RAM serveur mini | GPU | VRAM mini | Disque (poids + marge) | Latence p95 mesurée |
|---|---|---|---|---|---|---:|
| **Standard** | `llama3.2:3b` | 8 Go | Aucun (CPU) | — | ~10 Go | 14.9 s |
| **Pro** | `gpt-oss:20b` | 32 Go | Mid-range (RTX 4070+, A4000) | 16 Go | ~30 Go | 14.8 s |
| **Enterprise** | `gemma-4-31b-it` (`gemma4:31b`) | 64 Go | Haut de gamme (RTX 4090, A100) | 24 Go | ~40 Go | 24.0 s |

> Latence p95 = temps de génération des 10 QCM, mesuré sur le cours de
> référence C3 (cf. [benchmark-llm.md §5](../pertubations/j2/Etude_benchmarks/benchmark-llm.md)).
> Le tier Enterprise dépasse le seuil produit de 15 s : il est vendu pour sa
> **qualité** (4.6/5) plutôt que sa vitesse — à positionner commercialement
> en conséquence (cf. ADR-0001 §Conséquences négatives).

## Détail par tier

### Tier Standard (CPU uniquement)

- **Usage cible** : petit établissement, budget serveur contraint, pas de GPU disponible.
- **CPU** : 8 cœurs modernes minimum (génération purement CPU, sensible au nombre de cœurs).
- **RAM** : 8 Go minimum dédiés à Ollama (le modèle utilise ~2.8 Go en génération), 16 Go recommandés pour laisser de la marge à PostgreSQL/Django/frontend sur la même machine.
- **Disque** : ~2 Go pour les poids du modèle + marge pour PostgreSQL et les logs (10 Go recommandé).
- **GPU** : aucun requis.
- **Réseau** : aucun accès Internet requis en fonctionnement normal (air-gapped supporté, cf. [install.md](./install.md)).

### Tier Pro (GPU mid-range)

- **Usage cible** : établissement de taille moyenne, latence critique, budget GPU disponible.
- **CPU** : 8 cœurs minimum (la génération est déchargée sur GPU, le CPU sert au reste de la stack).
- **RAM** : 32 Go minimum (le modèle utilise ~15.4 Go en génération).
- **GPU** : un GPU mid-range avec au moins 16 Go de VRAM (RTX 4070 Ti/4080, A4000) — mesures faites sur RTX 4090 24 Go.
- **Disque** : ~12 Go pour les poids + marge (30 Go recommandé).
- **Réseau** : aucun accès Internet requis en fonctionnement normal.

### Tier Enterprise (GPU haut de gamme)

- **Usage cible** : établissement premium, priorité à la qualité pédagogique plutôt qu'à la latence stricte.
- **CPU** : 8 cœurs minimum.
- **RAM** : 64 Go minimum (le modèle utilise ~24.2 Go en génération).
- **GPU** : GPU haut de gamme avec au moins 24 Go de VRAM (RTX 4090, A100, A6000).
- **Disque** : ~18 Go pour les poids + marge (40 Go recommandé).
- **Réseau** : aucun accès Internet requis en fonctionnement normal.
- **Option premium** : `llama3.3:70b` reste une option de référence hors-catalogue standard pour les clients disposant de 48+ Go de VRAM (cf. [benchmark-llm.md §9](../pertubations/j2/Etude_benchmarks/benchmark-llm.md)) — non couverte par le pack de livraison par défaut, à chiffrer au cas par cas.

## Logiciels requis (tous tiers)

- **Docker Engine** ≥ 24.0 et **Docker Compose** v2 (`docker compose version`).
- **OS** : Linux (Ubuntu 22.04 LTS recommandé) ou Windows Server 2019+ avec Docker Desktop / Docker Engine.
- **Droits d'administration** : l'utilisateur exécutant l'installation doit pouvoir piloter le démon Docker (`sudo` ou groupe `docker` sous Linux ; session administrateur sous Windows).
- **`openssl`** disponible en ligne de commande (génération des secrets `.env`, présent par défaut sur la plupart des distributions Linux).

## Ce qui n'est **pas** requis

- **Aucun accès Internet sortant permanent.** Les poids des modèles sont livrés pré-téléchargés dans l'archive de livraison (`models/`, cf. [models/README.md](../../models/README.md)) et importés localement via `ollama create`. Un accès Internet n'est utile qu'au moment du build initial des images Docker si celles-ci ne sont pas déjà fournies pré-construites dans l'archive.
- **Aucune carte GPU pour le tier Standard.**
