# Protocole de Benchmark LLM — J2 (v1.2)

> **Critère d'acceptation visé** : CA-J2-2 (Protocole écrit : runs, corpus, machine)
> **Date** : Mardi 30 juin 2026
> **Auteur** : Romain LEFEVRE (T-INV-2)
> **Relecteur** : Frederick TOUFIK
> **ADR associé** : [ADR-0001](./ADR-001-choix-llm.md)
> **Version** : 1.3

## Changelog

- **v1.3** : Ajout A6 `gemma-4-31b-it` (Google) dans les candidats. 6 modèles au total. Procédure de test Gemma 4 via OpenRouter puis fallback local documentée.
- **v1.2** : Refonte stratégique on-premise client. Sélection modèles par **tier hardware client**. OpenRouter recadré en outil de benchmark.
- **v1.1** : Intégration OpenRouter, 6 modèles testés
- **v1.0** : Squelette initial

---

## 1. Objectif

Sélectionner **le modèle LLM open-weights** à embarquer dans la livraison on-premise du produit EduTutor IA, afin que chaque établissement client puisse l'exécuter sur son propre serveur (souveraineté RGPD) avec une latence p95 ≤ 15 s pour générer 10 QCM.

**Hors scope** : choix d'un provider cloud (rejeté en [ADR-0001](./ADR-001-choix-llm.md) au profit du on-premise).

## 2. Architecture cible — on-premise client

```
Établissement client (datacenter / salle serveur)
┌──────────────────────────────────────────────────┐
│  Serveur applicatif (fourni par le client)      │
│  ┌────────────────┐   ┌──────────────────────┐  │
│  │ Backend Django │──▶│ Ollama (LLM local)   │  │
│  │ (Docker)       │   │ Modèle pré-chargé    │  │
│  └────────────────┘   └──────────────────────┘  │
│         ▲                                        │
│         │ HTTPS                                  │
└─────────┼────────────────────────────────────────┘
          │
          ▼
   Étudiants / Enseignants (LAN école / VPN)
```

**Aucune connexion sortante requise** pour la génération de QCM. Le PDF de cours ne quitte jamais le datacenter.

## 3. Tiers de hardware client cible

| Tier | RAM | GPU | Profil établissement | Modèles compatibles |
|---|---|---|---|---|
| **Standard** | 16-32 Go | Optionnel (CPU OK) | Lycée, petite école | A1, A2, A3, A4 |
| **Pro** | 32-64 Go | Mid-range (RTX 4070+) | Université, BTS | A1-A4 + A5 (GPT-OSS 20B MoE) + A6 (Gemma 4 31B) |
| **Enterprise** | 64-128 Go | Pro (A100/H100, 40+ Go VRAM) | Grande université, R&D | Tous + Llama 3.3 70B en option |

## 4. Modèles candidats (6 open-weights, tous redistribuables)

Tous installables via `ollama pull <nom>` ou import HuggingFace, puis exécutables hors ligne.

| Code | Modèle | Taille | Tier mini | Licence | Source officielle |
|---|---|---:|---|---|---|
| **A1** | `llama3.1:8b` *(baseline actuelle)* | ~4.7 Go | Standard | Llama 3 License | https://ollama.com/library/llama3.1 |
| **A2** | `llama3.2:3b` | ~2.0 Go | Standard | Llama 3 License | https://ollama.com/library/llama3.2 |
| **A3** | `phi3:3.8b` | ~2.3 Go | Standard | MIT | https://ollama.com/library/phi3 |
| **A4** | `nemotron-nano-9b-v2` *(via HF puis import Ollama)* | ~5.5 Go | Standard | NVIDIA Open Model | https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2 |
| **A5** | `gpt-oss:20b` | ~12 Go | Pro | Apache 2.0 | https://ollama.com/library/gpt-oss |
| **A6** ✨ | `gemma-4-31b-it` | ~18 Go | Pro | Apache 2.0 | https://ollama.com/library/gemma4:31b |

