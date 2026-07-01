# `models/` — pack de poids LLM pour livraison on-premise

> Référence : [ADR-0001](../docs/adr/ADR-001-choix-llm.md), [benchmark-llm.md](../docs/pertubations/j2/Etude_benchmarks/benchmark-llm.md), [docs/on-premise/prerequisites.md](../docs/on-premise/prerequisites.md)

Ce dossier contient les poids **pré-téléchargés** des modèles Ollama retenus,
un sous-dossier par tier client. C'est ce qui permet à `scripts/install.sh` /
`install.ps1` d'importer un modèle **sans aucun accès Internet** (client
air-gapped) via `ollama create -f Modelfile`, plutôt que `ollama pull`.

⚠️ **Les poids eux-mêmes (`*.gguf`, plusieurs Go) ne sont PAS versionnés dans
Git** (voir `.gitignore` local à ce dossier). Ils sont ajoutés à l'archive de
livraison au moment du packaging, pas au moment du clone du dépôt.

## Structure attendue par tier

| Dossier | Tier | Modèle Ollama | Taille poids | Décision |
|---|---|---|---:|---|
| `standard-llama3.2-3b/` | Standard (CPU) | `llama3.2:3b` | ~2.0 Go | ADR-0001 |
| `pro-gpt-oss-20b/` | Pro (GPU mid-range) | `gpt-oss:20b` | ~12 Go | ADR-0001 |
| `enterprise-gemma-4-31b-it/` | Enterprise (GPU haut de gamme) | `gemma-4-31b-it` (`gemma4:31b` sous Ollama) | ~18 Go | ADR-0001 |

Chaque dossier doit contenir, une fois le pack préparé :

```
models/<tier>/
  Modelfile        # référence les poids locaux, ex: FROM ./llama3.2-3b.gguf
  <poids>.gguf     # export local du modèle (voir procédure ci-dessous)
```

Un `Modelfile` squelette est déjà présent dans chaque dossier — à compléter
lors de la préparation du pack (l'export des poids n'est fait qu'une fois,
sur une machine **avec** accès Internet, jamais chez le client).

## Procédure de préparation du pack (côté éditeur, PAS côté client)

Sur une machine de build avec accès Internet :

```bash
# 1. Télécharger le modèle une fois
docker exec apocalipssi-2026-ollama ollama pull llama3.2:3b

# 2. Exporter le Modelfile généré par Ollama (référence les blobs internes)
docker exec apocalipssi-2026-ollama ollama show --modelfile llama3.2:3b \
  > models/standard-llama3.2-3b/Modelfile

# 3. Copier les blobs correspondants (voir ~/.ollama/models/blobs sur l'hôte de build)
#    dans models/standard-llama3.2-3b/, et adapter les chemins FROM du Modelfile
#    en chemins relatifs locaux avant de zipper le dossier dans l'archive de livraison.
```

Répéter pour `gpt-oss:20b` et `gemma4:31b` (tiers Pro / Enterprise).

## Pourquoi pas de simple `ollama pull` chez le client ?

Voir [docs/on-premise/prerequisites.md](../docs/on-premise/prerequisites.md)
et le piège #1 de [TJ2.4](../docs/J2/tasks/TOUFIK_Frederick_MENSAH-ASSIAKOLEY_Seer_NGUYEN_Thi_Van_Anh_TJ2-4_on_premise_doc.md) :
les serveurs d'établissements clients sont souvent derrière des proxys
restrictifs, voire totalement air-gapped. `scripts/install.sh`/`install.ps1`
n'appellent donc **jamais** `ollama pull` au premier démarrage — uniquement
`ollama create -f Modelfile` sur les poids déjà présents dans ce dossier.
