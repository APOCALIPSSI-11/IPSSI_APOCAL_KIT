# T-SEC-01r — Séparation system/user Ollama (`/api/chat`)

> **User Story** : Reliquat J3 — *Sécurisation LLM (perturbation J3A)*
> **Sprint** : Sprint 3
> **Estimation** : 1h
> **Assigné** : Frederick TOUFIK (repris d'Azeddine AMARI)
> **Statut** : Todo

---

## 1. Objectif de la tâche

L'objectif est de sécuriser le prompt système utilisé avec Ollama en évitant les injections de prompt (Prompt Injection).
Actuellement, `ollama_client.py:32-35` appelle l'endpoint `/api/generate` d'Ollama et concatène le prompt système et le contenu utilisateur dans une seule chaîne. Il faut modifier cette implémentation pour appeler l'endpoint `/api/chat` d'Ollama avec une structure de messages séparant explicitement les rôles `system` et `user`.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [backend/llm/services/ollama_client.py](../../../backend/llm/services/ollama_client.py) | Client Ollama pour la génération de quiz | **OUI** |

---

## 3. Spécifications techniques

### 3.1 Modification de l'appel d'API Ollama

Actuellement, l'appel ressemble à :
```python
# Fichier : backend/llm/services/ollama_client.py
# Exemple de structure actuelle à modifier :
response = requests.post(
    f"{self.base_url}/api/generate",
    json={
        "model": self.model_name,
        "prompt": f"System: {system_prompt}\nUser: {user_prompt}",
        "stream": False
    }
)
```

Il faut le modifier pour cibler `/api/chat` et structurer les messages :
```python
response = requests.post(
    f"{self.base_url}/api/chat",
    json={
        "model": self.model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "stream": False
    }
)
# Adapter ensuite l'extraction de la réponse (response.json()['message']['content'])
```

---

## 4. Étapes détaillées

### Étape 1 — Modifier `ollama_client.py`
Ouvrir [backend/llm/services/ollama_client.py](../../../backend/llm/services/ollama_client.py) aux lignes 30-40 et remplacer l'appel `/api/generate` par un appel `/api/chat`.

### Étape 2 — Adapter l'extraction de la réponse
S'assurer d'extraire la chaîne de texte générée depuis la nouvelle structure de retour :
`content = response.json()["message"]["content"]` au lieu de `response.json()["response"]`.

### Étape 3 — Exécuter les tests locaux
Lancer les tests d'intégration/unitaires liés à Ollama pour vérifier que le parsing de la réponse et la génération fonctionnent toujours.

---

## 5. Definition of Done

- [ ] L'appel d'API vers Ollama utilise `/api/chat` avec des rôles distincts pour le système et l'utilisateur.
- [ ] L'extraction de la réponse gère correctement le format JSON renvoyé par `/api/chat`.
- [ ] Aucun appel vers `/api/generate` n'est conservé dans le client Ollama.
- [ ] Les tests LLM passent sans régression.

---

## 6. Pièges à éviter

1. **Erreur de structure de retour** : Ne pas oublier que le format de réponse de `/api/chat` est différent de `/api/generate`. Si vous oubliez d'adapter `response.json()["message"]["content"]`, le code lèvera une `KeyError` au moment de récupérer la réponse.
2. **Gestion du timeout et des erreurs HTTP** : Conserver la gestion robuste des exceptions (connexion refusée, timeout d'Ollama) déjà en place.