### Modèle optionnel "Enterprise tier" (hors benchmark principal)

| Code | Modèle | Taille | Notes |
|---|---|---:|---|
| A7 | `llama3.3:70b` | ~40 Go | À tester séparément pour offre "Enterprise" — hardware requis : 64+ Go RAM ou GPU 48+ Go VRAM |

### Note spécifique A6 — Gemma 4

Gemma 4 est officiellement disponible (Google DeepMind, avril 2026). Statut Ollama :

1. **Déploiement on-premise standard** : `ollama pull gemma4:31b` (le modèle a été officiellement porté sur la bibliothèque Ollama).
2. **Licence** : Google a publié Gemma 4 sous licence permissive Apache 2.0, ce qui lève les restrictions des Gemma Terms précédents et simplifie grandement la distribution commerciale intégrée.

### Modèles écartés (raison documentée)

| Modèle | Pourquoi écarté |
|---|---|
| `qwen3:80b` | Trop lourd pour tier Standard/Pro, équivalent à Llama 70B sur Enterprise |
| `mistral:7b` | Bonne alternative mais retiré pour ne pas multiplier les tests — à reconsidérer si A2 décevant |
| `gpt-oss:120b` | Surdimensionné (~60 Go RAM), redondant avec A5 (20B) sur le même use case |

## 5. Téléchargement local des modèles open-weights

Procédure à inclure dans la doc client on-premise :

```bash
# 1. Installer Ollama (Linux/Mac/Windows)
curl -fsSL https://ollama.com/install.sh | sh

# 2. Tirer le modèle retenu (exemple si décision = A2)
ollama pull llama3.2:3b

# 3. Vérifier
ollama list
# NAME              ID            SIZE     MODIFIED
# llama3.2:3b       ...           2.0 GB   ...

# 4. Configurer le backend EduTutor (.env)
LLM_BACKEND=ollama
OLLAMA_MODEL=llama3.2:3b
OLLAMA_HOST=http://ollama:11434

# 5. Démarrer
docker compose up -d
```

**Garantie de pérennité** : une fois téléchargés, les poids restent sur le serveur client indéfiniment, sans dépendance externe.

## 6. Corpus de test (3 cours réels)

| ID | Titre | Source | Taille | Domaine |
|---|---|---|---:|---|
| C1 | Révolution française | PDF | 5 pages | SHS |
| C2 | Introduction au Marketing digital | Texte collé | 1500 mots | Gestion |
| C3 | Algorithmique : Le Tri par fusion | PDF | 8 pages | Sciences |

Critères de choix : domaines variés, tailles variées (court/moyen/long ≤ 5 Mo), ≥ 1 contenu factuel pour tester les hallucinations. Archive dans `docs/cadrage/J2/corpus/`.

## 7. Machine de mesure (équipe APOCAL'IPSSI)

| Composant | Valeur |
|---|---|
| CPU | Intel Core i7-12700H (14 cœurs, 20 threads) |
| RAM | 32 Go DDR4 3200 MHz |
| GPU | NVIDIA GeForce RTX 3060 Laptop (6 Go VRAM) |
| OS | Windows 11 Professionnel |
| Ollama version | 0.3.14 |
| Backend Django | branche `main` à `a7c8e9b` |

> Cette machine **représente le tier Standard** côté client. Pour valider le tier Pro/Enterprise, des mesures complémentaires devront être faites sur un serveur dédié (à planifier Sprint 3).

## 8. Méthodologie de mesure

### 8.1 Latence (médiane + p95)

| Paramètre | Valeur |
|---|---|
| Runs par couple (modèle × cours) | 5 |
| Total par modèle | 15 mesures |
| Total global | 6 modèles × 15 = **90 mesures** |
| Timeout | 600 s (Ollama) / 60 s (OpenRouter pour A6) |
| Préchauffage | 1 run "à blanc" non compté avant les 5 mesures |

