# T-03.1 — Couche service LLM polymorphe (multi-providers)

> **User Story** : US-03 — *En tant que Léa, je veux générer 10 questions à choix multiples à partir de mon cours afin de tester mes connaissances.*
> **Sprint** : Sprint 1
> **Estimation** : 3h
> **Assigné** : Azeddine AMARI
> **Statut** : Done

---

## 1. Objectif de la tâche

Créer une couche de service LLM polymorphe (`LLMClient`) capable de basculer de manière transparente entre différents fournisseurs (providers) d'IA (Ollama local, OpenAI, Anthropic, Gemini, Groq, Cerebras, Mistral, OpenRouter, et un Mock pour le développement). 

Cette architecture permet de changer le moteur d'inférence en modifiant uniquement une variable d'environnement (`LLM_BACKEND`), sans modifier le code métier de l'application. Elle est essentielle pour résoudre la perturbation J2 en permettant de basculer d'un modèle lourd en local (Llama 3.1 8B CPU) vers des modèles plus légers (Llama 3.2 3B) ou vers des solutions cloud.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| `backend/llm/services/base.py` | Définition de l'interface abstraite `LLMClient` | **OUI** |
| `backend/llm/services/factory.py` | Factory pour instancier le bon client selon le `.env` | **OUI** |
| `backend/llm/services/ollama_client.py` | Implémentation du client local Ollama | **OUI** |
| `backend/llm/providers.py` | Registre central des métadonnées des fournisseurs | **OUI** |

---

## 3. Spécifications techniques

### 3.1 Classe de base (`LLMClient`)
Créer une classe de base abstraite définissant l'interface pour tous les clients LLM.
```python
class LLMError(Exception):
    """Exception levée en cas d'erreur de communication ou de génération LLM."""
    pass

class LLMClient:
    def generate_quiz(self, source_text: str, title: str) -> list[dict]:
        """Génère une liste de 10 QCM à partir d'un cours.
        
        Chaque QCM doit respecter le format :
        {
            "prompt": "...",
            "options": ["A", "B", "C", "D"],
            "correct_index": 0
        }
        """
        raise NotImplementedError("Chaque client doit implémenter cette méthode.")
```

### 3.2 Factory de clients
La factory doit lire la variable d'environnement `LLM_BACKEND` (ou le paramètre de configuration globale en base) et retourner l'instance de client appropriée.
```python
from django.conf import settings
from .ollama_client import OllamaLLMClient
from .mock_client import MockLLMClient
# importer les autres clients...

def get_llm_client() -> LLMClient:
    backend = settings.LLM_BACKEND.lower()
    
    if backend == "ollama":
        return OllamaLLMClient()
    elif backend == "mock":
        return MockLLMClient()
    # autres backends...
    else:
        raise ValueError(f"Backend LLM non supporté : {backend}")
```

### 3.3 Client Ollama
Le client Ollama interagit avec l'API locale d'Ollama (généralement `http://localhost:11434/api/generate`) via des requêtes HTTP POST (bibliothèque `requests`). Il doit :
- Passer le paramètre `"stream": False`.
- Activer `"format": "json"` pour obliger Ollama à produire du JSON structuré si le modèle le supporte.
- Utiliser un `timeout` configurable de longue durée (jusqu'à 600 s en CPU local).

---

## 4. Étapes détaillées

### Étape 1 — Définir l'interface de base
Dans `backend/llm/services/base.py`, définir `LLMClient` et l'exception `LLMError`.

### Étape 2 — Implémenter le client Ollama
Dans `backend/llm/services/ollama_client.py`, coder la classe `OllamaLLMClient` en utilisant la bibliothèque `requests` pour appeler le endpoint `/api/generate` d'Ollama.

### Étape 3 — Coder la Factory
Dans `backend/llm/services/factory.py`, implémenter `get_llm_client()` qui effectue l'aiguillage.

### Étape 4 — Déclarer le Mock pour les tests
Créer `backend/llm/services/mock_client.py` renvoyant 10 questions statiques de manière instantanée, afin de permettre le développement frontend et l'exécution des tests de CI sans nécessiter de serveur Ollama actif.

---

## 5. Definition of Done

- [ ] L'interface commune `LLMClient` et son exception `LLMError` sont créées.
- [ ] Le client `OllamaLLMClient` appelle correctement l'API locale d'Ollama et configure la température et le format JSON.
- [ ] Le client `MockLLMClient` renvoie un jeu de 10 QCM valides instantanément.
- [ ] La factory `get_llm_client` instancie le bon client selon `settings.LLM_BACKEND`.
- [ ] Un test unitaire valide que la factory fonctionne et que les exceptions sont levées pour les backends inconnus.

---

## 6. Pièges à éviter

1. **Timeouts trop courts** : Sur des architectures CPU pures locales, la génération de 10 questions peut prendre plus de 2 minutes. Configurer un timeout HTTP par défaut de 120 s provoquera des erreurs 502/504 en cascade. Préférer un timeout de 600 s.
2. **Couplage fort avec un modèle** : Le code du client ne doit pas avoir le nom du modèle écrit en dur. Il doit le récupérer dynamiquement depuis la configuration de l'application (ex: `settings.OLLAMA_MODEL`) pour permettre la bascule en modifiant uniquement le fichier `.env`.
