# 02 — Intégration LLM

Comment le LLM est câblé, comment changer de modèle, et comment ajouter un
nouveau backend (Hugging Face, OpenAI…).

---

## 🏗️ Architecture

```
backend/llm/
├── pdf_utils.py            ← extraction texte PDF (pypdf)
├── serializers.py          ← validation input
├── views.py                ← PingView + GenerateQuizView
├── urls.py
└── services/
    ├── base.py             ← interface LLMClient + LLMError
    ├── factory.py          ← get_llm_client() selon settings.LLM_BACKEND
    ├── ollama_client.py    ← OllamaLLMClient (HTTP + prompt + parsing)
    └── mock_client.py      ← MockLLMClient (déterministe, pour tests)
```

**Pattern utilisé** : Strategy + Factory.
Le code applicatif (`views.py`) ne dépend que de l'interface `LLMClient`.
Le client concret est choisi à l'exécution via `LLM_BACKEND` (env var).

---

## ⚙️ Changer de modèle Ollama

Le plus simple — éditer `.env` :

```bash
OLLAMA_MODEL=llama3.2:3b      # plus léger (2 Go) si vous avez peu de RAM
# ou
OLLAMA_MODEL=mistral:7b        # alternative
# ou
OLLAMA_MODEL=phi3:mini         # 2.3 Go, rapide
```

Puis :

```bash
docker compose down
docker compose up -d
docker exec apocal-ollama ollama pull <nouveau-modèle>
```

> 📝 **Documenter ce choix par un ADR** (voir [07-bonnes-pratiques.md](./07-bonnes-pratiques.md)). C'est attendu en perturbation J2.

---

## 🧠 Le prompt

Dans `services/ollama_client.py` :

```python
SYSTEM_PROMPT = """Tu es un assistant pédagogique francophone spécialisé en
génération de QCM. À partir du cours fourni, tu génères exactement 10 questions
à choix multiples pour aider un étudiant à réviser.

Règles ABSOLUES :
- Exactement 10 questions.
- Chaque question a EXACTEMENT 4 options.
- Une seule bonne réponse par question, indiquée par "correct_index" (0 à 3).
- Pas de markdown, pas de balises HTML, pas d'explications hors JSON.
- Sortie = JSON STRICT et UNIQUEMENT JSON.
"""
```

Astuces si la qualité est médiocre :

1. **Baisser la température** (déjà à 0.4) → encore plus factuel
2. **Ajouter des exemples (few-shot)** dans le SYSTEM_PROMPT
3. **Chunker le texte** si > 8000 chars : générer plusieurs lots de questions par chapitre
4. **Validation sémantique** : demander au LLM de vérifier sa propre sortie

---

## 🛡️ Validation post-LLM

`OllamaLLMClient._parse_and_validate` impose :

- JSON parseable (avec fallback regex `{...}`)
- Clé `questions` est une liste de **10** éléments
- Chaque question a `prompt` (str non vide) + `options` (4 str) + `correct_index` (int 0-3)

Si une seule condition échoue → `LLMError` levée → réponse HTTP 502.

> 🛡️ **C'est cette validation qui protège contre le prompt injection** (perturbation J3). Étendez-la pour ajouter des contrôles métier (mots interdits, longueur min/max, etc.).

---

## 🧪 Tester sans Ollama (mode mock)

Pour développer / lancer les tests sans Ollama :

```bash
# Dans .env
LLM_BACKEND=mock
```

Le `MockLLMClient` génère 10 questions déterministes basées sur un hash
du texte source. Pratique pour :

- Lancer la CI sans GPU
- Tester rapidement le front sans attendre 30s par requête
- Reproduire des bugs (même texte → mêmes questions)

---

## ➕ Ajouter un nouveau backend (ex. Hugging Face)

### 1. Créer la classe

```python
# backend/llm/services/huggingface_client.py
import requests
from django.conf import settings

from .base import LLMClient, LLMError


class HuggingFaceLLMClient(LLMClient):
    def __init__(self):
        self.token = settings.HF_TOKEN
        self.model = settings.HF_MODEL  # ex: "mistralai/Mistral-7B-Instruct-v0.3"

    def generate_quiz(self, source_text: str, title: str) -> list[dict]:
        # Appel inference.huggingface.co
        # Parsing similaire à OllamaClient
        # ...
        raise NotImplementedError("À toi de jouer !")
```

### 2. L'enregistrer dans la factory

```python
# backend/llm/services/factory.py
def get_llm_client() -> LLMClient:
    backend = (settings.LLM_BACKEND or "ollama").lower()
    if backend == "mock":
        return MockLLMClient()
    if backend == "ollama":
        return OllamaLLMClient()
    if backend == "huggingface":          # ← AJOUT
        from .huggingface_client import HuggingFaceLLMClient
        return HuggingFaceLLMClient()
    raise ValueError(f"LLM_BACKEND inconnu : {backend}")
```

### 3. Configurer

```bash
# Dans .env
LLM_BACKEND=huggingface
HF_TOKEN=hf_xxx
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3
```

### 4. Ajouter les settings Django

```python
# backend/apocal/settings.py
HF_TOKEN = config("HF_TOKEN", default="")
HF_MODEL = config("HF_MODEL", default="")
```

### 5. Écrire un test mock similaire

Dans `llm/tests.py`, ajouter un test avec `@override_settings(LLM_BACKEND="huggingface")` et un mock du `requests.post`.

---

## 👉 Suite

- [04-testing.md](./04-testing.md) — Tester l'intégration + tests adversariaux
- [07-bonnes-pratiques.md](./07-bonnes-pratiques.md) — Le format ADR pour documenter votre choix