**Procédure** : POST API génération → mesure temps wall-clock → vérification JSON 10 QCM × 4 options × 1 correct_index. Stockage : `docs/cadrage/J2/measurements-latency.csv`.

### 8.2 Qualité subjective (/5, 3 testeurs)

| Paramètre | Valeur |
|---|---|
| Testeurs | 3 (T1, T2, T3) |
| Échantillons par modèle | 3 (1 par cours, tiré au sort) |
| Total notations | 6 modèles × 3 cours × 3 testeurs = **54 notations** |
| Mode | Test à l'aveugle (Quiz A→F anonymisés) |

**Grille /5** :

| Note | Critère |
|---|---|
| 5 | Toutes pertinentes, sans erreur factuelle, distractors crédibles |
| 4 | 1-2 questions faibles, aucune erreur factuelle |
| 3 | 3-4 questions discutables OU 1 erreur factuelle mineure |
| 2 | Plusieurs erreurs factuelles OU hors sujet |
| 1 | Inutilisable (hallucinations, absurdités) |

### 8.3 Empreinte technique

| Métrique | Outil |
|---|---|
| RAM en génération | `htop` / Task Manager / `ollama ps` |
| Disque modèle | `ollama list` |
| VRAM (si GPU) | `nvidia-smi` |

## 9. Sources de données — où trouver les valeurs

> Tableau à reporter dans [benchmark-llm.md](./benchmark-llm.md) à mesure que les chiffres tombent.

