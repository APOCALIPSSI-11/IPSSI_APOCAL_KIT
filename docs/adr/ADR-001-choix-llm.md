# ADR-0001 : Utiliser un modèle LLM open-weights déployé on-premise chez le client

> **Format** : [MADR](https://blog.stephane-robert.info/docs/documenter/concevoir/adr/) — Markdown Any Decision Records
> **Date** : 30 juin 2026
> **Auteurs** : 
Azeddine AMARI,
Frederick TOUFFIK,
Hugo Havet,
Romain Lefèvre,
Redouane ID SOUGOU,
Seer MENSAH ASSIAKOLEY,
Thi Van Anh NGUYEN 
 
> **Version** : 1.3

## Changelog

- **v1.3** : Ajout `gemma-4-31b-it` (Google) dans la liste des candidats Option B
- **v1.2** : Refonte stratégique on-premise, template MADR
- **v1.1** : Intégration OpenRouter (déprécié → v1.2)
- **v1.0** : Squelette initial

## Statut

**Accepted** — Validé à l'unanimité après le benchmark final du Sprint Review J2 (30 juin 2026, 17h45).

## Contexte et problème

EduTutor IA génère 10 QCM à partir d'un cours utilisateur (US-03). Configuration actuelle : `Ollama llama3.1:8b` en local CPU → latence mesurée **45 secondes** (signalée par beta-testeur, 30/06/2026), incompatible avec le seuil produit de 15 s ([persona Léa](../J1/equipe-11-persona-v1.1.docx), anxiété > 30 s).

**Contrainte stratégique** : le [Product Vision Board](../J1/j1.md) positionne EduTutor IA comme produit **local-first, souveraineté des données, conformité RGPD**, vendu en **licence on-premise** aux établissements. Toute solution dépendant d'une API cloud tiers contredit cette promesse commerciale.

## Decision Drivers

1. **Souveraineté RGPD** : aucun PDF de cours ne doit sortir de l'infrastructure du client
2. **Latence p95 ≤ 15 s** mesurée sur le hardware cible client (UI complète)
3. **Qualité subjective ≥ 3.5/5** (test à l'aveugle, 3 testeurs)
4. **Matériel client réaliste** : serveur établissement type 32-64 Go RAM, ±1 GPU mid-range (RTX 4090 24 Go ou A4000)
5. **Licence du modèle compatible** avec redistribution commerciale (livraison + licence client)
6. **Réversibilité** : pivot facile entre modèles via simple variable d'environnement

## Options considérées

### Option A — Maintien `llama3.1:8b` + optimisation prompt
- ✅ Aucun changement infra
- ❌ Gain latence -20% au mieux → **ne passe pas 15 s**

### Option B — Bascule vers un modèle open-weights plus léger
- ✅ Souverain (Ollama local), RGPD ✅, licence redistribuable
- ✅ 6 candidats : `llama3.2:3b`, `phi3:3.8b`, `nemotron-nano-9b-v2`, `gpt-oss:20b` (MoE), `gemma-4-31b-it` (Google dense), + `llama3.1:8b` baseline
- ⚠️ Qualité à valider par benchmark (cf. [benchmark-llm.md](./benchmark-llm.md))

### Option C — API cloud tiers (OpenRouter, Groq, Gemini)
- ✅ Latence ultra-faible (1-5 s)
- ❌ **Contredit la promesse souveraineté** du PVB → vente établissement compromise
- ❌ Backend providers opaques (RGPD non garanti)
- → **Utilisé uniquement comme outil de benchmark pré-déploiement**, pas en production

### Option D — SaaS hébergé par l'éditeur (FR)
- ✅ Latence maîtrisée, souverain France
- ❌ Modèle économique licence on-premise vs SaaS → décision business hors scope ADR
- → **Réservée pour une phase 3 ultérieure**, pas pour le MVP

## Décision

**Nous choisissons l'Option B** : bascule vers un modèle open-weights léger, déployé **on-premise** via Ollama chez chaque établissement client.

Les modèles retenus après benchmark (cf. [benchmark-llm.md](./benchmark-llm.md)) sont :
1. **`llama3.2:3b`** (A2) pour la configuration **Standard** (serveurs CPU uniquement) : latence p95 de 14.9 s ≤ 15 s, au prix d'un arbitrage sur la qualité (3.4/5) compensé par une optimisation future de prompt.
2. **`gpt-oss:20b`** (A5) pour la configuration **Pro** (serveurs avec GPU mid-range) : latence p95 de 14.8 s et excellente qualité (3.8/5).
3. **`gemma-4-31b-it`** (A6) comme option de référence pour la configuration **Enterprise** (ou offre Pro Premium avec GPU dédié) : qualité supérieure (4.6/5) sous licence Apache 2.0.

## Conséquences

### Positives
- Cohérence stratégique avec le PVB (souveraineté + RGPD + licence on-premise)
- Aucun coût d'inférence cloud côté éditeur ni côté client
- Bascule = changement de `.env` (`OLLAMA_MODEL=...`), **zéro code Python**
- Catalogue de modèles ouvert : pivot futur trivial sans changer d'architecture

### Négatives
- Le client doit fournir le hardware (32-64 Go RAM minimum) → fiche technique de pré-requis à rédiger
- Latence dépend de chaque déploiement client → seuil 15 s non garanti uniformément
- Maintien à jour des poids modèle côté client (procédure `ollama pull` à documenter)

### Neutres
- Modèles `:free` d'OpenRouter restent utilisables pour démos commerciales / sprint reviews avant signature client
- L'architecture multi-provider du backend ([`settings.py:226`](../../backend/apocal/settings.py)) reste intacte — aucune simplification ni complexification

## Liens

- Protocole de benchmark : [protocole-benchmark.md](../pertubations/j2/Etude_benchmarks/protocole-benchmark.md)
- Résultats benchmark : [benchmark-llm.md](../pertubations/j2/Etude_benchmarks/benchmark-llm.md)
- Justification opérationnelle de la bascule : [decision-bascule.md](../pertubations/j2/Etude_benchmarks/decision-bascule.md)
- Product Vision Board (contrainte souveraineté) : [docs/cadrage/artefacts/equipe-11-product-vision-board-v1.1.docx](../cadrage/artefacts/equipe-11-product-vision-board-v1.1.docx)
- Brief perturbation J2 : https://mohamedelafrit.com/teaching/APOCALIPSSI/pages/perturbations/j2-technique.php
- Template MADR : https://blog.stephane-robert.info/docs/documenter/concevoir/adr/
