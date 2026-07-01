# TJ2.1 — Configuration des variables d'environnement pour la bascule de modèle LLM

> **Perturbation** : J2 — Technique (Latence inacceptable de génération)
> **Sprint** : Sprint 1 / Résolution Perturbation J2
> **Estimation** : 30 min
> **Assigné** : Azzedine AMARI
> **Statut** : Done

---

## 1. Objectif de la tâche

Configurer la prise en charge des nouveaux modèles légers identifiés lors du benchmark J2 pour résoudre le problème de latence (latence initiale de 45 secondes pour générer 10 questions). 

La bascule vers le modèle `llama3.2:3b` pour la configuration standard (sur CPU) ou vers les alternatives plus robustes comme `gpt-oss:20b` (MoE) et `gemma4:31b` (Gemma 4 31B) pour les configurations GPU doit s'effectuer de manière transparente par simple modification des fichiers de variables d'environnement (`.env`), sans nécessiter de modification du code Python.

---

## 2. Contexte du code actuel

| Fichier | Rôle | À modifier ? |
|---|---|---|
| [.env](../../../../.env) | Variables d'environnement locales de développement | **OUI** |
| [.env.example](../../../../.env.example) | Template de configuration de développement | **OUI** |
| [backend/apocal/settings.py](../../../../backend/apocal/settings.py) | Lecture des configurations via `python-decouple` | Non |

---

## 3. Spécifications techniques

### 3.1 Variables à configurer
Les variables à adapter dans le fichier `.env` pour piloter la bascule sur Ollama et le choix du modèle sont :
- **`LLM_BACKEND`** : Défini à `"ollama"` pour utiliser l'inférence locale souveraine et gratuite.
- **`OLLAMA_MODEL`** : Nom de l'identifiant du modèle cible dans le registre Ollama.
  - Configuration Standard (CPU local) : `llama3.2:3b` (Taille ~2.0 Go, latence p95 locale mesurée à 14.9 s ≤ 15 s).
  - Configuration Pro (GPU local) : `gpt-oss:20b` (Taille ~12 Go, latence p95 locale de 14.8 s).
  - Configuration Enterprise / Premium (GPU pro) : `gemma4:31b` (Gemma 4 31B, Taille ~18 Go, latence p95 locale de 24.0 s mais qualité maximale 4.6/5).
- **`OLLAMA_TIMEOUT`** : Délai maximal de la requête HTTP en secondes. Le maintenir à `600` pour éviter les timeouts lors des phases de génération sur CPU lent.

### 3.2 Exemple de configuration dans `.env`
Pour appliquer la bascule standard visant à passer sous le seuil des 15 secondes de latence :
```ini
# --- Configuration LLM (Bascule Perturbation J2) ---
LLM_BACKEND=ollama
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_TIMEOUT=600
```

---

## 4. Étapes détaillées

### Étape 1 — Modifier le fichier `.env` de développement
1. Ouvrir le fichier `.env` situé à la racine du projet.
2. Modifier la ligne `OLLAMA_MODEL=llama3.1:8b` par `OLLAMA_MODEL=llama3.2:3b`.
3. S'assurer que `LLM_BACKEND=ollama` est bien actif.

### Étape 2 — Mettre à jour le fichier `.env.example`
Appliquer la même modification dans `.env.example` pour s'assurer que les prochains développeurs de l'équipe démarrent avec le modèle optimisé par défaut.

### Étape 3 — Redémarrer le conteneur backend
Pour prendre en compte les modifications de variables d'environnement, redémarrer la stack de développement :
```bash
docker compose restart backend
```

---

## 5. Definition of Done

- [ ] La variable `OLLAMA_MODEL` dans le fichier `.env` pointe vers `llama3.2:3b`.
- [ ] Le fichier `.env.example` est synchronisé.
- [ ] Le redémarrage de la stack Docker compose charge correctement le nouveau modèle sans planter.
- [ ] L'appel à l'API de génération déclenche le modèle `llama3.2:3b` (vérifiable dans les logs du conteneur Ollama).

---

## 6. Pièges à éviter

1. **Nom de modèle incorrect** : Veiller à écrire exactement le tag Ollama tel qu'il figure dans la bibliothèque officielle (par exemple `llama3.2:3b` et non pas `llama3.2-3b`).
2. **Ne pas redémarrer le conteneur** : Django ou Gunicorn lit les variables d'environnement au démarrage du processus. Une modification de `.env` sans redémarrage de conteneur n'aura aucun effet en cours d'exécution.