| Colonne du benchmark | Source primaire | Source secondaire (cross-check) |
|---|---|---|
| Latence locale (A1-A5 sur notre machine) | Mesure perso via script §11 | — |
| Latence projetée cloud | [ArtificialAnalysis.ai](https://artificialanalysis.ai/leaderboards/models) (TTFT + throughput) | [OpenRouter rankings](https://openrouter.ai/rankings) |
| Throughput tokens/s | [ArtificialAnalysis](https://artificialanalysis.ai) | OpenRouter rankings |
| Qualité /5 | Test à l'aveugle 3 testeurs (§8.2) | — (subjectif, pas de source publique) |
| RAM en génération | `ollama ps` pendant un run | Page Ollama (https://ollama.com/library/X) |
| Disque modèle | `ollama list` après pull | Page Ollama |
| VRAM | `nvidia-smi` | Page modèle HuggingFace |
| Licence | Fiche modèle HuggingFace / Ollama | Tableau §4 ci-dessus |

### Astuce : pré-estimation latence locale sans mesure

Si on connaît le **throughput tokens/sec** publié sur ArtificialAnalysis pour un modèle, on peut **pré-estimer** la latence locale par :

```
latence_estimée ≈ TTFT + (tokens_output / throughput)
```

Avec `tokens_output ≈ 1500` pour 10 QCM. Ex pour Nemotron Nano 9B :
- TTFT publié : 1.62 s
- Throughput publié : 141 tok/s
- Latence projetée : 1.62 + (1500/141) ≈ **12.3 s** ✅

> Attention : ces chiffres viennent d'une infra cloud GPU (Together/Fireworks). Sur CPU local, la latence sera **5 à 10× plus élevée**. Pour validation finale → mesure réelle obligatoire.

## 10. Biais à éviter

| Biais | Mitigation |
|---|---|
| Cache Ollama (1er run plus lent) | 1 run préchauffage non compté |
| Autres process consomment ressources | Fermer apps lourdes pendant mesures |
| Effet d'apprentissage testeur | Randomiser ordre quiz |
| Biais favorable modèle connu | Test à l'aveugle (Quiz A→E) |
| Prompt non identique | Template prompt commun (cf. `backend/llm/`) |
| Machine non représentative tier client | Documenter limites de généralisation §7 |

## 11. Annexe — Script de mesure (jetable)

À placer dans `scripts/benchmark.py` pour la session de mesure. **Pas du code de production** : outil de mesure ponctuel.

```python
"""Benchmark latence des modèles Ollama locaux pour T-INV-4.
Usage: python scripts/benchmark.py
Pré-requis: ollama serve actif, modèles pull-és
Sortie: measurements-latency.csv

Note A6 (Gemma 4): tester via OpenRouter en parallèle si pas dispo Ollama (cf §4).
"""
import csv, json, statistics, time
import urllib.request

OLLAMA_URL = "http://localhost:11434/api/generate"
MODELS = [
    "llama3.1:8b",        # A1
    "llama3.2:3b",        # A2
    "phi3:3.8b",          # A3
    "nemotron:9b",        # A4 (nom Ollama à vérifier après import HF)
    "gpt-oss:20b",        # A5
    "gemma3:27b",         # A6 (fallback local de Gemma 4 si pas encore sur Ollama)
]
CORPUS_PATHS = ["corpus/C1.txt", "corpus/C2.txt", "corpus/C3.txt"]
RUNS = 5

PROMPT_TEMPLATE = """Génère exactement 10 QCM à partir du cours suivant.
Format JSON strict: [{{"q": "...", "options": ["A","B","C","D"], "correct": 0}}, ...]

COURS:
{course}
"""

def call(model: str, prompt: str) -> float:
    payload = json.dumps({"model": model, "prompt": prompt, "stream": False}).encode()
    req = urllib.request.Request(OLLAMA_URL, data=payload,
                                  headers={"Content-Type": "application/json"})
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=600) as r:
        r.read()
    return time.time() - t0

rows = [["model", "course", "run", "latency_s"]]
for model in MODELS:
    # Préchauffage
    call(model, PROMPT_TEMPLATE.format(course="warmup"))
    for course_path in CORPUS_PATHS:
        course = open(course_path).read()[:4000]
        prompt = PROMPT_TEMPLATE.format(course=course)
        times = []
        for run in range(1, RUNS + 1):
            try:
                t = call(model, prompt)
                rows.append([model, course_path, run, round(t, 2)])
                times.append(t)
                print(f"{model} / {course_path} / run {run}: {t:.2f}s")
            except Exception as e:
                rows.append([model, course_path, run, f"FAIL: {e}"])
        if times:
            med = statistics.median(times)
            p95 = sorted(times)[-1]  # approximation simple sur 5 runs
            print(f"  → médiane={med:.2f}s, p95={p95:.2f}s")

with open("measurements-latency.csv", "w", newline="") as f:
    csv.writer(f).writerows(rows)
print("Done → measurements-latency.csv")
```

> **Note**: 90 mesures totales (avec A6 Gemma), ~40-75 min selon machine. Lancer en B6 du plan horaire (11h00).

## 12. Sources et références

- ArtificialAnalysis (benchmarks indépendants) : https://artificialanalysis.ai/leaderboards/models
- OpenRouter rankings (usage réel) : https://openrouter.ai/rankings
- OpenRouter compare : https://openrouter.ai/compare
- OpenRouter API JSON : https://openrouter.ai/api/v1/models
- Ollama library : https://ollama.com/library
- ADR-0001 (décision) : [./ADR-001-choix-llm.md](./ADR-001-choix-llm.md)
- Backend multi-provider : [`apocal/settings.py:226-272`](../../../backend/apocal/settings.py)

## DoD

- [x] 6 modèles A1-A6 confirmés (tier Standard + Pro)
- [x] Statut Ollama de Gemma 4 vérifié (Disponible sous `gemma4:31b` et sous licence Apache 2.0)
- [x] Corpus C1/C2/C3 sélectionné et archivé
- [x] Machine de mesure documentée §7
- [x] 3 testeurs identifiés
- [x] Script `scripts/benchmark.py` opérationnel (smoke test 1 modèle 1 cours)
- [x] Procédure téléchargement modèle client documentée §5
- [x] Protocole validé par Frederick (relecteur) avant lancement
